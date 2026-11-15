#!/usr/bin/env python3
"""Manual Linux backup candidate. No scheduling, deletion of old backups or restore."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
from datetime import datetime, timezone
from urllib.parse import quote, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler


class BackupError(Exception):
    pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise BackupError('REDIRECT_REFUSED')


def protected_file(path):
    path = Path(path)
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
        raise BackupError('UNSAFE_CONFIG_PERMISSIONS')
    return path


def validate_config(config):
    project = config['project_ref']
    if project != 'dpcyahwodzpolzuznrrq':
        raise BackupError('UNEXPECTED_PROJECT')
    if config['supabase_url'] != f'https://{project}.supabase.co':
        raise BackupError('UNEXPECTED_STORAGE_HOST')
    if config['storage_buckets'] != ['pet-documents']:
        raise BackupError('UNEXPECTED_BUCKET_SCOPE')
    destination = PurePosixPath(config['destination'])
    if not destination.is_absolute() or str(destination) != '/var/lib/petsanny-backup':
        raise BackupError('UNEXPECTED_DESTINATION')
    if config.get('schedule_enabled') or config.get('retention_delete_enabled'):
        raise BackupError('MANUAL_ONLY')


def safe_segment(value):
    if not isinstance(value, str) or not value or value in ('.', '..') or any(c in value for c in '/\\\x00'):
        raise BackupError('INVALID_OBJECT_NAME')
    return value


def object_filename(bucket, key):
    # Never use remote object names as local filesystem paths.
    return hashlib.sha256((bucket + '/' + key).encode()).hexdigest()


def validate_storage_key(key):
    # Format/scope check only; the Storage API still verifies the signature.
    try:
        if len(key) > 16384 or key.count('.') != 2:
            raise ValueError()
        payload = json.loads(base64.urlsafe_b64decode(key.split('.')[1] + '==='))
        if payload.get('role') != 'service_role' or payload.get('ref') != 'dpcyahwodzpolzuznrrq':
            raise ValueError()
    except (ValueError, TypeError, KeyError, AttributeError):
        raise BackupError('LEGACY_STORAGE_KEY_REQUIRED') from None


class Storage:
    def __init__(self, origin, key):
        if urlsplit(origin).scheme != 'https':
            raise BackupError('TLS_REQUIRED')
        self.origin = origin
        self.headers = {'apikey': key, 'Authorization': 'Bearer ' + key}
        self.opener = build_opener(NoRedirect())

    def inventory(self, bucket):
        result = []
        folders = ['']
        visited = set()
        while folders:
            prefix = folders.pop()
            if prefix in visited or len(visited) > 100000:
                raise BackupError('STORAGE_FOLDER_LIMIT')
            visited.add(prefix)
            offset = 0
            while True:
                payload = json.dumps({'prefix': prefix, 'limit': 100, 'offset': offset,
                                      'sortBy': {'column': 'name', 'order': 'asc'}}).encode()
                request = Request(self.origin + '/storage/v1/object/list/' + quote(bucket, safe=''),
                                  data=payload, headers={**self.headers, 'Content-Type': 'application/json'})
                with self.opener.open(request, timeout=90) as response:
                    page = json.load(response)
                if not isinstance(page, list) or len(page) > 100:
                    raise BackupError('INVALID_STORAGE_LIST')
                for item in page:
                    segment = safe_segment(item['name'])
                    name = prefix + '/' + segment if prefix else segment
                    if item.get('id') is None and item.get('metadata') is None:
                        folders.append(name)
                    elif item.get('id'):
                        result.append({'bucket': bucket, 'key': name, 'id': item['id'],
                                       'updated_at': item.get('updated_at'),
                                       'size': (item.get('metadata') or {}).get('size')})
                    else:
                        raise BackupError('INVALID_STORAGE_OBJECT')
                offset += len(page)
                if offset > 100000 or len(result) > 100000:
                    raise BackupError('STORAGE_OBJECT_LIMIT')
                if len(page) < 100:
                    break
        if len({item['key'] for item in result}) != len(result):
            raise BackupError('DUPLICATE_STORAGE_OBJECT')
        return sorted(result, key=lambda item: item['key'])

    def download(self, item, destination):
        url = self.origin + '/storage/v1/object/authenticated/' + quote(item['bucket'], safe='') + '/' + quote(item['key'], safe='/')
        digest = hashlib.sha256()
        size = 0
        with self.opener.open(Request(url, headers=self.headers), timeout=90) as response, destination.open('xb') as output:
            while chunk := response.read(1024 * 1024):
                size += len(chunk)
                if size > 10 * 1024 * 1024 or shutil.disk_usage(destination.parent).free < 2 * 1024**3:
                    raise BackupError('STORAGE_SIZE_OR_DISK_LIMIT')
                output.write(chunk)
                digest.update(chunk)
        expected = item.get('size')
        if expected is not None and int(expected) != size:
            raise BackupError('STORAGE_SIZE_MISMATCH')
        return {**item, 'file': destination.name, 'bytes': size, 'sha256': digest.hexdigest()}


def run_tool(args, env):
    # Do not print tools' output: connection errors may contain credentials.
    def limit_output():
        import resource
        resource.setrlimit(resource.RLIMIT_FSIZE, (8 * 1024**3, 8 * 1024**3))
    result = subprocess.run(args, env=env, stdin=subprocess.DEVNULL, preexec_fn=limit_output,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=3600)
    if result.returncode:
        raise BackupError('EXPORT_TOOL_FAILED')


def encrypt(work, recipient_file, partial):
    with partial.open('xb') as output:
        process = subprocess.Popen(['age', '--encrypt', '--recipients-file', str(recipient_file)],
                                   stdin=subprocess.PIPE, stdout=output, stderr=subprocess.DEVNULL)
        try:
            with tarfile.open(fileobj=process.stdin, mode='w|') as archive:
                for path in sorted(work.iterdir()):
                    archive.add(path, arcname=path.name)
            process.stdin.close()
            if process.wait(timeout=3600):
                raise BackupError('ENCRYPTION_FAILED')
            output.flush()
            os.fsync(output.fileno())
        except BaseException:
            process.kill()
            process.wait()
            raise


def backup(config_path):
    if sys.platform != 'linux':
        raise BackupError('LINUX_REQUIRED')
    import fcntl
    os.umask(0o077)
    config = json.loads(protected_file(config_path).read_text())
    validate_config(config)
    for executable in ('pg_dump', 'pg_dumpall', 'age'):
        if not shutil.which(executable):
            raise BackupError('MISSING_TOOLS')
    secrets = {name: protected_file(config[name]) for name in
               ('pg_service_file', 'pg_pass_file', 'storage_key_file', 'age_recipient_file')}
    storage_key = secrets['storage_key_file'].read_text().strip()
    validate_storage_key(storage_key)
    root = Path(config['destination'])
    if not root.is_dir() or root.is_symlink() or root.stat().st_uid != os.getuid() or root.stat().st_mode & 0o077:
        raise BackupError('UNSAFE_DESTINATION_PERMISSIONS')
    if shutil.disk_usage(root).free < 10 * 1024**3:
        raise BackupError('INSUFFICIENT_FREE_SPACE')
    with (root / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        identifier = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        partial = root / (identifier + '.tar.age.partial')
        final = root / (identifier + '.tar.age')
        try:
            with tempfile.TemporaryDirectory(prefix='.working-', dir=root) as working:
                work = Path(working)
                env = {**os.environ, 'PGSERVICEFILE': str(secrets['pg_service_file']),
                       'PGPASSFILE': str(secrets['pg_pass_file']), 'PGSERVICE': 'petsanny',
                       'PGCONNECT_TIMEOUT': '30', 'PGOPTIONS': '-c default_transaction_read_only=on'}
                env.pop('PGPASSWORD', None)
                run_tool(['pg_dump', '--no-password', '--format=custom', '--lock-wait-timeout=30000',
                          '--file', str(work / 'database.dump')], env)
                run_tool(['pg_dumpall', '--no-password', '--roles-only', '--no-role-passwords',
                          '--file', str(work / 'roles.sql')], env)
                for file in ('database.dump', 'roles.sql'):
                    if not (work / file).is_file() or not (work / file).stat().st_size:
                        raise BackupError('EMPTY_DATABASE_EXPORT')
                storage = Storage(config['supabase_url'], storage_key)
                before = storage.inventory('pet-documents')
                objects = work / 'objects'
                objects.mkdir(mode=0o700)
                files = [storage.download(item, objects / object_filename(item['bucket'], item['key'])) for item in before]
                if before != storage.inventory('pet-documents'):
                    raise BackupError('STORAGE_CHANGED_RETRY_IN_QUIET_WINDOW')
                hashes = {}
                for name in ('database.dump', 'roles.sql'):
                    digest = hashlib.sha256()
                    with (work / name).open('rb') as stream:
                        while chunk := stream.read(1024 * 1024):
                            digest.update(chunk)
                    hashes[name] = digest.hexdigest()
                (work / 'manifest.json').write_text(json.dumps({'version': 1, 'project': config['project_ref'],
                    'created_at': identifier, 'database_checksums': hashes, 'objects': files,
                    'restore_tested': False, 'atomic_database_and_storage_snapshot': False}, ensure_ascii=False))
                encrypt(work, secrets['age_recipient_file'], partial)
                partial.rename(final)
            print(json.dumps({'status': 'encrypted_copy_created', 'artifact': final.name,
                              'objects': len(files), 'restore_tested': False}))
        finally:
            partial.unlink(missing_ok=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', default='/etc/petsanny-backup/config.json')
    args = parser.parse_args()
    try:
        backup(args.config)
    except Exception as error:
        # Report only fixed local codes. Never expose remote errors, paths or keys.
        code = str(error) if isinstance(error, BackupError) else 'BACKUP_FAILED'
        print(json.dumps({'status': 'failed', 'code': code}), file=sys.stderr)
        sys.exit(1)
