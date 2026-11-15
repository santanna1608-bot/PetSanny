#!/usr/bin/env python3
import getpass
import os
from pathlib import Path
import tempfile
from backup import validate_storage_key, protected_file, BackupError

os.umask(0o077)
target = protected_file('/etc/petsanny-backup/storage-key')
print('Corrigir somente a chave do Storage. A senha do banco será preservada.')
print('No Supabase: Settings > API Keys > Legacy anon, service_role API keys.')
print('Copie o VALOR da chave service_role. Não copie anon, nome do campo, URL ou senha do banco.')
try:
    key = getpass.getpass('Cole a chave service_role (oculta) e pressione Enter: ').strip()
    validate_storage_key(key)
    with tempfile.NamedTemporaryFile(mode='w', dir=target.parent, prefix='.storage-key-', delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(key + '\n')
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)
    print('Chave salva com formato e projeto conferidos. Nenhum backup foi iniciado.')
except BackupError:
    print('O valor não corresponde ao formato da chave service_role desse projeto. Nada foi alterado.')
except (EOFError, KeyboardInterrupt):
    print('\nCancelado. Nada foi alterado.')
