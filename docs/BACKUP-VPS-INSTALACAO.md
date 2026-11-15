# Backup PetSanny na VPS Hostinger — preparação

## Estado confirmado em 23/10/2026

Console autenticado acessível. Inventário somente leitura: Ubuntu 24.04; raiz 96G, 41G usados e 56G disponíveis; RAM 7,8 GiB, aproximadamente 5,3 GiB disponíveis. Docker e Python 3 disponíveis; age, restic, rclone e pg_dump não encontrados no PATH. Um container PostgreSQL existente possui pg_dump 17.11; não será reutilizado como ferramenta de backup do PetSanny, para separar dependências dos serviços existentes.

Serviços identificados: Deskcomm CRM (app, worker e scheduler), WAHA, Traefik, PostgreSQL/pgvector 17, Redis, Portainer/agente e serviços auxiliares de chamadas. Não reiniciar, atualizar ou reconfigurar esses serviços como parte do backup. UFW informa inactive. O login anuncia 75 atualizações pendentes e uma falha de atualização automática; isso é observação do banner, não diagnóstico de vulnerabilidade ou inventário atualizado de pacotes.

## Arquitetura preparada

- Origem: banco PostgreSQL e bucket privado pet-documents do projeto dpcyahwodzpolzuznrrq.
- Destino inicial: /var/lib/petsanny-backup nessa VPS. Diretório fora dos volumes do CRM e fora de qualquer servidor web.
- Configuração: /etc/petsanny-backup, proprietário root, modo 0700; arquivos de segredos 0600. Código e configuração de exemplo no repositório não contêm segredos.
- Cliente PostgreSQL isolado, com versão compatível com o servidor Supabase, sem portas publicadas. Não conectar ao PostgreSQL do CRM e não usar seus volumes.
- Exportar schema, roles e dados de acordo com o procedimento Supabase. Preservar migrations do PetSanny: customizações de auth/storage precisam ser recuperadas separadamente conforme documentação oficial.
- Copiar objetos do Storage separadamente, com manifesto e checksums. Validar cobertura e consistência com o banco. Alterações durante a cópia exigem reconciliação; backup lógico e cópia de objetos não formam snapshot atômico único.
- Criptografar o pacote com age antes de marcar a execução completa. Guardar a chave privada de recuperação fora da VPS e fora deste repositório. A VPS precisa apenas do destinatário público para cifrar.
- Usar lock para impedir execução concorrente, permissões restritas e limites de espaço. Não excluir cópias automaticamente antes de validar restauração e retenção.
- Desabilitar agenda inicialmente; a primeira execução será manual e monitorada. Não configurar alerta externo antes de definir destinatário/canal.

## Configuração que o proprietário precisará fornecer diretamente no servidor

Não colar os valores em chat, terminal com histórico, argumentos de comandos, GitHub ou Vercel pública. Editar arquivos protegidos em sessão privada.

1. Conexão do banco Supabase (host/pooler de sessão, porta, database, usuário e senha existente), com TLS e validação de certificado apropriados. Não redefinir a senha do projeto para configurar backup.
2. Credencial de leitura do Storage. Preferir acesso restrito ao necessário; caso seja usada service_role, ela concede acesso administrativo ao projeto e precisa de aprovação explícita antes de ser colocada na VPS. Não reutilizar credenciais do CRM.
3. Destinatário público de cifragem age. Criar a chave privada em ambiente do proprietário e guardar cópia segura fora da VPS; nunca incluí-la nos backups ou neste repositório.

Antes de salvar credenciais e iniciar transferência, confirmar especificamente a autorização para essa VPS armazenar as cópias do banco e dos arquivos do PetSanny. Até lá não há transferência nem acesso novo ao Supabase.

## Critérios antes de ativar

1. Ferramentas verificadas e versões registradas; sem mudanças nas portas, firewall ou serviços do CRM.
2. Segredos protegidos e backup fora de diretórios públicos; privilégio de acesso documentado.
3. Primeira cópia com banco, objetos, manifesto, checksums e cifragem concluídos; falha não vira sucesso parcial.
4. Recuperação em projeto isolado com dois tenants e documento de amostra; sem disparar mensagens/cobranças e sem sobrescrever produção.
5. Proprietário aprova periodicidade/retencão e segunda cópia independente. Só então ativar agendamento.

## Status

