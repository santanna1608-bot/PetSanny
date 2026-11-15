# Acesso por plano

Implementado em 11/10/2026. Essencial corresponde a Bronze, Crescer a Silver e Profissional a Gold no banco. Testes gratuitos válidos permitem todos os recursos. Não foram inventados limites quantitativos de usuários, pets ou atendimentos.

Agenda, cadastros, prontuário, documentos, financeiro e passaporte continuam no Essencial. Recuperação de agenda, portal do tutor e etapas exigem Crescer. CRM, conexões e visualização de resultados da recuperação exigem Profissional.

A migração 202610110012_plan_features foi testada no PostgreSQL com rollback e aplicada no Supabase. Políticas restritivas se combinam com as regras de vínculo, função e período pago existentes. Triggers protegem alterações de crm_stage e care_stage e emissão de links. Links já emitidos também verificam o plano atual. Downgrade preserva registros; a central de cobrança continua acessível.

O frontend evita montar os painéis indisponíveis e apresenta o plano necessário. A proteção de dados/gravações reside no banco; esconder um painel não serve como autorização. Indicadores calculados a partir da agenda já disponível são uma diferença de interface, não sigilo dos dados de origem.

Validação: supabase/tests/plan_features.sql confirmou matriz de planos, escrita direta bloqueada, emissão de link bloqueada, link antigo inválido após downgrade, teste gratuito expirado e preservação de dados. Dois testes locais cobrem a apresentação dos planos, além da suíte existente de 74 testes aprovada. Cobranças reais permanecem desativadas.

Commit 9bd95df enviado à branch codex/asaas-sandbox-validation. Após aplicar a migração, o conjunto de testes PostgreSQL de planos, conexões, portal e recuperação de agenda concluiu sem erro e retornou PASS. A compilação TypeScript passou; o build local encontrou instalação incompleta de motion/framer-motion. A restauração por npm ci não concluiu e foi interrompida. Posteriormente a Vercel confirmou Ready (14s, 11/10/2026 16:25:50 BRT) na implantação GQos3ah7Nv8PHZDMjs6dJ8j5i2eu, domínio pet-sanny-eo8bwftro-santanna1608-8405s-projects.vercel.app. A landing carregou com o catálogo dos três planos. Evidência: plan-features-vercel-ready.jpg.

Após login pessoal do usuário com a conta da clínica PetCare Barra, a prévia carregou painel geral (retornos e resultados), CRM, conexões, recuperação de agenda, etapas e controles do portal, sem alertas de carregamento nesses painéis. Planos e cobrança apresentou configuração Sandbox e catálogo, sem contratação real. Evidência: plan-features-clinic-preview.jpg. Não foram alterados atendimentos, conexões, assinaturas ou o plano da clínica nesta conferência. A matriz de restrições e downgrade foi validada com fixtures transacionais no PostgreSQL e testes locais, não por troca de planos desta clínica na interface. Publicação em main e homologação do webhook de produção ainda pendentes; dependências locais precisam ser restauradas para futuros builds locais.
