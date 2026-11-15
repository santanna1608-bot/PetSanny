import hashlib
import io
import json
import tarfile
import unittest

from verify_package import VerificationError, verify_tar


def package(change=None, extra=None):
    db, roles, document = b'PGDMPsynthetic-test', b'-- test roles', b'synthetic document'
    filename = hashlib.sha256(b'pet-documents/tenant/test.txt').hexdigest()
    manifest = {'version': 1, 'project': 'dpcyahwodzpolzuznrrq',
                'database_checksums': {'database.dump': hashlib.sha256(db).hexdigest(),
                                       'roles.sql': hashlib.sha256(roles).hexdigest()},
                'objects': [{'bucket': 'pet-documents', 'key': 'tenant/test.txt', 'file': filename,
                             'bytes': len(document), 'sha256': hashlib.sha256(document).hexdigest()}]}
    if change:
        change(manifest)
    source = io.BytesIO()
    with tarfile.open(fileobj=source, mode='w') as archive:
        for name, content in [('database.dump', db), ('roles.sql', roles),
                              ('manifest.json', json.dumps(manifest).encode()), ('objects/' + filename, document)]:
            member = tarfile.TarInfo(name)
            member.size = len(content)
            archive.addfile(member, io.BytesIO(content))
        if extra:
            archive.addfile(extra)
    source.seek(0)
    return source


class VerifyTests(unittest.TestCase):
    def test_matching_package(self):
        result = verify_tar(package())
        self.assertEqual(result['storage_objects'], 1)
        self.assertFalse(result['restore_tested'])
        self.assertFalse(result['plaintext_written'])

    def test_tampered_database_hash(self):
        with self.assertRaisesRegex(VerificationError, 'DATABASE_CHECKSUM_MISMATCH'):
            verify_tar(package(lambda m: m['database_checksums'].update({'database.dump': '0' * 64})))

    def test_tampered_object_hash(self):
        with self.assertRaisesRegex(VerificationError, 'OBJECT_CHECKSUM_MISMATCH'):
            verify_tar(package(lambda m: m['objects'][0].update({'sha256': '0' * 64})))

    def test_wrong_project(self):
        with self.assertRaisesRegex(VerificationError, 'UNEXPECTED_MANIFEST'):
            verify_tar(package(lambda m: m.update({'project': 'other-project'})))

    def test_symlink_rejected(self):
        member = tarfile.TarInfo('objects/' + 'a' * 64)
        member.type, member.linkname = tarfile.SYMTYPE, '/etc/passwd'
        with self.assertRaisesRegex(VerificationError, 'UNEXPECTED_ARCHIVE_MEMBER'):
            verify_tar(package(extra=member))

    def test_traversal_rejected(self):
        with self.assertRaisesRegex(VerificationError, 'UNEXPECTED_ARCHIVE_MEMBER'):
            verify_tar(package(extra=tarfile.TarInfo('../secret')))

    def test_duplicate_rejected(self):
        with self.assertRaisesRegex(VerificationError, 'DUPLICATE_OR_TOO_MANY_MEMBERS'):
            verify_tar(package(extra=tarfile.TarInfo('database.dump')))


if __name__ == '__main__':
    unittest.main()