Inventário concluído; preflight.sh, config.example.json e backup.py preparados no workspace. backup.py é candidato de execução manual: exporta arquivo PostgreSQL custom e roles sem senhas, copia o bucket, confere listagem antes/depois, cria manifesto com hashes, cifra com age e promove artefato somente após sucesso. Usa lock, nega redirecionamento HTTP, restringe destino/projeto, exige permissões privadas, limita arquivos do Storage a 10 MB e exportações individuais a 8 GiB. Não imprime segredos nem erros remotos. Não altera origem, não exclui backups antigos e não agenda tarefas.

Limites: é candidato ainda não validado contra o Supabase real; permissões e compatibilidade de pg_dump precisam ser conferidas. Full dump gerenciado pode exigir ajustes conforme os schemas acessíveis. Roles sem senhas exigem configuração no destino; chaves do projeto, configurações externas, backups de outros buckets e o código/migrations não são substituídos por esse pacote. Integridade do arquivo não comprova restauração. Se banco e Storage estiverem em uso, usar janela tranquila e conferir referências na recuperação: a cópia não constitui snapshot atômico de ambos.

Status consolidado de 23/10/2026: instalação, configuração pelo proprietário e primeira cópia manual cifrada concluídas, conforme registros abaixo. Recuperação real, agendamento e segunda cópia ainda pendentes. Scripts de preflight não alteram o servidor.

### Preparação instalada após autorização de 23/10/2026

O proprietário autorizou configurar acesso ao Supabase nessa VPS e a primeira cópia manual cifrada, sem agendamento ou exclusão de cópias. Instalado age 1.1.1 pelo repositório Ubuntu, sem upgrade geral e sem reiniciar os serviços. Código em /opt/petsanny-backup; /opt/petsanny-backup, /etc/petsanny-backup e /var/lib/petsanny-backup confirmados root:root 0700. Cinco testes passaram no Python da VPS. Teste sintético de cifragem/decifragem e leitura de conteúdo passou; a chave temporária do teste foi removida, não é chave de recuperação real.

Wrapper pg-client.sh usa imagem local oficial postgres:17-alpine, pg_dump 17.11 confirmado, container temporário com raiz somente leitura, limites de CPU/RAM/arquivo e sem portas publicadas. Não utiliza o container PostgreSQL existente do CRM. A imagem fica fixa ao conteúdo local (--pull=never); revalidar versão e compatibilidade do servidor antes da primeira cópia. Onze containers existentes continuaram ativos após preparação.

Assistente configure.py instalado. Comando do proprietário: `python3 /opt/petsanny-backup/configure.py`. Somente usar quando tiver os dados de conexão atuais do Supabase, chave de servidor do Storage e destinatário público age cuja chave privada esteja guardada fora da VPS. Password e chave Storage são lidos por getpass, sem eco. Não enviar valores no chat e não redefinir senha do banco. O assistente grava arquivos 0600 e não sobrescreve configuração existente; TLS com verify-full e raiz de confiança do cliente PostgreSQL. Nenhuma cópia é iniciada por esse comando.

Status atual: credenciais reais ainda ausentes, chave de recuperação real não configurada, sem backup real ou agendamento. Depois da configuração pelo proprietário, executar manualmente com `PATH=/opt/petsanny-backup/bin:$PATH python3 /opt/petsanny-backup/backup.py` e conferir erro/sucesso; não afirmar recuperabilidade até ensaio isolado de banco e objetos.

### Preparação da recuperação local

Em 23/10/2026, age 1.3.2 para Windows foi obtido da release oficial FiloSottile/age; SHA256 do ZIP conferido com o digest publicado pelo GitHub. Chave privada gerada em C:\Users\santa\PetSanny-Recovery\petsanny-backup-key.txt, fora do OneDrive/repositório. Pasta com ACL restrita ao usuário atual e SYSTEM. Conteúdo privado não foi exibido nem transferido à VPS. Somente recipient.txt público foi enviado a /opt/petsanny-backup/recipient.txt.

Host de Session Pooler confirmado no painel Connect: aws-1-sa-east-1.pooler.supabase.com, porta 5432, database postgres, usuário postgres.dpcyahwodzpolzuznrrq. configure.py atualizado para pré-preencher esses parâmetros e o destinatário público. Proprietário deve inserir somente senha atual e chave service_role existente, ambas ocultas por getpass, e confirmar que guarda a chave privada fora da VPS. Não copiar chave anon/publishable. Não alterar ou regenerar chaves existentes.

