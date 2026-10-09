# Asaas: cobrança em testes

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

Ainda necessário: configurar variáveis e webhook, criar checkout real no Sandbox, completar pagamento de teste pelo proprietário e verificar recebimento do evento. Nenhuma chamada real bem-sucedida ao Asaas foi realizada durante a preparação.

Contratação real permanece desativada. Antes de produção: registrar vínculo da assinatura criada, acompanhar eventos de cobranças recorrentes/cancelamento/estorno, definir limites por pacote e aplicar liberação de recursos no servidor. Os três pacotes são catálogo em preparação; limites e separação de recursos ainda não estão aplicados. Landing informa essa condição explicitamente.

## Documentação oficial consultada

- https://docs.asaas.com/docs/asaas-checkout
- https://docs.asaas.com/docs/checkout-com-assinatura-recorrente
- https://docs.asaas.com/docs/checkout-events
- https://docs.asaas.com/reference/criar-novo-checkout
