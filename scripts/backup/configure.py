#!/usr/bin/env python3
"""Owner-run setup: no secrets in shell history, arguments or printed output."""
import getpass
import json
import os
from pathlib import Path
import re
import sys
from backup import validate_storage_key, BackupError


def value(prompt, pattern=None, secret=False):
    answer = getpass.getpass(prompt) if secret else input(prompt).strip()
    if not answer or '\n' in answer or '\r' in answer or (pattern and not re.fullmatch(pattern, answer)):
        raise ValueError('Campo inválido. Nenhum arquivo foi salvo.')
    return answer


def main():
    if sys.platform != 'linux' or os.geteuid() != 0:
        raise ValueError('Execute diretamente no console root da VPS.')
    os.umask(0o077)
    root = Path('/etc/petsanny-backup')
    names = ['pg_service.conf', 'pgpass', 'storage-key', 'recipient.txt', 'config.json']
    if not root.is_dir() or root.is_symlink() or root.stat().st_mode & 0o077:
        raise ValueError('Diretório de configuração inseguro.')
    if any((root / name).exists() for name in names):
        raise ValueError('Já existe configuração; não será sobrescrita.')
    print('Configuração local do PetSanny. Não cole valores em chat.')
    print('Use dados do projeto dpcyahwodzpolzuznrrq. Não redefina a senha do banco.')
    # Non-secret connection parameters verified in this project's Connect panel.
    host = 'aws-1-sa-east-1.pooler.supabase.com'
    port = '5432'
    user = 'postgres.dpcyahwodzpolzuznrrq'
    print('Session Pooler do projeto verificado; não precisa colar uma connection string.')
    password = value('Senha ATUAL do banco (oculta): ', secret=True)
    storage = value('Chave de servidor do Storage (oculta): ', secret=True)
    validate_storage_key(storage)
    recipient = Path('/opt/petsanny-backup/recipient.txt').read_text().strip()
    if not re.fullmatch(r'age1[a-z0-9]{40,100}', recipient):
        raise ValueError('Destinatário público ausente ou inválido.')
    print('Destinatário público pré-configurado. Chave privada: pasta PetSanny-Recovery no seu computador.')
    if input('Confirma que guardou a chave privada correspondente fora da VPS? Digite SIM: ') != 'SIM':
        raise ValueError('Guarde a chave de recuperação primeiro. Nenhum arquivo foi salvo.')
    config = json.loads(Path('/opt/petsanny-backup/config.example.json').read_text())
    escape = lambda text: text.replace('\\', '\\\\').replace(':', '\\:')
    content = {
        'pg_service.conf': f'[petsanny]\nhost={host}\nport={port}\ndbname=postgres\nuser={user}\nsslmode=verify-full\nsslrootcert=/etc/petsanny-backup/supabase-ca.crt\n',
        'pgpass': ':'.join(map(escape, [host, port, 'postgres', user, password])) + '\n',
        'storage-key': storage + '\n', 'recipient.txt': recipient + '\n',
        'config.json': json.dumps(config, indent=2) + '\n',
    }
    written = []
    try:
        for name, body in content.items():
            with (root / name).open('x') as file:
                file.write(body)
            written.append(root / name)
    except Exception:
        for path in written:
            path.unlink()
        raise ValueError('Falha na configuração; arquivos desta tentativa foram removidos.')
    print('Configuração salva com permissões privadas. Nenhuma cópia foi iniciada e nenhuma agenda foi criada.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, BackupError, EOFError, KeyboardInterrupt) as error:
        print(str(error) if isinstance(error, ValueError) else 'Configuração interrompida ou chave Storage inválida.', file=sys.stderr)
        sys.exit(1)
