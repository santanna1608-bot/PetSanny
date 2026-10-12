# Prontidão comercial do PetSanny — 12/10/2026

## Parecer

Não liberar aquisição aberta de assinaturas pagas neste momento. Candidato a piloto acompanhado, depois de confirmar cadastro, recuperação de acesso, política de dados e procedimento de backup. Interface publicada e funcionalidades implementadas não equivalem a uma operação comercial validada.

## Escopo e limites

Revisão do código React, APIs, migrations, documentação e testes locais. Considera as publicações e validações reais registradas nesta conversa. Não houve cobrança real, acesso aos valores dos segredos, teste de invasão, teste de carga, restauração de backup nem auditoria jurídica. A configuração atual da Vercel/Supabase/Asaas não foi revalidada integralmente nesta rodada. Documentos antigos contêm estados anteriores e não devem ser tratados como estado atual.

## Evidências positivas

- Login e recuperação de senha implementados com Supabase; vínculos de clínica e funções verificadas no servidor.
- Migrações com isolamento por tenant, controle de recursos por plano e bloqueios por validade; ensaios SQL anteriores registrados. Não substituem revalidação do banco implantado.
- Documentos em bucket privado, MIME permitido e limite por arquivo de 10 MB; políticas por clínica.
- Agenda com trava transacional para conflito, recuperação de vagas e lista de espera.
- Portal do tutor com link limitado, expiração e revogação; ensaios anteriores registrados.
- Cobrança usa preços no servidor, checkout hospedado no Asaas, webhook autenticado, deduplicação e reconsulta de pagamentos. Retorno do navegador não concede acesso.
- Assistente usa autenticação, cota atômica e consultas por tenant. Jev classifica; OpenAI responde. Sem ferramentas de escrita, envio ou orientação clínica. Chamadas reais na prévia registradas; não houve nova chamada aos modelos nesta análise.
- Landing, favicon e motion publicados; CSS/React respeitam redução de movimento. Isso não constitui certificação completa de acessibilidade ou de taxa de quadros.

## Pendências prioritárias

| Prioridade | Pendência / evidência | Critério de conclusão |
|---|---|---|
| P0 | Contratação paga continua anunciada como indisponível na landing. API exige ASAAS_PRODUCTION_ENABLED=true. Último estado confirmado: cobrança real não habilitada. | Revalidar configuração sem expor segredos, webhook de produção, primeira contratação autorizada pelo proprietário, ativação, renovação, atraso, cancelamento e estorno. Não ativar apenas uma variável sem validação. |
| P0 | Nenhuma evidência de restauração de backup. Backup gerenciado pode existir fora do repositório. | Confirmar cobertura de banco e arquivos, retenção, responsável, procedimento e restauração em ambiente isolado. |
| P0 | Não localizados termos, política de privacidade pública, fluxo de aceite e canal de solicitações sobre dados. Docs técnicos de IA não são página para clientes. | Publicar informações do fornecedor, tratamento de dados e fornecedores de IA, atendimento e regras comerciais; validar adequação com responsável jurídico. Não é parecer legal. |
| P0 | Suíte completa local não executa devido a dependências incompletas. Sem .github/workflows no repositório. | Instalação limpa reproduzível; build, lint, suíte JS/SQL e fluxos críticos aprovados. CI para futuras alterações. |
| P1 | Não localizados exportação completa por clínica nem procedimento de encerramento/exclusão. | Exportação de registros/arquivos, encerramento documentado e tratamento de retenção antes de oferecer portabilidade ao cliente. |
| P1 | BillingCenter declara “WhatsApp automático e IA ainda indisponíveis”, contrariando a IA publicada. | Revisar cadastro, cobrança, ajuda e docs; alinhar promessas e estado real. |
| P1 | Cancelamento da recorrência e estorno dependem de ação no Asaas; não há comando correspondente no PetSanny. | Canal claro, responsável e prazo para cancelamento/estorno. Autoatendimento pode vir depois; procedimento manual deve existir antes da venda. |
| P1 | Não localizada integração de alertas de incidentes/erros ou reconciliação periódica de produção. Diagnóstico/reprocessamento atual é restrito ao Sandbox. | Monitorar indisponibilidade, webhook falho, fila interrompida, pagamentos não conciliados e IA; alertas e procedimento de recuperação. |
| P1 | Memberships existem, mas não localizado fluxo completo de convites/remover equipe na interface revisada. | Testar convite, aceite, revogação e permissões com contas separadas. Não vender gestão completa de equipe até validar. |
| P1 | Assistente validado com sessão na prévia; produção teve configuração/publicação, sem conversa autenticada real confirmada nesta auditoria. | Testar ajuda, agenda, pendências, erro/cota e limites no domínio oficial, sem dados pessoais no pedido. |
| P1 | Sem evidência de ensaio comercial ponta a ponta com uma clínica nova e dois tenants concorrentes. | Cadastro/e-mail/login/recuperação, CRUD/persistência, upload/download, portal, plano/vencimento e isolamento com contas separadas. |
| P2 | Custos de IA, banco, storage, suporte e limites de armazenamento não demonstrados. Limite por arquivo não limita volume por clínica. | Orçamento e margem por plano, limites de consumo, controle de abuso/rajadas e alertas de gasto. |
| P2 | Favicon circular embute PNG de aproximadamente 974 KB em SVG de aproximadamente 1,3 MB. | Otimizar asset para tamanho de ícone preservando marca; medir carregamento/mobile. |
| P2 | Nenhum benchmark de acessibilidade completa, carga ou performance foi feito. | Teclado, foco/trap de modais, leitores de tela, contraste, mobile e desempenho com quantidade realista de dados. |

## Testes nesta rodada

Comando: node --experimental-vm-modules --test tests/*.test.mjs.

Resultado: 20 testes passaram; 7 arquivos não executaram por módulos ausentes (typescript e dependências Supabase). As falhas de carregamento não demonstram defeitos funcionais específicos, mas impedem afirmar que a suíte passou. Testes executáveis cobriram assistente, diagnóstico administrativo e webhook. O script npm test também não inclui assistant.test.mjs nem admin-billing-diagnostic.test.mjs; atualizar cobertura do comando oficial.

Não houve execução nova de SQL, build limpo local ou teste de carga. Builds recentes da Vercel passaram, mas build aprovado não prova os fluxos de negócio.

## Ordem recomendada

1. Recuperar validação automatizada e fechar inconsistências de produto/documentação.
2. Confirmar backup/restauração, políticas públicas, canal de suporte e encerramento.
3. Validar uma clínica nova e isolamento de dois tenants no ambiente de homologação.
4. Fechar custos, termos comerciais e procedimento de cancelamento.
5. Validar produção com o proprietário e habilitar cobrança somente após os critérios P0.
6. Iniciar piloto com poucas clínicas e acompanhamento próximo; ampliar aquisição após observar operação real.

WhatsApp automático não é condição para vender uma versão que declara claramente sua ausência. Também não é necessário implementar toda integração planejada: vender apenas recursos comprovados, com expectativas e suporte definidos.
