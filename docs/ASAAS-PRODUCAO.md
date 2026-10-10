# Asaas em produção

Preparado em 10/10/2026. Não houve cobrança real nem confirmação de webhook real nesta implementação.

## Configuração no servidor da Vercel

- `ASAAS_PRODUCTION_API_KEY`: chave de produção, já informada pelo usuário na Vercel.
- `ASAAS_ENVIRONMENT=production`: seleção explícita recomendada. Sem ela, uma chave de produção presente seleciona produção.
- `SUPABASE_SERVICE_ROLE_KEY`: acesso exclusivo do servidor ao banco.
- `ASAAS_WEBHOOK_TOKEN`: segredo aleatório de pelo menos 32 caracteres, igual ao token do webhook no Asaas.
- `ASAAS_PRODUCTION_ENABLED=true`: habilitar somente depois da migração, validação do webhook e revisão dos pacotes. Ausente significa checkout real bloqueado.

Não usar prefixo VITE nos segredos; não publicar valores em código, logs ou mensagens. Alterações das variáveis exigem novo deploy.

## Banco e webhook

Aplicar `supabase/migrations/202610100010_billing_production.sql` no projeto `dpcyahwodzpolzuznrrq`. Essa migração não apaga dados.

No Asaas: nome `PetSanny — Produção`, URL `https://petsanny.vercel.app/api/asaas-webhook`, e-mail `santanna1608@gmail.com`, API v3, envio sequencial. Colar pessoalmente o token já salvo na Vercel. Preservar outros webhooks da conta.

Eventos: CHECKOUT_PAID, CHECKOUT_CANCELED, CHECKOUT_EXPIRED e os PAYMENT_* listados em `server/asaasEvents.js` (confirmação, recebimento, atualização, atraso, remoção, restauração, estorno e contestação).

O endpoint responde 401 para token inválido e 503 quando não consegue persistir/conciliar. Configurar as retentativas e conferir a fila de entrega no Asaas. Não salvar uma nova chave só para contornar erros da integração.

## Comportamento implementado

O checkout envia valores do catálogo do servidor e monta a URL pelo identificador retornado. Cartão e recorrência mensal; nenhum dado de cartão entra no PetSanny. O retorno do navegador não concede acesso.

CHECKOUT_PAID consulta `/payments?checkoutSession=...` no Asaas para associar cobrança e assinatura ao pedido. Eventos posteriores reconsultam a cobrança atual. Eventos repetidos são deduplicados por ambiente e identificador. Apenas cobranças CONFIRMED/RECEIVED do valor contratado liberam um mês a partir do vencimento. Estornos/contestações retiram a validade daquela cobrança, preservando outros meses pagos. Suspensão administrativa prevalece. Escritas operacionais são bloqueadas quando termina o período contratado; consulta e acesso à cobrança são preservados.

Os pagamentos do SaaS ficam separados do financeiro da clínica. Eventos anteriores à associação são registrados sem dados sensíveis; a consulta do checkout reconcilia o estado atual das cobranças. Pagamentos avulsos externos ao SaaS não ativam clínicas.

## Pendências antes de habilitar cobrança real

Aplicar e testar a migração em PostgreSQL, publicar, salvar/validar o webhook no Asaas, testar entrega autenticada e conferir conciliação. Limites/liberação por pacote ainda precisam ser validados. Cancelamento da recorrência e solicitação de estorno ainda devem ser feitos no Asaas; não há botão financeiro correspondente no PetSanny. Esta versão acompanha estornos recebidos, não solicita estornos automaticamente.

Referências: https://docs.asaas.com/docs/introdu%C3%A7%C3%A3o-1 ; https://docs.asaas.com/reference/list-payments ; https://docs.asaas.com/docs/webhook-para-cobrancas
