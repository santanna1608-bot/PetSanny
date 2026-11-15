# Run interactively: the existing VPS root password is entered only into OpenSSH.
$ErrorActionPreference = 'Stop'
$recoveryFolder = Join-Path $env:USERPROFILE 'PetSanny-Recovery'
$artifactName = '20261023T181250213729Z.tar.age'
$expectedHash = 'ee2c99df951ebc6618edf81a2f88430a1b1b92986290ccda763ce5ac529015f6'
$expectedFingerprint = 'SHA256:LFt4SYL6+DjPMIXQr8mur2lfGB77IZPzygeI6157TSE'
$hostFile = Join-Path $recoveryFolder 'vps-known-hosts'
$identityFile = Join-Path $recoveryFolder 'petsanny-backup-key.txt'
$artifactFile = Join-Path $recoveryFolder $artifactName
$partialFile = "$artifactFile.partial"
$ageExe = Join-Path $env:LOCALAPPDATA 'Temp\petsanny-age-1.3.2\age\age.exe'
$pythonExe = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$sshFolder = Join-Path $env:WINDIR 'System32\OpenSSH'
foreach ($required in @($recoveryFolder, $identityFile, $ageExe, $pythonExe)) {
    if (-not (Test-Path -LiteralPath $required)) { throw 'Falta uma ferramenta ou arquivo privado preparado. Avise o Codex.' }
}
# Host key was read directly in the authenticated Hostinger web console and its
# fingerprint matched the real SSH handshake. Never use StrictHostKeyChecking=no.
'31.97.175.251 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMLSiFEmuZQoMUbp6sbCM5wUDKm2gG/XlWrR5Z1YVSur' |
    Set-Content -LiteralPath $hostFile -Encoding ascii
$fingerprint = & (Join-Path $sshFolder 'ssh-keygen.exe') -lf $hostFile
if ($LASTEXITCODE -ne 0 -or -not $fingerprint.Contains($expectedFingerprint)) { throw 'Identidade SSH divergente.' }
if (-not (Test-Path -LiteralPath $artifactFile)) {
    if (Test-Path -LiteralPath $partialFile) { throw 'Existe uma transferencia parcial. Avise o Codex para conferir antes de repetir.' }
    Write-Host 'Digite a senha ROOT atual da VPS somente no prompt abaixo. Ela nao aparece enquanto voce digita.'
    & (Join-Path $sshFolder 'scp.exe') -o KexAlgorithms=curve25519-sha256 -o HostKeyAlgorithms=ssh-ed25519 `
        -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$hostFile" -o ConnectTimeout=20 `
        -o NumberOfPasswordPrompts=1 "root@31.97.175.251:/var/lib/petsanny-backup/$artifactName" $partialFile
    if ($LASTEXITCODE -ne 0) { throw 'Transferencia nao concluida. Nenhuma chave de recuperacao foi enviada a VPS.' }
    if ((Get-FileHash -LiteralPath $partialFile -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) {
        throw 'Checksum da copia local divergente. Nao abrir nem restaurar.'
    }
    Move-Item -LiteralPath $partialFile -Destination $artifactFile
}
if ((Get-FileHash -LiteralPath $artifactFile -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) {
    throw 'Checksum local divergente.'
}
$reportFile = Join-Path $recoveryFolder ('verification-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.json')
& $pythonExe (Join-Path $PSScriptRoot 'verify_package.py') --artifact $artifactFile --identity $identityFile `
    --age-exe $ageExe --expected-sha256 $expectedHash --report $reportFile
if ($LASTEXITCODE -ne 0) { throw 'Pacote baixado, mas a verificacao interna falhou. Avise o Codex.' }
Write-Host 'Copia local cifrada e hashes internos conferidos. Nenhum dado restaurado em producao.'
Write-Host 'Avise o Codex: pronto.'
