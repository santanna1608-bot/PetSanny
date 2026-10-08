# Banco PetSanny

Projeto alvo: dpcyahwodzpolzuznrrq.

## Migrações e testes

202610080001_secure_initial_schema.sql instala a estrutura transacional em schema public vazio. Não remove tabelas existentes. 202610080002_private_documents.sql cria o armazenamento privado de documentos. Ambas foram aplicadas pelo painel autenticado e registradas em private.schema_migrations; execução pelo painel não registra automaticamente o histórico da CLI.

tenant_isolation.sql testa os cenários de acesso por clínica com fixtures revertidos por ROLLBACK. verify_empty_schema.sql confere tabelas vazias, RLS e configuração do bucket. O resultado está em verification/RESULTADO.md.

## Acesso

Os vínculos vêm de tenant_memberships, nunca de user_metadata. Owner/admin gerenciam a clínica; staff acessa módulos operacionais e viewer consulta. Financeiro e automações exigem owner/admin. Alterações de assinatura e concessão de vínculos exigem servidor ou operador autorizado. Nenhum superadministrador foi criado.

Trial permite gravação até o vencimento; suspensão, cancelamento ou trial vencido mantêm consulta e bloqueiam gravação. Chaves compostas impedem vínculos entre clínicas diferentes.

O frontend consulta memberships e cria a clínica por bootstrap_tenant após confirmar email. Documentos ficam em bucket privado; pet_documents guarda metadados. Upload é limitado a 10 MB e PDF/JPEG/PNG/WebP. A remoção de arquivo e metadados não é atômica e pode exigir reconciliação em falhas parciais.

Credenciais secretas pertencem ao servidor. Configure URL e chave pública do mesmo projeto no desenvolvimento e na Vercel. Revise redirects e confirmação de email antes de publicar. Cobranças, integrações e execução de automações exigem implementação adicional e testes reais.