A chave de recuperação local precisa de cópia adicional segura sob responsabilidade do proprietário. Se ela for perdida, os pacotes cifrados não poderão ser recuperados. Não incluí-la no código, em capturas de tela nem nos backups cifrados por ela própria.

### Primeira tentativa manual — 23/10/2026

Proprietário confirmou configuração salva. Exportação inicialmente recusada por certificado não reconhecido no trust store genérico do cliente. Obtido o certificado público oficial pelo link Download certificate do painel Database Settings (https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt), salvo em /etc/petsanny-backup/supabase-ca.crt; pg_service.conf agora aponta para ele, preservando sslmode=verify-full.

Após esse ajuste, as exportações do PostgreSQL passaram e a etapa de listagem do Storage respondeu HTTP 400. Diagnóstico sem valores detectou que a credencial salva não tinha formato de JWT service_role nem de secret key. Nenhum valor foi exibido, nenhuma senha foi redefinida. A cópia completa não foi criada e os temporários da tentativa foram removidos pelo script.

Adicionada validação local do formato/role/projeto da chave legacy antes de executar exportação, sem substituir verificação da assinatura pela API. Seis testes locais passaram. replace-storage-key.py permite ao proprietário corrigir apenas o campo Storage por entrada oculta, preservando conexão/senha do banco e chave de recuperação. Aguardando correção do proprietário; não há backup completo nem agendamento.

### Primeira cópia cifrada concluída — 23/10/2026

Após o proprietário corrigir a chave por entrada oculta, o formato/projeto foram aceitos. Uma execução padrão devolveu EXPORT_TOOL_FAILED. A checagem inicial de pg_dumpall em /dev/null falhou por fsync nesse dispositivo, portanto não prova falha de acesso ao banco. A execução com arquivos regulares e diagnóstico sanitizado concluiu pg_dump e pg_dumpall com exit 0, copiou um objeto do bucket pet-documents, conferiu listagens antes/depois e criou o pacote cifrado. A checagem posterior do runner original com arquivos regulares também passou para ambas as ferramentas. Não assumir que uma única execução garante estabilidade de rotina agendada.

Artefato: /var/lib/petsanny-backup/20261023T181250213729Z.tar.age, 573768 bytes, root e modo 0600. Cabeçalho age conferido. SHA256 registrado: ee2c99df951ebc6618edf81a2f88430a1b1b92986290ccda763ce5ac529015f6. Arquivos .sha256 e .report.json privados ao lado do pacote. Zero diretórios .working-* restantes. Não foram exibidos nomes/conteúdo dos documentos, credenciais ou dados dos registros.

Essa verificação confirma existência, formato de cifragem, permissões e checksum registrado; não houve decifragem desse pacote, comparação independente dos hashes internos ou restauração do PostgreSQL/Storage. restore_tested=false e scheduled=false. Chave privada segue fora da VPS; nenhum serviço de produção foi restaurado ou alterado. Próxima etapa é ensaio isolado de recuperação com o proprietário e cópia independente da VPS, antes de ativar agendamento/retencão.

Referências consultadas em 23/10/2026:
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- https://www.postgresql.org/docs/current/app-pgdump.html

### Preparação da conferência local — 23/10/2026

SSH da VPS ativo. O ssh-keyscan do Windows falhou por incompatibilidade com o KEX selecionado; o cliente ssh respondeu usando curve25519-sha256. A chave pública transcrita inicialmente teve erro de caractere e foi descartada. Impressão digital relida diretamente pelo console Hostinger e confirmada no handshake SSH: SHA256:LFt4SYL6+DjPMIXQr8mur2lfGB77IZPzygeI6157TSE (ED25519). Nenhuma validação de host foi desativada. Sessão encerrada no prompt de senha, sem autenticação.

Preparados download-first-backup.ps1 e verify_package.py. O proprietário deve executar o PowerShell e inserir a senha root atual somente no prompt SSH local. O script fixa a identidade conferida, baixa apenas o pacote cifrado, compara SHA256 externo e usa age para verificar em memória o manifesto, os hashes do banco e os documentos. Não extrai dados em disco nem transmite a chave privada à VPS. Conferência interna não equivale a restauração do PostgreSQL/Storage.

Treze testes passaram para os scripts de backup e validação, incluindo adulteração de hashes, projeto incorreto, membros duplicados, symlinks e caminhos fora do pacote. Sintaxe PowerShell validada. Proprietário informou que ainda não executou o comando: pacote e relatório locais continuam ausentes. Nenhum ensaio de recuperação real nem agendamento foi realizado.
