# Backup externo — proposta para aprovação

Decisão do proprietário: manter Supabase Free. Destino ainda não existente.

## VPS existente verificada — 23/10/2026

Painel Hostinger consultado em modo de leitura: KVM 2, Ubuntu 24.04 LTS, 2 núcleos, 8 GB de RAM, disco de 100 GB com 41 GB usados (aproximadamente 59 GB disponíveis). Uso instantâneo: CPU 5%, memória 29%. Servidor em São Paulo, ativo; validade exibida 03/11/2026, renovação automática ativa. Cronograma Hostinger semanal e dois snapshots/backups indicados.

Há capacidade inicial para executar e armazenar cópias do PetSanny, sujeita ao volume real e à retenção. O painel não comprova quais aplicações e serviços estão instalados nem a segurança do sistema operacional. Indicador de zero regras no firewall da Hostinger não comprova ausência de firewall interno; revisar ambos antes de instalar a rotina.

Nenhum comando remoto, instalação, alteração de firewall, credencial ou transferência de dados foi realizado. Backups semanais da VPS não substituem exportação do Supabase nem teste de restauração. Próxima etapa: inventário de serviços e disco pelo acesso autorizado, preparar usuário/diretório restrito de backup, segredos fora do repositório e cópia cifrada; definir cópia independente da VPS para proteção adicional.

## Destino recomendado

Cloudflare R2 Standard em bucket privado exclusivo para backups. Não habilitar domínio público nem r2.dev. A API é compatível com S3. Em 12/10/2026 a documentação informa franquia mensal de 10 GB-mês, 1 milhão de operações A e 10 milhões B; acima dela há cobrança. Não prometer custo zero.

Referências: https://developers.cloudflare.com/r2/pricing/ e https://developers.cloudflare.com/r2/api/.

## Rotina proposta

- Executar em ambiente do proprietário com agendamento e disponibilidade definidos; não depender do computador pessoal ligado sem acordo.
- Gerar backup lógico PostgreSQL que permita recuperar schema, dados e privilégios necessários, incluindo schemas operacionais, funções, políticas e dados de autenticação suportados pela ferramenta. Segredos devem ficar fora dos logs e do repositório.
- Copiar separadamente todos os objetos privados de pet-documents. Uma cópia apenas do banco não recupera esses arquivos.
- Manifesto com versão, horário, checksum dos artefatos e contagens; somente marcar execução completa depois de banco e arquivos confirmados.
- Cifrar antes do envio com chave de recuperação guardada pelo proprietário fora do bucket. Credencial da rotina restrita ao bucket, sem acesso público.
- Propor periodicidade diária e retenção de 7 diários/4 semanais; proprietário precisa aprovar. Dimensionar volume antes de habilitar expiração ou prever custos.
- Validar a primeira cópia por restauração isolada. Nunca restaurar sobre produção como teste. Guardar evidência de acesso, isolamento por clínica e recuperação dos documentos.
- Alertar falha ou atraso; configurar destinatário e canal antes de enviar notificações.

## Dependências pendentes

Conta e ativação do R2 pelo proprietário, aceitação dos termos e eventual cadastro de pagamento; ambiente executor; credenciais locais/segredos do banco, Storage e R2; destino privado e chave de cifragem; aprovação da retenção. Não enviar qualquer credencial no chat.

Não há bucket criado, credencial concedida, rotina agendada, cópia enviada ou restauração executada por esta proposta. A criação de acesso e transferência de dados serão confirmadas com escopo e destino quando a configuração estiver concreta.
