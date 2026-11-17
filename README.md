# SEMAD 2027 — Vercel + Supabase

Este é o projeto completo para GitHub/Vercel, com o visual do HTML fornecido, inscrições reais, login Supabase e painel de presença/certificados. Não exige domínio próprio para hospedar, registrar inscrições ou baixar certificados. Resend é opcional.

## Assistente Gemini

O chat está conectado ao backend `/api/chat`. Para ativar, siga `GEMINI-ATIVAR.md`: execute também `supabase/02-chat.sql` e cadastre `GEMINI_API_KEY` na Vercel. O domínio próprio não é necessário. Sem a chave, o chat informa indisponibilidade e as inscrições continuam funcionando.

## 1. Executar o SQL no seu Supabase

1. Abra https://supabase.com/dashboard e clique no projeto da SEMAD.
2. No menu esquerdo do projeto, clique em **SQL Editor**.
3. Clique em **New query** ou **+**.
4. Abra `supabase/01-schema.sql` deste pacote em um editor de texto.
5. Copie o conteúdo inteiro e cole na consulta.
6. Clique em **Run**. Espere a confirmação de sucesso.
7. Para o chat, execute também `supabase/02-chat.sql` em uma nova consulta, seguindo o mesmo procedimento.
8. Em **Table Editor**, as tabelas começam com `semad_`. Elas não têm cadastros fictícios.

O script é idempotente: executá-lo novamente não apaga inscrições e não duplica as dez atividades provisórias. As tabelas anteriores do site no Sites não são migradas automaticamente. Este é um banco separado.

O SQL ativa RLS e revoga acesso direto de `anon` e `authenticated` às tabelas e às funções administrativas. Não desative RLS nem crie políticas públicas para contornar erros. Somente o backend com a chave secreta acessa os dados; ele verifica a conta e a lista de administradores.

## 2. Conferir usuário e variáveis

Você disse que as configurações já foram feitas. Confira os nomes abaixo para combinar com este código.

No Supabase:

1. **Authentication > Users**: confirme que sua conta administrativa existe. Ela deve poder entrar com e-mail e senha.
2. A conta deve estar confirmada. Para criar a própria conta manualmente, use **Add user > Create new user** e a confirmação automática somente para o e-mail que você controla.
3. **Authentication > Sign In / Providers**: deixe Email habilitado e cadastros públicos de contas desabilitados. Os participantes não precisam criar contas.
4. **Authentication > URL Configuration > Site URL**: informe o endereço principal da Vercel.

Na Vercel, abra o projeto **semad2027**. Vá para **Settings > Environments > Production** e localize **Environment Variables**. Em interfaces com item próprio, use **Settings > Environment Variables**. Adicione ou confira:

| Nome exato | Valor |
|---|---|
| `SUPABASE_URL` | URL HTTPS do seu projeto, como `https://abc.supabase.co`, sem `/rest/v1` |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key do Supabase; chave antiga `anon` também é aceita |
| `SUPABASE_SECRET_KEY` | Secret key do Supabase; chave antiga `service_role` também é aceita |
| `ADMIN_EMAILS` | E-mail(s) autorizado(s), separados por vírgula |
| `SITE_URL` | `https://semad2027.vercel.app`, se esse for seu endereço principal |

Marque as chaves secretas como Sensitive quando disponível. Não envie chaves ao GitHub, ao HTML nem à conversa. O arquivo `.env.example` tem apenas nomes vazios.

`SITE_URL` deve ser o endereço que você realmente usa no navegador. O backend aceita gravações somente originadas desse endereço. Para um domínio novo, atualize a variável e republique. URLs temporárias de Preview não terão permissão de gravar no backend de produção com outra origem, por decisão de segurança.

### Sem domínio: pode deixar estas variáveis ausentes

- `RESEND_API_KEY`
- `CERTIFICATE_FROM`

O painel informa que o envio está indisponível, mas permite emitir, abrir e salvar PDF. Não é preciso inventar valores para essas variáveis. O código não envia e-mail de confirmação da inscrição.

## 3. Enviar o pacote inteiro ao GitHub

1. Extraia o ZIP no computador.
2. Abra a pasta extraída: você deve ver `api`, `server`, `public`, `supabase`, `package.json` e `vercel.json` no mesmo nível.
3. Abra no GitHub o repositório que está conectado ao seu projeto Vercel.
4. Clique em **Add file > Upload files**.
5. Arraste as pastas e arquivos de DENTRO da pasta extraída. Não envie somente o ZIP e não coloque tudo dentro de uma pasta extra na raiz do repositório.
6. Preserve a estrutura de diretórios.
7. Clique em **Commit changes** na branch conectada à Vercel (na sua captura, `main`).

A página principal agora fica em `public/index.html`; o backend fica em `api/index.js`. O antigo `index.html` sozinho na raiz não contém o sistema completo. Não inclua `.env.local`, senhas ou chaves no upload.

Estrutura principal esperada no GitHub:

```text
api/index.js
server/app.js
server/auth.js
server/supabase.js
server/config.js
server/helpers.js
server/admin.html
server/login.html
server/local.js
public/index.html
public/base.js
public/style.css
public/admin.js
public/login.js
public/print.js
public/config.js
supabase/01-schema.sql
tests/backend.test.js
package.json
package-lock.json
vercel.json
README.md
```

## 4. Configurar e publicar na Vercel

