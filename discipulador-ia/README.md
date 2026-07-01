# Discipulador.IA 🕯️

Plataforma cristã de devocional diário com IA. A pessoa se cadastra, faz login, conta como está se sentindo hoje e recebe, em sequência: uma palavra motivacional gerada por IA (Groq), um versículo relacionado, uma história bíblica, uma oração guiada e, ao final, a opção de continuar ou encerrar o discipulado.

## Stack

- Node.js + Express
- EJS (server-side rendering)
- Sessão com `express-session` (cookie)
- Armazenamento em arquivo JSON (`data/database.json`) — sem dependências nativas, build 100% confiável
- Groq API para gerar a palavra motivacional e classificar a emoção relatada
- CSS puro, sem framework — tema "vela na madrugada"

## Rodando localmente

```bash
npm install
cp .env.example .env
# edite o .env e coloque sua GROQ_API_KEY (https://console.groq.com/keys)
npm start
```

Acesse http://localhost:3000

> Se `GROQ_API_KEY` não estiver configurada, o sistema ainda funciona: ele usa uma mensagem motivacional padrão (fallback), para que você possa testar o fluxo completo sem a chave.

## Variáveis de ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `GROQ_API_KEY` | Chave da API da Groq | Sim (em produção) |
| `GROQ_MODEL` | Modelo usado (padrão: `llama-3.3-70b-versatile`) | Não |
| `SESSION_SECRET` | Segredo para assinar o cookie de sessão | Sim |
| `PORT` | Porta local (a Railway define automaticamente) | Não |

## Deploy na Railway

1. Suba este projeto para um repositório no GitHub.
2. Na Railway, clique em **New Project → Deploy from GitHub repo** e selecione o repositório.
3. A Railway detecta automaticamente o Node.js (Nixpacks) e usa `npm start` para iniciar (definido em `railway.json`).
4. Em **Variables**, adicione:
   - `GROQ_API_KEY`
   - `SESSION_SECRET` (gere um valor aleatório longo)
   - `GROQ_MODEL` (opcional)
5. Clique em **Deploy**. Ao final, a Railway fornece uma URL pública (ex: `https://discipulador-ia.up.railway.app`).

### Sobre persistência de dados

Este projeto usa um arquivo JSON local (`data/database.json`) para guardar usuários — simples e sem dependências nativas. **Atenção:** no plano padrão da Railway, o sistema de arquivos não é persistente entre deploys (a cada novo deploy, o arquivo é recriado do zero). Para produção real, recomenda-se:

- Adicionar um **Volume** na Railway apontando para a pasta `data/` (mantém o arquivo entre deploys), **ou**
- Migrar para um banco gerenciado, como o plugin **PostgreSQL** da própria Railway.

O mesmo vale para as sessões de login: elas usam armazenamento em memória, então reiniciar o serviço desloga todo mundo. Para produção com múltiplas instâncias, use um store de sessão externo (ex: Redis).

## Estrutura do projeto

```
discipulador-ia/
├── server.js              # servidor Express principal
├── db.js                  # armazenamento de usuários e jornadas (JSON)
├── middleware/auth.js      # proteção de rotas autenticadas
├── routes/
│   ├── auth.js             # cadastro, login, logout
│   └── painel.js           # fluxo: pergunta → palavra → versículo → história → oração → discipulado
├── services/groq.js        # integração com a API da Groq
├── data/
│   ├── versiculos.js       # banco de versículos por categoria emocional
│   ├── historias.js        # banco de histórias bíblicas por categoria emocional
│   └── oracoes.js          # orações guiadas por categoria emocional
├── views/                  # templates EJS
└── public/css/style.css    # design system (tema "vela na madrugada")
```

## Como funciona o fluxo de IA

1. A pessoa escreve livremente como está se sentindo.
2. O texto é enviado à Groq, que responde em JSON com **(a)** uma mensagem motivacional cristã personalizada e **(b)** uma categoria emocional (ex: `ansioso`, `triste`, `grato`...).
3. A categoria é usada para selecionar, de bancos de dados curados no próprio código (`data/`), um versículo, uma história bíblica e uma oração coerentes com o sentimento relatado — isso evita que a IA "invente" versículos ou referências bíblicas incorretas.

## Personalizando o conteúdo

Para adicionar mais versículos, histórias ou orações, edite os arquivos em `data/`. Cada categoria emocional é uma chave do objeto exportado; basta seguir o mesmo formato dos itens já existentes.
