# Teste gratuito de 7 dias

Novas clínicas criadas por bootstrap_tenant recebem renewal_date = current_date + 7 e trial_duration_days = 7. A migração 202610110013_trial_seven_days não altera datas existentes; registros anteriores recebem a classificação de 14 dias.

O administrador geral pode conceder uma única extensão de mais 7 dias nos detalhes da clínica. extend_tenant_trial exige privilégio administrativo verificado no banco, status trial e duração inicial de 7 dias. Bloqueio da linha evita extensões concorrentes/duplicadas. Prazo: maior entre data atual e prazo existente, mais 7. Data e administrador ficam registrados; clínica ativa, suspensa, cancelada ou teste legado não recebe essa extensão.

Landing, cadastro e traduções informam 7 dias. Teste gratuito válido mantém todos os recursos como antes. Nenhuma cobrança é criada pela extensão.

Homologação: supabase/tests/trial_seven_days.sql executado com rollback retornou PASS para novo prazo, legado preservado, extensão única, cliente impedido de estender ou alterar o prazo diretamente e auditoria do administrador. Migração aplicada no Supabase. Compilação local continua limitada pelas dependências incompletas; validar a implantação da Vercel antes de concluir a publicação.
