# Ativar o Gemini no chat da SEMAD

O pacote foi atualizado para usar exclusivamente a API Gemini. O chat fica no mesmo lugar e usa a rota `/api/chat` na Vercel. A chave fica somente no backend. Inscrições e certificados não dependem da chave Gemini.

## 1. Criar uma chave gratuita

1. Entre em https://aistudio.google.com/ com sua conta Google.
2. Abra **Get API key** ou **API keys**. Atalho: https://aistudio.google.com/api-keys.
3. Clique em **Create API key**.
4. Se solicitado, selecione ou crie um projeto para a SEMAD.
5. Copie a chave e guarde com segurança. Não envie na conversa ou no GitHub.
6. Confira que o projeto está na modalidade **Free Tier**. Para usar somente a cota gratuita, não ative faturamento pago nem use uma chave de outro projeto com cobrança habilitada.

O modelo padrão deste pacote é `gemini-3.5-flash-lite`, que tem modalidade gratuita na tabela oficial consultada. O acesso e as cotas dependem da conta e podem mudar. Se o modelo não estiver disponível para sua conta, o erro orienta conferir `GEMINI_MODEL`. Não há troca automática para modelo/provedor pago.

O código não consegue garantir gratuidade de um projeto Google ao qual você já habilitou faturamento. A modalidade Free Tier é uma configuração da conta/projeto Google; o limite local de uso apenas restringe a quantidade de chamadas.

## 2. Configurar na Vercel

1. Abra https://vercel.com/dashboard e clique em **semad2027**.
2. Entre em **Settings > Environments > Production** e procure **Environment Variables**. Se a seção de variáveis aparecer diretamente em Settings, use-a.
3. Clique em **Add Environment Variable**.
4. Em **Name/Key**, coloque `GEMINI_API_KEY`.
5. Em **Value**, cole a chave criada no Google AI Studio, sem aspas.
6. Selecione **Production**, marque Sensitive quando disponível e clique em **Save**.
7. Pode remover `OPENAI_API_KEY` e `OPENAI_MODEL` da Vercel: este pacote não usa essas variáveis. Não remova as variáveis do Supabase, `ADMIN_EMAILS` nem `SITE_URL`.

Opcionais:

| Nome | Padrão | Função |
|---|---|---|
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Modelo de texto, com acesso disponível na sua conta |
| `CHAT_DAILY_LIMIT` | `200` | Limite local de tentativas por dia para o site inteiro |

Sem `GEMINI_MODEL`, usa o padrão. `CHAT_DAILY_LIMIT=0` pausa as chamadas. O limite aceita 0 a 5000 e não aumenta a cota concedida pelo Google. Se a cota gratuita for menor, ela será atingida antes.

## 3. Atualizar os arquivos

1. Extraia o novo ZIP.
2. No GitHub, abra o repositório conectado à Vercel.
3. Clique em **Add file > Upload files**.
4. Envie os arquivos e pastas de dentro do ZIP, preservando a estrutura. Atualize o projeto completo, não somente o HTML ou o ZIP.
5. Faça **Commit changes** na branch de produção.
6. Na Vercel, aguarde o deploy ficar Ready. Para aplicar variáveis salvas depois do deploy, use **Deployments > ⋯ > Redeploy**.
7. Abra seu endereço principal da Vercel e atualize com **Ctrl + Shift + R**. Não teste no antigo arquivo HTML aberto no computador ou no site de demonstração.

## 4. Banco: preciso executar outro SQL?

- Se você já executou `01-schema.sql` e o antigo `02-chat-openai.sql`, **não precisa de novo SQL**: a estrutura do contador não mudou.
- Se ainda não ativou o contador do chat, execute `supabase/02-chat.sql` no Supabase: projeto > SQL Editor > New query > cole o conteúdo > Run.
- Na primeira instalação, execute primeiro `01-schema.sql` e depois `02-chat.sql`.

A mudança do nome do arquivo não cria outro banco nem apaga seus registros. Os scripts são idempotentes. Não execute migrações para tentar contornar uma cota do Google.

## 5. Testar

Pergunte “Quando acontece a SEMAD?” e “Como me inscrevo?”. O chat usa os fatos do evento em `server/chat.js` e informa quando os dados ainda não foram confirmados.

O teste real requer sua chave válida e uma cota disponível no Google. Esta entrega foi testada com respostas simuladas do provedor, sem usar suas credenciais.

Mensagens de erro:

- **Assistente ainda não ativado:** conferir `GEMINI_API_KEY` em Production e fazer Redeploy.
- **Conferir chave/modelo/acesso:** conferir a chave e as restrições da API Gemini no projeto Google. Uma chave restrita exclusivamente ao navegador não deve ser usada neste backend serverless.
- **Modelo indisponível:** conferir os modelos de texto liberados na conta e a variável `GEMINI_MODEL`.
- **Cota do Gemini esgotada:** aguardar a renovação ou consultar os limites em Google AI Studio. Não é necessário ativar cobrança para continuar usando o site sem chat.
- **Limite diário:** o contador local atingiu `CHAT_DAILY_LIMIT`; retorne no dia seguinte, no fuso de Brasília.
- **Origem inválida:** abrir a URL definida em `SITE_URL`.

## 6. Uso e privacidade

Até 500 caracteres por pergunta e 7 mensagens recentes. Máximo de 6 perguntas/IP/minuto, 30/minuto no total e 200 tentativas/dia por padrão. Os limites são compartilhados no Supabase. Falhas de provedor e rede também contam para evitar tentativas ilimitadas. Não são feitas novas tentativas automáticas nem fallback para OpenAI.

As mensagens são enviadas ao Google; na modalidade gratuita, podem ser usadas para melhorar os produtos do Google, conforme os termos aplicáveis. O aviso no chat foi atualizado. Não informe dados pessoais e revise o aviso de privacidade do evento antes de abrir o chat ao público.

O backend não consulta nem envia cadastros de participantes ao Gemini. O histórico fica na memória da página, não é salvo no Supabase por este código. O provedor aplica suas próprias políticas de tratamento de dados; não há promessa de retenção zero.

O assistente não tem ferramentas para emitir certificados, enviar e-mails, marcar presença ou consultar inscrições. Ele é orientado a responder somente sobre a SEMAD e a não inventar fatos, mas respostas de IA podem conter erros.

Documentação consultada:
- https://ai.google.dev/api/generate-content
- https://ai.google.dev/gemini-api/docs/pricing
- https://aistudio.google.com/docs/models/gemini-3.5-flash-lite