1. Abra https://vercel.com/dashboard e clique no projeto da SEMAD.
2. **Settings > Git**: confira o repositório e a branch de produção.
3. **Settings > Build and Deployment**: use Framework **Other** e Root Directory na raiz onde estão `package.json` e `vercel.json`.
4. Remova overrides antigos de framework/build/output se estiverem conflitantes. O `vercel.json` já define saída `public`, instalação `npm ci` e dispensa build.
5. Use Node.js **24.x**, conforme `package.json`.
6. Confira as variáveis em Production.
7. O commit na branch conectada deve iniciar o deploy. Se precisar aplicar variáveis depois, vá a **Deployments > menu ⋯ da implantação > Redeploy**.
8. Aguarde a implantação ficar **Ready**.

O backend usa uma única Vercel Function Node.js. O `vercel.json` inclui os templates privados no pacote da função e encaminha `/admin`, `/login`, `/certificado/...` e `/api/...` ao backend. Não publique os templates de `server/` dentro de `public/`.

Se não terminar, abra a implantação em **Deployments** e consulte os logs. Mensagens de erro podem ser compartilhadas sem valores de chaves.

## 5. Primeiro acesso e teste no seu site

1. Abra o endereço principal da Vercel.
2. Faça uma inscrição de teste com seu próprio e-mail e guarde o código.
3. Tente novamente com o mesmo e-mail: o site deve preservar a primeira inscrição e impedir outra.
4. Clique no avatar do topo ou abra `/admin`. Você será levado a `/login`.
5. Entre com a conta criada em Authentication > Users. Esse e-mail também precisa estar em `ADMIN_EMAILS`.
6. Confira se sua inscrição aparece. Não deixe dados reais de participantes em contas de teste.
7. Selecione uma palestra e marque a presença após a conferência real.
8. Na aba **Certificação**, configure carga horária e responsável oficiais, e autorize a emissão.
9. Na lista de inscrições, clique em **Emitir certificado** e depois **Abrir / salvar PDF**.
10. No documento, clique em **Imprimir / salvar PDF** e selecione **Salvar como PDF** na janela do navegador.
11. Para testar revogação, corrija a presença para ausência e confirme. O link anterior deve passar a indicar indisponibilidade.

Uma inscrição não comprova comparecimento. A organização confere nome/identificador no credenciamento de cada palestra e registra presença, ausência ou deixa Não conferida. Nome igual não causa exclusão automática: a duplicidade é determinada pelo e-mail normalizado da edição.

O certificado tem um link pessoal com código aleatório. Esse link permite ver nome e atividade para validação. Compartilhe-o somente com quem deve ter acesso ao documento. A listagem dos cadastros nunca fica pública. Revogar o link não apaga um PDF já baixado; a verificação online refletirá a revogação.

## 6. Enviar certificados sem Resend

Emita, abra, salve em PDF e anexe pelo seu e-mail habitual. O envio manual não é registrado como envio automático no painel.

Futuramente, para usar o botão de envio:

1. Configure um domínio verificado no Resend.
2. Cadastre `RESEND_API_KEY` e `CERTIFICATE_FROM` na Vercel.
3. Faça Redeploy.
4. O botão **Enviar por e-mail** enviará um link pessoal do certificado, mediante ação do administrador.

A aceitação pelo provedor não comprova entrega nem leitura. Não são simuladas assinatura digital institucional, horas nem responsáveis.

## 7. Conteúdo e privacidade antes da abertura pública

O layout, as imagens e o texto da base foram preservados. A programação é provisória. Confirme local, formato, horários, palestrantes, condições de participação e certificação.

Edite o responsável pelos dados e o prazo de retenção em `CONFIG.privacidade`, dentro de `public/base.js`. Não deixe os campos PENDENTE após a abertura das inscrições ao público.

Para alterar a grade: `server/config.js` e `public/config.js` controlam o painel; `CONFIG.dias` em `public/base.js` controla a grade pública da base. Mantenha os IDs existentes para preservar presenças. As dez atividades no SQL são prévia temática; nenhuma certificação vem liberada.

## 8. Executar e testar no computador

Requer Node.js 24. Para testar o código e o SQL sem credenciais reais:

```sh
npm ci
npm test
```

Os testes usam PostgreSQL local em WASM (PGlite), separado do seu banco. A única dependência é de desenvolvimento; a aplicação usa APIs nativas Node/fetch.

Para rodar com seu Supabase: crie `.env.local` na raiz, preenchendo as variáveis do `.env.example` e usando `SITE_URL=http://localhost:3000` somente no computador. Então:

```sh
node --env-file=.env.local server/local.js
```

Abra `http://localhost:3000`. Não publique `.env.local`.

## Verificações realizadas e limites

Passaram dez testes automatizados que executam o SQL em PostgreSQL local e verificam migração repetida, bloqueio de privilégios anônimos/autenticados, cadastro persistido, e-mails normalizados, duplicidade, validação, limite de tentativas, CSRF, login, cookies HttpOnly/Secure, renovação de sessão, autorização, presença por palestra, emissão, ausência de Resend e revogação.

Sem acesso às suas contas, não foi feito deploy na sua Vercel nem execução no seu Supabase. O transporte de autenticação Supabase foi testado com respostas simuladas e seus cabeçalhos foram conferidos; o login com suas credenciais será validado após seu deploy. Não houve envio de e-mails reais. Não foi possível validar o visual pelo navegador nesta execução.

Referências técnicas: https://vercel.com/docs/functions/runtimes/node-js e https://supabase.com/docs/guides/getting-started/api-keys.
