# Acesso por plano

Implementado em 11/10/2026. Essencial corresponde a Bronze, Crescer a Silver e Profissional a Gold no banco. Testes gratuitos válidos permitem todos os recursos. Não foram inventados limites quantitativos de usuários, pets ou atendimentos.

Agenda, cadastros, prontuário, documentos, financeiro e passaporte continuam no Essencial. Recuperação de agenda, portal do tutor e etapas exigem Crescer. CRM, conexões e visualização de resultados da recuperação exigem Profissional.

A migração 202610110012_plan_features foi testada no PostgreSQL com rollback e aplicada no Supabase. Políticas restritivas se combinam com as regras de vínculo, função e período pago existentes. Triggers protegem alterações de crm_stage e care_stage e emissão de links. Links já emitidos também verificam o plano atual. Downgrade preserva registros; a central de cobrança continua acessível.

O frontend evita montar os painéis indisponíveis e apresenta o plano necessário. A proteção de dados/gravações reside no banco; esconder um painel não serve como autorização. Indicadores calculados a partir da agenda já disponível são uma diferença de interface, não sigilo dos dados de origem.

Validação: supabase/tests/plan_features.sql confirmou matriz de planos, escrita direta bloqueada, emissão de link bloqueada, link antigo inválido após downgrade, teste gratuito expirado e preservação de dados. Dois testes locais cobrem a apresentação dos planos, além da suíte existente de 74 testes aprovada. Cobranças reais permanecem desativadas.
