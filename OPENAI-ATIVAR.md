# Ativar o assistente OpenAI na SEMAD

Este pacote já contém a rota `/api/chat` e o chat conectado a ela. A chave da OpenAI nunca é enviada ao navegador. Sem chave, o restante do site continua funcionando e o chat informa indisponibilidade.

## 1. Atualizar o banco

Se você já executou `supabase/01-schema.sql`, não precisa recomeçar.

1. Abra https://supabase.com/dashboard e clique no projeto da SEMAD.
2. No menu esquerdo, abra **SQL Editor**.
3. Clique em **New query** ou **+**.
4. Abra o arquivo `supabase/02-chat-openai.sql` do pacote em um editor de texto.
5. Copie todo o conteúdo e cole na consulta.
6. Clique em **Run** e aguarde a confirmação.

Se é sua primeira instalação, execute primeiro `01-schema.sql` e depois `02-chat-openai.sql`. Ambos podem ser executados novamente sem apagar dados. A nova migração guarda somente o contador diário de uso; não guarda conversas ou cadastros de participantes.

## 2. Criar a chave da OpenAI

1. Abra https://platform.openai.com e faça login.
2. Selecione ou crie um projeto para a SEMAD no seletor de projetos.
3. Abra **API keys**. Atalho: https://platform.openai.com/api-keys.
4. Confira que está no projeto correto.
5. Clique em **Create new secret key**.
6. Nomeie a chave, por exemplo `semad-vercel`, e confirme a criação.
7. Copie o valor e guarde-o em um gerenciador de senhas. O valor completo pode não ser exibido novamente.
8. Se escolher permissões Restricted, permita a criação de respostas na API Responses (`/v1/responses`). A chave não precisa de acesso aos dados Supabase nem ao seu GitHub.

Na plataforma OpenAI, abra **Settings > Billing**, na organização correspondente ao projeto, e confira se a API tem faturamento/saldo disponível. A conta da API possui faturamento separado do ChatGPT; não suponha que sua assinatura ativa automaticamente o envio de chamadas. Confira eventuais créditos disponíveis na própria plataforma.

Não compartilhe a chave na conversa, em imagens ou no código. Não coloque em `public/base.js` nem no `index.html`.

## 3. Cadastrar na Vercel

1. Entre em https://vercel.com/dashboard.
2. Clique no projeto **semad2027**.
3. Abra **Settings**.
4. Na interface que você mostrou, abra **Environments > Production** e localize **Environment Variables**. Se a opção aparece diretamente no menu Settings, use-a.
5. Clique em **Add Environment Variable**.
6. Em **Key/Name**, digite `OPENAI_API_KEY`.
7. Em **Value**, cole a chave da OpenAI, sem aspas e sem espaços extras.
8. Selecione **Production** e marque **Sensitive**, quando disponível.
9. Clique em **Save**.

Opcionais, com os valores padrão já implementados:

| Key | Valor sugerido | Efeito |
|---|---|---|
| `OPENAI_MODEL` | `gpt-4.1-mini` | Modelo de texto usado na API Responses |
| `CHAT_DAILY_LIMIT` | `200` | Até 200 tentativas de chamada de IA por dia para o site inteiro |

Pode deixar as duas variáveis opcionais ausentes para usar esses padrões. `CHAT_DAILY_LIMIT=0` pausa as chamadas pagas. Aceita valores inteiros de 0 a 5000. O modelo deve estar disponível na sua conta e ser compatível com o payload de texto da Responses API.

As cinco variáveis Supabase/SITE_URL/ADMIN_EMAILS anteriores continuam necessárias. Resend continua opcional e não participa deste chat.

## 4. Atualizar o GitHub e a implantação

1. Extraia o novo ZIP.
2. No repositório conectado à Vercel, use **Add file > Upload files**.
3. Envie o conteúdo inteiro, preservando as pastas `api`, `server`, `public`, `supabase` e os arquivos da raiz. Não envie só o ZIP nem só o HTML.
4. Faça **Commit changes** na branch de produção.
5. Na Vercel, aguarde o deploy ficar **Ready**. Se as variáveis foram alteradas depois, abra **Deployments > ⋯ > Redeploy**.
6. Abra seu endereço principal (`SITE_URL`), recarregue a página e clique em **Dúvidas? Pergunte ao assistente**.
7. Pergunte “Quando acontece a SEMAD?” e “Onde será realizada?”. O contexto informa as datas e deixa o local como pendente.

O código foi verificado com respostas simuladas da OpenAI para não fazer chamadas pagas sem sua configuração. O primeiro teste no seu site fará uma chamada real, sujeita à cobrança da API.

## 5. Informações e limites do assistente

- Responde em português, usando uma base de fatos da SEMAD em `server/chat.js`.
- A grade é prévia temática. Horários, palestrantes, local, formato, custos e condições finais de certificação permanecem pendentes.
- Não tem ferramentas para consultar inscritos, conferir cadastros, emitir certificados, enviar e-mails ou alterar presenças.
- No máximo 500 caracteres por pergunta; envia somente até 7 mensagens recentes, com tamanho total limitado.
- No máximo 6 perguntas por IP/minuto e 30 por minuto para todo o site, com contador compartilhado no banco.
- Limite diário padrão de 200 tentativas, no fuso de Brasília, aplicado atomicamente no Supabase. Falhas de rede e do provedor também contam, evitando que tentativas com resultado incerto contornem o limite.
- Cada chamada limita a saída a 500 tokens. Não equivale a um teto exato de reais/dólares: o custo depende do modelo e do tamanho das mensagens. Monitore Usage/Billing da OpenAI. Alertas de orçamento do provedor não devem ser tratados como bloqueio rígido.
- Timeout de 20 segundos e mensagens de erro sem revelar chave ou detalhes internos do provedor.
- A resposta é inserida como texto, sem executar HTML fornecido pelo modelo.

O modelo recebe as instruções de não inventar fatos, mas IA pode errar. Mantenha o contexto atualizado e confira informações importantes antes de divulgá-las como oficiais.

## 6. Privacidade

O aviso no próprio chat informa que as perguntas e o histórico recente são enviados à OpenAI. O backend não consulta nem envia a lista de inscritos. Pedimos que visitantes não informem dados pessoais no chat.

O histórico fica somente na memória da página; não é salvo no Supabase por este código. As requisições usam `store:false`, desabilitando o armazenamento da resposta para recuperação via Responses API. Isso não constitui promessa de retenção zero de todos os registros do provedor; consulte as políticas e controles de dados da sua conta OpenAI.

Revise seu aviso de privacidade para incluir o assistente antes de abri-lo ao público.

## 7. Se aparecer erro

- **Assistente ainda não ativado:** conferir `OPENAI_API_KEY` em Production e fazer Redeploy.
- **Banco não configurado/migração:** executar 01 e 02 no SQL Editor do mesmo projeto das variáveis.
- **API precisa de configuração:** conferir validade/permissões da chave OpenAI.
- **Limite do provedor:** conferir Usage/Billing, saldo e limites de API.
- **Limite diário:** esperar a próxima data no fuso de Brasília ou alterar conscientemente `CHAT_DAILY_LIMIT` e fazer Redeploy.
- **Origem inválida:** abrir o endereço principal definido em `SITE_URL`; previews com outra origem não são autorizados a gravar.

Referências oficiais:
- https://developers.openai.com/api/reference/resources/responses/methods/create
- https://developers.openai.com/api/docs/models/gpt-4.1-mini
- https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform
