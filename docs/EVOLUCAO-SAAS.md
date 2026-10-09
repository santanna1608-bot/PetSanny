# Evolução autorizada do PetSanny

O usuário autorizou os diferenciais propostos e pediu a reconstrução da landing page após a implementação, com ideias para três pacotes.

## Sequência e dependências

1. Recuperação de agenda: cancelamento com motivo/histórico, reagendamento, bloqueio de conflito e lista de espera. Migração 005.
2. Passaporte de cuidados, próximo retorno combinado e etapas do atendimento. Migração 006.
3. Portal com link privado, limitado ao atendimento, com prazo e revogação; confirmação e solicitação de reagendamento pelo tutor. Não compartilhar prontuário, contatos ou financeiro pelo link.
4. WhatsApp no servidor: uma instância por clínica, segredos fora do navegador, consentimento e situação real de entrega. O usuário informou que removeu a Evolution da VPS: serviço indisponível. Reinstalação ou outro provedor é dependência para envios reais.
5. Recuperação de clientes: fila de retornos combinados, contato autorizado e atribuição explícita de agendamentos concluídos à ação. Não inferir faturamento sem pagamento registrado.
6. IA auxiliar: avaliar classificação administrativa com TypeSafe/Jev após existir canal de entrada e exemplos representativos. Nenhuma chamada real a Jev foi executada; não declarar integração concluída.
7. Cobrança e limites por pacote: dependem de provedor e configuração do serviço de assinaturas. Os nomes abaixo ainda são propostas, não limites implementados.
8. Reconstruir a landing page depois da validação dos recursos. Remover promessas sem implementação e números de prova social sem evidência. Não anunciar WhatsApp ou IA como disponíveis enquanto pendentes.

## Proposta de três pacotes

| Pacote | Público e proposta | Recursos propostos |
|---|---|---|
| Essencial | Organizar a operação diária | Agenda, tutores/pets, prontuário, documentos, passaporte de cuidados e financeiro básico |
| Crescer | Reduzir vagas e acompanhar retornos | Essencial + fila de espera, confirmação/reagendamento pelo tutor, acompanhamento do atendimento e campanhas de retorno com medição |
| Profissional | Gerir equipe e acompanhar resultados | Crescer + automações com cotas, indicadores gerenciais, permissões de equipe e assistência administrativa por IA |

Não definir preços finais antes de calcular custo de WhatsApp, armazenamento, IA e suporte. Cotas de mensagens e armazenamento devem ser explícitas; não vender integração ilimitada sem custo sustentável. Recursos de segurança e exportação de dados devem existir em todos os pacotes.

## Situação de validação em 09/10/2026

- Migrações 005 e 006 aplicadas; testes transacionais de agenda e isolamento do passaporte passaram no Supabase com ROLLBACK dos dados de teste.
- Código dos novos recursos passou na compilação e nos 28 testes locais. A análise estática passou com avisos preexistentes.
- Portal do tutor autorizado pelo usuário e migração 007 aplicada. Teste transacional no Supabase passou: leitura mínima, confirmação, pedido sem duplicação, aceite pela equipe, expiração/revogação e isolamento entre clínicas. Interface local conferida na PetCare Barra: emissão e leitura do link e bloqueio após revogação, sem alterar a agenda de Thor. Passaporte aberto e conferido.
- Publicação 9659946 enviada ao GitHub main. Vercel confirmou Ready/Production, domínio petsanny.vercel.app, implantação 8WSYcaA3ZnAHsveuCdeqsjZcd45s em 09/10/2026. WhatsApp, cobrança, IA e reconstrução da landing page continuam pendentes.
- Recomendação para WhatsApp: API oficial com provedor gerenciado e número próprio por clínica. Provedor, contratação e custos ainda pendentes; nenhum envio real implementado.
- Landing page permanece para depois da validação dos recursos, conforme solicitado.
