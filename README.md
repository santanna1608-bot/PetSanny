# PetSanny

Aplicativo React, TypeScript e Vite com Supabase. A configuração local usa o projeto dpcyahwodzpolzuznrrq.

## Desenvolvimento

Instale as dependências com npm ci. Copie .env.example para .env.local e configure URL e chave pública do mesmo projeto. Nunca coloque service_role, senha do banco ou tokens privados no frontend.

Comandos: npm run dev, npm run build, npm run lint e npm test.

## Estado desta entrega

Autenticação consulta vínculos no banco; o cadastro da clínica usa bootstrap_tenant após confirmação do email. Agenda, tutores, pets, prontuário, estoque, financeiro e notas internas do CRM usam persistência remota. O logout encerra a sessão sem apagar registros. Documentos usam Storage privado com políticas por clínica.

As automações são rascunhos inativos. WhatsApp, cobrança, webhooks e assistente de IA ainda precisam de implementação no servidor. Não há superadministrador criado automaticamente. A página comercial ainda precisa de revisão das promessas e preços antes de comercialização.

As migrações foram aplicadas na nova base vazia; veja supabase/verification/RESULTADO.md. Em 08/10/2026, a versão 244070b foi publicada na Vercel com as variáveis públicas do novo Supabase e os retornos de autenticação do domínio oficial. Veja supabase/verification/PUBLICACAO.md para a evidência e a validação de produção ainda pendente com o titular.

Os testes automatizados cobrem serviços e resolução de acesso com respostas controladas. Não substituem testes de ponta a ponta nem auditoria completa.

Recuperação de senha: Esqueci minha senha solicita um link pelo Supabase. O retorno usa /?flow=recovery e a tela de nova senha exige o evento PASSWORD_RECOVERY. Os retornos locais e de https://petsanny.vercel.app estão autorizados no Supabase. O titular confirmou a redefinição real e o login com a nova senha na MeuPet.

O acesso geral da plataforma é consultado pela RPC current_platform_admin, instalada pela terceira migração. Somente o cadastro privado definido pelo operador concede esse papel; metadata não concede acesso. Administradores gerais entram em um painel de consulta separado, sem precisar criar clínica. A primeira conta administrativa foi criada e seu acesso foi confirmado pelo usuário.
