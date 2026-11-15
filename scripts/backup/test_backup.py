import importlib.util
from pathlib import Path
import unittest
import io
import json

spec = importlib.util.spec_from_file_location('petsanny_backup', Path(__file__).with_name('backup.py'))
backup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backup)


class BackupSafetyTests(unittest.TestCase):
    def test_scope_rejects_other_project_or_public_destination(self):
        import json
        config = json.loads(Path(__file__).with_name('config.example.json').read_text())
        backup.validate_config(config)
        for key, value in [('project_ref', 'other'), ('supabase_url', 'https://evil.example'),
                           ('storage_buckets', ['other']), ('destination', '/var/www/html'),
                           ('schedule_enabled', True), ('retention_delete_enabled', True)]:
            with self.subTest(key=key), self.assertRaises(backup.BackupError):
                backup.validate_config({**config, key: value})

    def test_object_names_never_become_local_paths(self):
        for value in ('..', '.', '/tmp', 'a/b', 'a\\b', '\x00', ''):
            with self.subTest(value=value), self.assertRaises(backup.BackupError):
                backup.safe_segment(value)
        name = backup.object_filename('pet-documents', '../../etc/passwd')
        self.assertEqual(len(name), 64)
        self.assertNotIn('/', name)

    def test_redirects_refused_before_forwarding_credentials(self):
        with self.assertRaises(backup.BackupError):
            backup.NoRedirect().redirect_request(None, None, 302, 'redirect', {}, 'https://evil.example')

    def test_pagination_and_nested_folders_keep_every_object(self):
        class FakeOpener:
            def __init__(self):
                self.offsets = []

            def open(self, request, timeout):
                args = json.loads(request.data)
                self.offsets.append((args['prefix'], args['offset']))
                if not args['prefix'] and args['offset'] == 0:
                    page = [{'name': f'file-{index}', 'id': str(index), 'metadata': {'size': 1}}
                            for index in range(99)] + [{'name': 'folder', 'id': None, 'metadata': None}]
                elif args['prefix'] == 'folder':
                    page = [{'name': 'nested.pdf', 'id': 'nested', 'metadata': {'size': 1}}]
                else:
                    page = [{'name': 'last.pdf', 'id': 'last', 'metadata': {'size': 1}}]
                return io.BytesIO(json.dumps(page).encode())

        storage = backup.Storage('https://example.supabase.co', 'synthetic-test-key')
        storage.opener = FakeOpener()
        rows = storage.inventory('pet-documents')
        self.assertEqual(len(rows), 101)
        self.assertIn(('', 100), storage.opener.offsets)
        self.assertIn('folder/nested.pdf', [row['key'] for row in rows])

    def test_duplicate_listing_is_not_reported_as_complete(self):
        class FakeOpener:
            def open(self, request, timeout):
                item = {'name': 'same.pdf', 'id': 'one', 'metadata': {'size': 1}}
                return io.BytesIO(json.dumps([item, item]).encode())
        storage = backup.Storage('https://example.supabase.co', 'synthetic-test-key')
        storage.opener = FakeOpener()
        with self.assertRaisesRegex(backup.BackupError, 'DUPLICATE_STORAGE_OBJECT'):
            storage.inventory('pet-documents')

    def test_storage_key_scope_rejected_before_database_export(self):
        import base64
        def token(role, project):
            payload = base64.urlsafe_b64encode(json.dumps({'role': role, 'ref': project}).encode()).decode().rstrip('=')
            return 'synthetic.' + payload + '.not-a-signature'
        backup.validate_storage_key(token('service_role', 'dpcyahwodzpolzuznrrq'))
        for key in ['password', 'sb_secret_synthetic', token('anon', 'dpcyahwodzpolzuznrrq'), token('service_role', 'other')]:
            with self.assertRaises(backup.BackupError):
                backup.validate_storage_key(key)


if __name__ == '__main__':
    unittest.main()
