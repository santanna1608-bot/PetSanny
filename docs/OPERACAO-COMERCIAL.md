# Operação comercial — preparação

Status: procedimento proposto, ainda não executado. Não habilitar cobrança apenas porque o código compila.

## Backup e recuperação

Verificação em 12/10/2026: painel do projeto dpcyahwodzpolzuznrrq identifica organização Free e informa que não inclui backups do projeto. Upgrade para Pro oferece até 7 dias de backups agendados. Não houve contratação, backup ou restauração nesta verificação. Evidência: supabase-backup-status.jpg.

Documentação consultada: https://supabase.com/docs/guides/platform/backups. Backups do banco não incluem objetos armazenados pela Storage API; apenas seus metadados. Portanto, mesmo com plano pago, preparar cópia privada separada dos arquivos. No Free, a documentação recomenda exportações regulares via CLI e backups fora do projeto. Escolha de plano/destino aguarda o proprietário.

1. Conferir no Supabase o plano contratado, retenção de backups, acesso ao restauro e limites. Registrar responsável, frequência e objetivos de perda máxima de dados e prazo de recuperação aprovados pelo proprietário.
2. Garantir cópia independente dos objetos do bucket privado pet-documents e metadados correspondentes. Confirmar explicitamente a cobertura de arquivos: não presumir que backup do PostgreSQL inclui objetos.
3. Guardar cópias em destino privado, cifrado e com acesso restrito; nunca dentro deste repositório ou de um diretório público.
4. Restaurar em projeto isolado, sem apontar produção para ele, sem envio de e-mail/mensagens/cobranças e sem chaves Asaas/OpenAI/TypeSafe de produção.
5. Verificar contas, associações, RLS, dados de duas clínicas, pedidos de cobrança e acesso/download dos documentos. Confirmar que tokens antigos e links públicos não foram expostos pela restauração.
6. Registrar data, responsável, fonte, duração, contagens verificadas, arquivos de amostra e resultado. Só marcar aprovado depois de executar e demonstrar recuperação.

## Incidentes

- Identificar ambiente, horário, função afetada e identificadores técnicos mínimos; não copiar tokens, mensagens pessoais, prontuários ou payloads completos para logs.
- Consultar Vercel, Supabase e Asaas por seus painéis autorizados. Definir destinatário e canal dos alertas antes de configurar integrações.
- Se webhook falhar: preservar fila/eventos, conferir token e resposta, conferir vínculo exato e estado atual no Asaas. Não criar cobrança substituta nem trocar chave por tentativa.
- Pagamento confirmado sem acesso: conferir o pedido, assinatura, ambiente, valor, vencimento, situação da clínica e processamento do evento. Nunca conceder plano apenas pelo retorno do navegador.
- Checkout em estado incerto: verificar a operação no Asaas antes de repetir.
- IA indisponível: conferir chaves/limites/provedores sem revelá-los. Tentativas podem consumir cota; comunicar isso ao atendimento.
- Não há reconciliação periódica de produção implementada por este documento. Definir monitoramento de fila e procedimento manual até haver implementação validada.

## Cancelamento e encerramento

Antes de vender, o proprietário deve definir canal, prazos, responsável, regras de renovação, reembolso e retenção dos dados. As regras precisam aparecer para o cliente antes da contratação.

1. Confirmar a identidade e vínculo de quem solicita.
2. Diferenciar cancelamento da recorrência, estorno de pagamento e encerramento/exclusão de dados. Uma ação não implica automaticamente as outras.
3. Cancelar recorrência no Asaas pelo responsável financeiro; preservar período já pago conforme política e comportamento implementado.
4. Conferir entrega do evento e estado no PetSanny; registrar confirmação ao cliente.
5. Oferecer exportação quando implementada e verificada. Não prometer exportação completa enquanto só há downloads individuais.
6. Executar exclusão somente com escopo, autorização, retenção e recuperação definidos; nenhuma exclusão é realizada por este procedimento.

## Roteiro de homologação de uma clínica nova

Usar duas contas e duas clínicas de teste identificadas, com dados sintéticos. Não usar dados reais de tutores em modelos de IA.

- Cadastro, confirmação de e-mail, login, logout e recuperação de senha.
- Cadastro de tutor/pet, reagendamento, conflito de agenda e persistência após recarregar.
- Documento: formato/tamanho recusado, upload válido, download privado e isolamento entre clínicas.
- Portal: emitir, confirmar, solicitar alteração, expirar/revogar e negar leitura de outro atendimento.
- Plano: permissões, trial válido/expirado, período pago, suspensão administrativa e extensão única.
- IA: ajuda, agenda, pendências, pedido fora de escopo, cota esgotada e falha dos provedores.
- Cobrança no Sandbox: pagamento, renovação, atraso, cancelamento, estorno e evento repetido. Nenhuma alteração de produção.
- Mobile/teclado: navegação, foco, modais e redução de movimento.

Registrar evidência e resultado de cada item. Um build aprovado não substitui esse roteiro.

## Dados pendentes do fornecedor

Razão social/nome, CNPJ quando aplicável, e-mail e canal de suporte/cancelamento, responsáveis de operação, regras comerciais e retenção. Não inventar esses dados e não publicar termos como definitivos sem sua definição e revisão apropriada.

Contatos já fornecidos: santanna1608@gmail.com e WhatsApp (21) 98106-2423. O proprietário informou não ter CNPJ e identificou o fornecedor como LF7 Marketing & IA. Política aprovada: cancelamento solicitado a qualquer momento, interrompendo a próxima renovação e mantendo acesso até o fim do período já pago. Condições de estorno, identificação civil do responsável, retenção e demais regras ainda precisam ser definidas/revisadas antes de termos definitivos.

Escolha aprovada em 12/10/2026: manter Supabase Free e preparar backup externo do banco e dos arquivos. Ainda não há destino contratado/configurado; nenhuma cópia foi executada. Preparar destino privado independente, credenciais restritas, cifragem, rotina de execução e ensaio de restauração. Não confundir exportação por cliente com backup integral do serviço.

## Security Advisor — revisão pendente

Em 12/10/2026 o painel exibiu zero erros, 12 avisos e quatro sugestões. Isso não é prova de ausência de vulnerabilidades. Avisos incluem SECURITY DEFINER executável por anon/authenticated (portal do tutor, bootstrap, administrador atual, extensão de trial e emissão/revogação de links); alguns são intencionais, exigindo conferência das validações internas e privilégios implantados.

Também aparece public.rls_auto_enable() executável por público/autenticados; revisar tipo, uso e necessidade desses grants antes de alterar. Proteção contra senhas vazadas está desativada. Não foram alteradas permissões nem configurações de autenticação durante a inspeção.
