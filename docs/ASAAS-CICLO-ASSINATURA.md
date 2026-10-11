# Validação do ciclo de assinatura

## Evidência já obtida

Em 11/10/2026, o checkout Sandbox Essencial de R$ 97 foi conciliado pelo fluxo legado: o evento CHECKOUT_PAID recebeu HTTP 200 e o histórico da clínica exibiu “Pagamento confirmado · Teste”. O webhook de testes foi desativado e o bypass temporário da Vercel foi removido. Isso não valida a ativação de planos em produção.

## Nova preparação local

A migração 202610110011_subscription_lifecycle.sql acompanha ACTIVE, INACTIVE, EXPIRED e DELETED da recorrência. Cancelamento preserva o período já pago. Exclusão definitiva não é revertida por eventos atrasados. As alterações são restritas a funções executáveis pelo servidor.

Após aplicar a migração e publicar uma prévia, definir ASAAS_SANDBOX_RECONCILIATION=true somente no Preview habilita a conciliação completa de pagamentos e assinaturas no Sandbox. Ela consulta o estado atual no Asaas e grava billing_payments, mas nunca altera o plano ou as permissões reais da clínica. Sem essa variável, permanece o fluxo Sandbox legado já validado.

Configurar APP_ORIGIN com a origem da prévia para os retornos do checkout. Selecionar eventos de checkout, pagamentos suportados em server/asaasEvents.js e SUBSCRIPTION_CREATED, SUBSCRIPTION_UPDATED, SUBSCRIPTION_INACTIVATED, SUBSCRIPTION_DELETED no webhook Sandbox.

## Validação realizada em 11/10/2026

46 testes automatizados passaram; build concluído; lint com os seis avisos anteriores. O ensaio da nova migração e os testes de cancelamento, estorno total e isolamento Sandbox passaram no Supabase dentro de uma transação revertida. A migração foi então aplicada com sucesso. O teste billing_production.sql também passou no Supabase com ROLLBACK, cobrindo ativação, renovação, estorno de mês antigo, idempotência, suspensão, duplicação e permissões. Nenhuma cobrança real foi solicitada. A instalação do PGlite não concluiu; a validação SQL foi executada diretamente no PostgreSQL do Supabase, com dados de teste revertidos.

## Pendências externas

- Publicar a prévia e validar a conciliação completa com eventos reais de Sandbox, incluindo renovação, cancelamento e estorno.
- Cancelamento e solicitação de estorno ainda são realizados pelo painel Asaas; o código acompanha os eventos, não solicita essas operações.
- Validação local de PostgreSQL verifica ativação de plano, renovação, estorno e isolamento usando registros descartáveis. Não representa uma cobrança real nem uma validação ponta a ponta do provedor.
- A cobrança real permanece protegida por ASAAS_PRODUCTION_ENABLED. Limites de recursos por pacote ainda exigem validação antes da comercialização.
