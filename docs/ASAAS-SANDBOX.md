# Asaas: cobrança em testes

## Estado atualizado em 11/10/2026

Validação posterior: PAYMENT_OVERDUE, PAYMENT_CONFIRMED e SUBSCRIPTION_DELETED foram gerados com os simuladores do Sandbox e receberam HTTP 200/received: true. Consulta de leitura ao banco confirmou pedido paid, assinatura DELETED, duas cobranças CONFIRMED e clínica ainda trial com renewal_date 2026-10-22. O usuário confirmou webhook desativado e bypass removido.

A simulação antecipou dueDate da segunda cobrança de 2026-11-10 para 2026-10-09, mantendo originalDueDate 2026-11-10. Isso revelou paid_until 2026-11-09 para um registro com due_date 2026-11-10. A correção usa originalDueDate quando fornecida apenas no Sandbox. Commit ca69df6 implantado como Ready na prévia 9ERkVZa43rmbLsQMfS8okaHxnbBF; 74 testes locais aprovados. Reprocessamento administrativo do pedido e308c91f-28e5-4841-95d4-257a40233f1a concluído. Consulta posterior ao banco confirmou a segunda cobrança CONFIRMED, due_date 2026-11-10 e paid_until 2026-12-10. A primeira mantém paid_until 2026-11-10; assinatura DELETED e clínica trial com renewal_date 2026-10-22. Evidência local: asaas-lifecycle-corrected.jpg. Produção permanece desativada.

Esta seção substitui as pendências históricas descritas abaixo. O checkout de teste foi pago e conciliado; a entrega automática de CHECKOUT_PAID retornou HTTP 200 com received: true na prévia do commit 3f5fc50. O usuário confirmou a remoção do bypass temporário e o webhook PetSanny — Testes desativado, com zero eventos penalizados.

O servidor também trata eventos de cobranças e assinaturas definidos em server/asaasEvents.js. A conciliação identifica a cobrança pelo checkout ou referência exatos; a consulta alternativa por data aceita somente checkoutSession correspondente e paginação completa. Sandbox não libera acesso de produção.

Roteiro externo executado nesta homologação, somente com a assinatura e cobranças de teste:

1. Atraso: simular vencimento da próxima cobrança no Sandbox e conferir PAYMENT_OVERDUE, HTTP 200 e status OVERDUE no PetSanny.
2. Renovação: confirmar essa cobrança no Sandbox e conferir PAYMENT_CONFIRMED/PAYMENT_RECEIVED, o mesmo vínculo da assinatura e o novo período pago.
3. Cancelamento: cancelar a assinatura de teste, conferir SUBSCRIPTION_INACTIVATED/SUBSCRIPTION_DELETED e preservar o período já pago.
4. Ao terminar, desativar o webhook de testes e revogar o bypass. Não habilitar produção com base apenas nos testes locais.

Documentação dos simuladores oficiais: https://docs.asaas.com/reference/forcar-vencimento e https://docs.asaas.com/reference/confirmar-pagamento. Foram observados PAYMENT_OVERDUE, PAYMENT_CONFIRMED e SUBSCRIPTION_DELETED; isso não comprova todos os demais eventos possíveis, estornos ou liberação de planos em produção.

O usuário escolheu Asaas e Sandbox e aprovou preços mensais iniciais de R$ 97, R$ 197 e R$ 297 para Essencial, Crescer e Profissional.

## Configuração segura

Na Vercel, projeto pet-sanny, Settings → Environment Variables, configurar no ambiente que serve o aplicativo:

- ASAAS_API_KEY: chave da conta Sandbox Asaas. A conta de produção e a conta Sandbox usam credenciais distintas. Código restrito a https://api-sandbox.asaas.com/v3.
- SUPABASE_SERVICE_ROLE_KEY: chave administrativa do Supabase. Nunca usar prefixo VITE. Nunca expor ao navegador.
- ASAAS_WEBHOOK_TOKEN: segredo independente gerado com pelo menos 32 caracteres. Não usar a chave Asaas como token de webhook.
- APP_ORIGIN: https://petsanny.vercel.app (padrão do servidor, opcional).

Não enviar segredos pelo chat nem colocá-los no Git. Alterações em variáveis requerem nova implantação da Vercel.

No Sandbox Asaas, configurar webhook POST para https://petsanny.vercel.app/api/asaas-webhook com o mesmo ASAAS_WEBHOOK_TOKEN no campo de autenticação. Eventos: CHECKOUT_PAID, CHECKOUT_CANCELED e CHECKOUT_EXPIRED. Outros eventos são ignorados; acompanhamento completo de renovação da assinatura ainda pendente.

## Comportamento implementado

- Checkout hospedado pelo Asaas, com cartão e recorrência mensal, apenas em Sandbox.
- Valor vem do catálogo compartilhado; cliente não escolhe valor da cobrança.
- Criar checkout exige sessão válida e vínculo ativo owner/admin na clínica.
- Uma cobrança aberta por clínica impede duplicidade em cliques concorrentes.
- Falha ambígua exige conferência no Asaas antes de tentar novamente; não repetir cobrança automaticamente.
- Retorno para o aplicativo não confirma pagamento. Somente webhook autenticado registra o resultado.
- Eventos duplicados são ignorados; um evento de expiração atrasado não reverte pagamento confirmado.
- Sandbox não altera plano, acesso ou financeiro real. Cliente não pode escrever em billing_orders nem executar a função de confirmação.

## Validação e pendências

Migração 009 aplicada após teste transacional com ROLLBACK aprovado no Supabase. Quatro testes locais de preço, URL, autenticação do webhook e acesso passaram. Compilação passou.

Suite completa: 32 testes aprovados. Rotas do servidor carregadas em Node. Nova landing page e prévias de mensagens conferidas no navegador. Vercel confirmou Ready/Production para o commit 1b4605e, implantação CL6BH8Mxq76yDrk5RgNi8RhTonRe, em 09/10/2026. O usuário pediu orientação para configurar as variáveis; configuração ainda não confirmada.

Ainda necessário: configurar variáveis e webhook, criar checkout real no Sandbox, completar pagamento de teste pelo proprietário e verificar recebimento do evento. Nenhuma chamada real bem-sucedida ao Asaas foi realizada durante a preparação.

Contratação real permanece desativada. Antes de produção: registrar vínculo da assinatura criada, acompanhar eventos de cobranças recorrentes/cancelamento/estorno, definir limites por pacote e aplicar liberação de recursos no servidor. Os três pacotes são catálogo em preparação; limites e separação de recursos ainda não estão aplicados. Landing informa essa condição explicitamente.

## Documentação oficial consultada

- https://docs.asaas.com/docs/asaas-checkout
- https://docs.asaas.com/docs/checkout-com-assinatura-recorrente
- https://docs.asaas.com/docs/checkout-events
- https://docs.asaas.com/reference/criar-novo-checkout
