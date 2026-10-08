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

Em 08/10/2026, VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY foram atualizadas na Vercel para o novo projeto (chave pública publishable, sem chaves privadas). A main do GitHub avançou de 2aa2727 para 244070b sem reescrita de histórico. A Vercel compilou esse commit e confirmou Ready, Production Current, associado a petsanny.vercel.app.

Deploy: https://vercel.com/santanna1608-8405s-projects/pet-sanny/CBRksmCRGaGnVodZwzG49zXvdgph

A validação de login com senha no domínio publicado aguarda o titular. A confirmação local da recuperação não substitui essa validação de produção.
