# Aplicação e validação — 08/10/2026

Projeto: dpcyahwodzpolzuznrrq / PetSanny - SaaS.

As migrações 202610080001 e 202610080002 foram aplicadas no SQL Editor autenticado. A primeira criou 15 tabelas públicas com RLS e vínculos de acesso por clínica. A segunda criou o bucket privado pet-documents, limite de 10 MB, tipos PDF/JPEG/PNG/WebP e políticas de leitura, inclusão e exclusão por vínculo.

tenant_isolation.sql retornou PASS nos cenários implementados de acesso entre clínicas, metadata falso, vínculos cruzados, campos de assinatura protegidos, viewer, suspensão, cadastro com email e acesso anônimo. Os fixtures foram revertidos com ROLLBACK.

verify_empty_schema.sql retornou PASS após ambas as migrações: 15 tabelas vazias, 15 protegidas por RLS, ausência dos usuários temporários, bucket privado vazio e três políticas de documentos presentes. Esta última conferência verifica configuração de Storage, não upload real nem isolamento ponta a ponta de arquivos.

Evidências: tenant-isolation.jpg, empty-secure-schema.jpg e final-empty-private-storage.jpg.

Frontend adaptado localmente: acesso por memberships, cadastro por RPC, serviços persistentes, erros propagados, logout sem limpeza de registros e documentos privados. Sem respostas fictícias de IA ou mensagens simuladas de WhatsApp.

Validação local: 13 testes automatizados passaram; build passou; lint sem erros e com avisos de organização de exports/efeito. O navegador integrado não conseguiu acessar o servidor local (timeout). Cadastro, email e operações autenticadas ainda precisam de validação real.

A Vercel não foi publicada nesta etapa. Cobrança, webhooks, execução de automações, WhatsApp, IA, recuperação de senha e revisão comercial permanecem pendentes. Exclusão de documento envolve Storage e banco em etapas distintas; falhas parciais exigem reconciliação.

## Preparação do administrador geral

A migração 202610080003_platform_access.sql foi aplicada em 08/10/2026. current_platform_admin consulta exclusivamente o usuário autenticado e o cadastro privado de administradores. Não recebe ID externo e não concede privilégios. O frontend usa essa resposta estrita para abrir PlatformAdminPanel, uma consulta das clínicas que também funciona com a base vazia. Não reutiliza os comandos simulados do painel antigo.

16 testes de serviços/acesso passaram e a compilação passou. O login real do administrador permanece pendente: a conta indicada pelo usuário não foi encontrada no novo projeto. O formulário de criação ficou preparado no Supabase para o usuário definir a própria senha. Nenhum administrador foi inserido. O site na Vercel permanece na versão anterior.

## Correção de Novo atendimento

A migração 202610080004_appointment_contacts.sql foi aplicada. save_appointment_with_contacts executa com os privilégios do usuário e RLS: cria tutor/pet novos ou valida os selecionados, e salva o atendimento na mesma transação. Selecionar um pet de outro tutor é rejeitado. O serviço do frontend chama essa operação e a lista de clientes recarrega quando novos atendimentos são criados.

O atendimento informado pelo usuário foi reparado com as permissões do proprietário da clínica; tutor e pet foram vinculados, mantendo o status confirmed. appointment_contacts.sql retornou PASS para criação vinculada, rollback de todos os cadastros em falha e reparo repetido sem duplicação. Os fixtures desse teste foram revertidos. 18 testes de serviços/acesso passaram. A confirmação visual de Clientes & Pets após o reparo permanece com o usuário, pois a aba integrada não estava autenticada.

## Isolamento de documentos e financeiro

Em 08/10/2026, documents_finance_isolation.sql retornou PASS no Supabase. Usa duas clínicas temporárias e seus proprietários, documentos somente de metadados e lançamentos financeiros. Verifica leitura isolada, edição/exclusão de registros estrangeiros bloqueadas e inclusão financeira estrangeira rejeitada nas duas direções. Confere o predicado de autorização dos caminhos de Storage e rejeição de caminho inválido. Todos os fixtures estão em transação terminada por ROLLBACK.

Limite: este teste não envia arquivos físicos nem executa download via API Storage. Upload/download real, autorização da API de arquivos e fluxo financeiro pela interface ainda precisam de validação. Não houve alteração de registros reais nem publicação na Vercel.

## Validação dos módulos pela interface

Na MeuPet, a receita fictícia de R$ 12,34 foi criada e permaneceu após recarregar. Uma despesa fictícia de R$ 2,34 produziu saldo de R$ 10,00. O teste revelou custos estimados em 25% da receita no antigo DRE; esse cálculo foi removido. O resumo agora apresenta somente receitas, despesas e saldo registrados.

Tutor e pet identificados com TESTE foram criados pela interface. TESTE-documento.png (imagem mínima sem dados pessoais) foi enviado com sucesso e permaneceu no prontuário após recarregar. A tentativa de download não produziu evento capturável no navegador integrado; integridade do arquivo baixado e isolamento dos arquivos físicos entre contas continuam pendentes. A tela de documentos ficou aberta para conferência manual. Os registros fictícios permanecem na MeuPet para rastrear o teste e ainda precisam de limpeza autorizada.

## Correção do download

O fluxo de Blob com clique programático foi substituído por preparação de URL assinada do bucket privado (60 segundos, nome do arquivo no download) e link explícito Baixar arquivo. A interface remove o link após 55 segundos e ao trocar de pet. Erros ao preparar o acesso são propagados. Não há URL persistida nem bucket público.

Validação real no navegador integrado: o clique no link gerou um evento de download, salvou TESTE-documento.png e os 68 bytes baixados foram comparados com o arquivo original: idênticos. 19 testes passaram e build passou. O teste de serviço verifica prazo, nome e propagação de bloqueios. O isolamento de download via API entre duas contas reais ainda exige validação própria.

## Recuperação de senha

Implementados solicitação de link, retorno dedicado e formulário de nova senha condicionado ao evento PASSWORD_RECOVERY. A sessão de recuperação não carrega os módulos da clínica. A resposta de solicitação não confirma existência de conta. Senhas devem coincidir e ter ao menos oito caracteres; erros do Supabase são tratados.

O retorno local http://127.0.0.1:5174/?flow=recovery foi salvo e confirmado após recarregar a configuração do Supabase. Abrir esse endereço com uma sessão comum mostrou link inválido e não liberou campos de nova senha. O botão Esqueci minha senha abriu o formulário de solicitação.

21 testes passaram, build passou e lint terminou sem erros (avisos existentes). Posteriormente, o titular confirmou a redefinição pelo e-mail e o login com a nova senha na MeuPet. A Vercel permanece sem publicação destas alterações.

## Preparação de produção

Site URL do Supabase ajustado para https://petsanny.vercel.app. Retornos exatos de confirmação (#auth) e recuperação (?flow=recovery) adicionados, mantendo os dois retornos locais. A interface confirmou quatro URLs autorizadas. O painel da Vercel está na tela de login e aguarda o titular para permitir configuração e publicação. Consulte PUBLICACAO.md.
