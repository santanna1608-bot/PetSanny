# Preparação da publicação

Domínio: https://petsanny.vercel.app
Projeto Supabase: dpcyahwodzpolzuznrrq

## Autenticação configurada

Site URL: https://petsanny.vercel.app

Retornos autorizados no Supabase, conferidos na interface:

- https://petsanny.vercel.app/#auth
- https://petsanny.vercel.app/?flow=recovery
- http://127.0.0.1:5174/#auth
- http://127.0.0.1:5174/?flow=recovery

O titular confirmou redefinição de senha pelo e-mail e novo login na MeuPet na versão local. A versão de produção ainda precisa de validação após publicação.

## Configuração necessária na Vercel

Usar a conta e o projeto que já atendem petsanny.vercel.app. Conferir repositório, branch de produção e diretório raiz antes de publicar. A implementação está na branch codex/secure-saas-foundation.

Build: npm run build. Saída: dist. Aplicativo Vite.

Configurar VITE_SUPABASE_URL com https://dpcyahwodzpolzuznrrq.supabase.co e VITE_SUPABASE_ANON_KEY com a chave pública desse projeto, usando a configuração local existente. Não copiar service_role, senha de banco ou tokens privados. Alterações nas variáveis exigem nova compilação.

Nenhum arquivo .env.local deve entrar no Git. Não inserir chaves privadas no frontend ou na documentação.

## Validação após publicação

Conferir login da clínica e do administrador, isolamento entre clínicas, confirmação de e-mail, recuperação de senha, persistência de cadastros e download de documentos. O login com senhas e a definição de nova senha devem ser feitos pelo titular.

Estado atual: autenticação de produção preparada; publicação pendente de acesso ao painel da Vercel. Nenhum push ou deploy foi feito nesta etapa.
