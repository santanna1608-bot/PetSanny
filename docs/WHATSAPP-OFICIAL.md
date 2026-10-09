# Próxima etapa: WhatsApp oficial

Situação em 09/10/2026: o proprietário informou que ainda não possui conta empresarial Meta nem número para testar. Nenhum provedor contratado, segredo configurado ou envio real realizado. O portal por link já está disponível independentemente do WhatsApp.

## Comparação inicial

| Opção | Taxa pública do provedor | Observação |
| --- | --- | --- |
| Gupshup | US$ 0,001 por mensagem, mais tarifas da Meta | Candidata para avaliar custo e cadastro de múltiplas clínicas; condições comerciais e suporte precisam ser confirmados. |
| Twilio | US$ 0,005 por mensagem recebida ou enviada, mais tarifas da Meta | Documentação e ambiente de testes disponíveis; documentação alerta para possíveis restrições do número de teste no Brasil. |
| 360dialog | Licença mensal, mais tarifas de mensagens | Solicitar proposta adequada ao modelo de SaaS e quantidade de números. |

Essas taxas não representam custo total: considerar categoria da mensagem, país do destinatário, câmbio, impostos e condições comerciais. Não assumir que valores zero exibidos num seletor de país ainda não preenchido representam gratuidade.

Fontes oficiais consultadas:

- https://www.gupshup.ai/isv-partners/whatsapp-api/pricing
- https://www.twilio.com/en-us/whatsapp/pricing
- https://www.twilio.com/docs/whatsapp/sandbox
- https://docs.360dialog.com/docs/get-started/pricing

## Preparação do proprietário

1. Criar ou acessar o portfólio empresarial Meta com os dados reais da empresa.
2. Definir um número de teste sob seu controle que consiga receber a verificação solicitada pelo serviço. Não remover nem migrar um número existente antes de conferir as opções de coexistência e o procedimento do provedor escolhido.
3. Avaliar o cadastro de cada clínica com seu próprio número e conta empresarial, usando o fluxo de parceiros do provedor.
4. Selecionar o provedor e configurar segredos diretamente no ambiente do servidor, sem enviá-los pelo chat.

## Requisitos da implementação

- Integração exclusivamente no servidor; nunca colocar credenciais do provedor no navegador ou em variáveis VITE.
- Toda conexão e mensagem vinculada à clínica autenticada; isolamento de contas e números.
- Registrar autorização de contato e respeitar descadastro antes de cada envio.
- Primeira etapa: confirmações, lembretes e aviso de pet pronto; excluir prontuário e dados financeiros das mensagens.
- Usar modelos aprovados quando exigidos pelo serviço, sem assumir janela aberta de atendimento.
- Registrar entrega real por notificações autenticadas do provedor; não confundir aceitação do pedido com entrega ao tutor.
- Evitar duplicidade em tentativas de envio e definir cotas e limites antes de vender automações.
- Validar primeiro com destinatário de teste autorizado; ativar produção somente após teste real bem-sucedido.

Não implementar uma simulação de envio como se fosse integração concluída. Cobrança, IA e nova landing page continuam etapas independentes pendentes.
