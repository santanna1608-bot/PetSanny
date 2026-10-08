# PetSanny

Aplicativo React, TypeScript e Vite com Supabase. A configuração local usa o projeto dpcyahwodzpolzuznrrq.

## Desenvolvimento

Instale as dependências com npm ci. Copie .env.example para .env.local e configure URL e chave pública do mesmo projeto. Nunca coloque service_role, senha do banco ou tokens privados no frontend.

Comandos: npm run dev, npm run build, npm run lint e npm test.

## Estado desta entrega

Autenticação consulta vínculos no banco; o cadastro da clínica usa bootstrap_tenant após confirmação do email. Agenda, tutores, pets, prontuário, estoque, financeiro e notas internas do CRM usam persistência remota. O logout encerra a sessão sem apagar registros. Documentos usam Storage privado com políticas por clínica.

As automações são rascunhos inativos. WhatsApp, cobrança, webhooks e assistente de IA ainda precisam de implementação no servidor. Não há superadministrador criado automaticamente. A página comercial ainda precisa de revisão das promessas e preços antes de comercialização.

As migrações foram aplicadas na nova base vazia; veja supabase/verification/RESULTADO.md. A versão hospedada na Vercel não foi alterada. Antes de publicar, configure as variáveis públicas na Vercel e revise Site URL/Redirect URLs e confirmação de email no Supabase. Teste cadastro, email, login, operações autenticadas, documentos e logout com uma conta real.

Os testes automatizados cobrem serviços e resolução de acesso com respostas controladas. Não substituem testes de ponta a ponta nem auditoria completa.

O acesso geral da plataforma é consultado pela RPC current_platform_admin, instalada pela terceira migração. Somente o cadastro privado definido pelo operador concede esse papel; metadata não concede acesso. Administradores gerais entram em um painel de consulta separado, sem precisar criar clínica. A criação e a validação da primeira conta administrativa ainda estão pendentes.
