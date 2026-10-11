# Assistente PetSanny

Primeira versão: interpretação semântica via Jev (TypeSafe), respostas montadas pelo servidor, sem geração livre, alterações ou envio automático. Agenda e pendências usam consultas limitadas ao tenant autenticado; nenhum cadastro ou prontuário é enviado ao TypeSafe. Somente o texto digitado é enviado; a interface informa isso e solicita não incluir dados pessoais.

Profissional/Gold ativo e não vencido: 100 tentativas por mês, compartilhadas pela clínica. Teste válido: 10 tentativas ao todo, inclusive durante eventual extensão. Essencial, Crescer, teste expirado e clínica suspensa não acessam. Reserva atômica no PostgreSQL verifica associação ativa owner/admin/staff, plano, prazo e cota. RPC exclusivo do service_role. Tentativas que chegam ao provedor contam mesmo em caso de falha, limitando custos. Nenhum histórico de conversas é persistido.

Configuração: TYPESAFE_API_KEY somente como Secret no servidor Vercel (Preview para homologação, Production ao publicar); VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já utilizados pelo backend. Não usar prefixo VITE para a chave de IA. Aplicar 202610110014_assistant.sql antes da implantação. Sem chave ou migração, o endpoint falha explicitamente sem simular uma resposta.

Validação: node --test tests/assistant.test.mjs; node scripts/validate-assistant.mjs com chave no ambiente; supabase/tests/assistant.sql com rollback. Cinco pedidos sintéticos reais foram classificados corretamente pelo Jev em 11/10/2026. Os testes SQL de isolamento, planos, vencimento, limites e privilégio RPC retornaram PASS no Supabase.

Homologação na Vercel e ativação por credencial ainda pendentes. Não anunciar como ativo antes de testar o endpoint e a interface implantados.
