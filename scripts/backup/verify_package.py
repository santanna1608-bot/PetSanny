#!/usr/bin/env python3
"""Decrypt and verify a backup as a stream. Never write plaintext or print records."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tarfile


class VerificationError(Exception):
    pass


def checksum(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def verify_tar(source):
    """Only accept the exact backup format; parse in memory, without extraction."""
    entries = {}
    manifest = None
    total = 0
    with tarfile.open(fileobj=source, mode='r|') as archive:
        for member in archive:
            name = member.name
            if name in entries or len(entries) >= 100005:
                raise VerificationError('DUPLICATE_OR_TOO_MANY_MEMBERS')
            if member.isdir() and name == 'objects':
                entries[name] = None
                continue
            is_object = re.fullmatch(r'objects/[0-9a-f]{64}', name) is not None
            if not member.isfile() or not (is_object or name in ('database.dump', 'roles.sql', 'manifest.json')):
                raise VerificationError('UNEXPECTED_ARCHIVE_MEMBER')
            limit = 10 * 1024**2 if is_object else {
                'database.dump': 8 * 1024**3, 'roles.sql': 64 * 1024**2,
                'manifest.json': 16 * 1024**2,
            }.get(name)
            total += member.size
            if member.size < 0 or (member.size == 0 and not is_object) or member.size > limit or total > 16 * 1024**3:
                raise VerificationError('INVALID_MEMBER_SIZE')
            digest = hashlib.sha256()
            size = 0
            raw_manifest = bytearray()
            header = b''
            stream = archive.extractfile(member)
            for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                if not header:
                    header = chunk[:5]
                size += len(chunk)
                digest.update(chunk)
                if name == 'manifest.json':
                    raw_manifest.extend(chunk)
            if size != member.size:
                raise VerificationError('TRUNCATED_MEMBER')
            if name == 'database.dump' and header != b'PGDMP':
                raise VerificationError('INVALID_POSTGRES_ARCHIVE')
            entries[name] = {'sha256': digest.hexdigest(), 'bytes': size}
            if name == 'manifest.json':
                manifest = json.loads(raw_manifest)
    if not isinstance(manifest, dict) or manifest.get('version') != 1 or manifest.get('project') != 'dpcyahwodzpolzuznrrq':
        raise VerificationError('UNEXPECTED_MANIFEST')
    expected = {'database.dump', 'roles.sql', 'manifest.json'}
    for name in ('database.dump', 'roles.sql'):
        if name not in entries or entries[name]['sha256'] != manifest.get('database_checksums', {}).get(name):
            raise VerificationError('DATABASE_CHECKSUM_MISMATCH')
    objects = manifest.get('objects')
    if not isinstance(objects, list) or len(objects) > 100000:
        raise VerificationError('INVALID_OBJECT_MANIFEST')
    for item in objects:
        if not isinstance(item, dict) or item.get('bucket') != 'pet-documents' or not isinstance(item.get('key'), str):
            raise VerificationError('UNEXPECTED_OBJECT_SCOPE')
        filename = hashlib.sha256(('pet-documents/' + item['key']).encode()).hexdigest()
        name = 'objects/' + filename
        if item.get('file') != filename or name in expected:
            raise VerificationError('INVALID_OBJECT_MAPPING')
        if entries.get(name) != {'sha256': item.get('sha256'), 'bytes': item.get('bytes')}:
            raise VerificationError('OBJECT_CHECKSUM_MISMATCH')
        expected.add(name)
    if set(entries) - {'objects'} != expected:
        raise VerificationError('MISSING_OR_EXTRA_MEMBERS')
    return {'status': 'decryption_and_internal_checksums_verified',
            'database_files': 2, 'storage_objects': len(objects),
            'plaintext_written': False, 'restore_tested': False}


def verify_package(artifact, identity, age_exe, expected_sha):
    if not re.fullmatch('[0-9a-f]{64}', expected_sha) or checksum(artifact) != expected_sha:
        raise VerificationError('ENCRYPTED_CHECKSUM_MISMATCH')
    process = subprocess.Popen([str(age_exe), '--decrypt', '--identity', str(identity), str(artifact)],
                               stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    try:
        result = verify_tar(process.stdout)
        # Consume trailing tar padding so age can finish and authenticate its entire stream.
        for unused in iter(lambda: process.stdout.read(1024 * 1024), b''):
            pass
        if process.wait(timeout=60) != 0:
            raise VerificationError('DECRYPTION_FAILED')
        return {**result, 'artifact': Path(artifact).name, 'encrypted_sha256': expected_sha}
    finally:
        process.stdout.close()
        if process.poll() is None:
            process.kill()
            process.wait()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--artifact', required=True, type=Path)
    parser.add_argument('--identity', required=True, type=Path)
    parser.add_argument('--age-exe', required=True, type=Path)
    parser.add_argument('--expected-sha256', required=True)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    try:
        result = verify_package(args.artifact, args.identity, args.age_exe, args.expected_sha256)
        if args.report:
            with args.report.open('x', encoding='utf-8') as output:
                json.dump(result, output, indent=2)
        print(json.dumps(result))
    except Exception as error:
        code = str(error) if isinstance(error, VerificationError) else 'PACKAGE_VERIFICATION_FAILED'
        print(json.dumps({'status': 'failed', 'code': code}), file=sys.stderr)
        sys.exit(1)
