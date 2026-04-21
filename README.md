# GanchoReel ✨ — Gerador de Ganchos para Reels

Aplicação web completa para criadores de conteúdo brasileiros gerarem ganchos irresistíveis para Instagram Reels.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript (ES2020) |
| Banco de dados | Google Sheets |
| Backend / API | Google Apps Script (serverless) |
| Hospedagem | GitHub Pages |
| Deploy | GitHub Actions |

## Funcionalidades

- **10 categorias de gancho** — Curiosidade, Choque, Problema, Polêmica, História, Desafio, Dica Rápida, Erro Comum, Transformação, Estatística
- **60+ templates** em português brasileiro (com versão com emojis)
- **Filtro por nicho** — Fitness, Finanças, Moda, Culinária, Tecnologia, Relacionamentos, Negócios, Beleza
- **Copiar com 1 clique** — texto simples ou com emojis
- **Compartilhar** via Web Share API (nativo no celular)
- **Favoritos** — salvos no Google Sheets e sincronizados via localStorage
- **Analytics** — cada geração é registrada na planilha
- **Modo escuro/claro** — persistido no localStorage
- **Funciona offline** — templates estáticos de fallback embutidos no JS
- **Mobile-first** — layout responsivo

---

## Configuração do Google Sheets (banco de dados)

### Passo 1 — Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha
2. Copie o **ID** da URL — é o trecho entre `/d/` e `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/  ← ID AQUI →  /edit
   ```

### Passo 2 — Configurar o Apps Script

1. Na planilha, clique em **Extensões → Apps Script**
2. Delete o código padrão e cole o conteúdo de `backend/Code.gs`
3. Na linha 12, substitua o valor de `SPREADSHEET_ID`:
   ```javascript
   const SPREADSHEET_ID = 'seu-id-aqui';
   ```
4. Salve (`Ctrl+S`)
5. No menu suspenso de funções, selecione **`setupSheets`** e clique em **Executar**
   - Autorize as permissões quando solicitado
   - Isso cria as abas: **Templates**, **Favorites** e **Analytics** com dados iniciais

### Passo 3 — Implantar como Web App

1. Clique em **Implantar → Nova Implantação**
2. Tipo: **App da Web**
3. Configuração:
   - **Executar como:** Eu
   - **Quem tem acesso:** Qualquer pessoa
4. Clique em **Implantar** e copie a URL gerada
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

### Passo 4 — Conectar o frontend

1. Abra `js/api.js`
2. Cole a URL na constante `API_URL`:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/SEU_ID/exec';
   ```
3. Faça commit e push — o GitHub Actions fará o deploy automaticamente

> **Sem a URL configurada:** o app funciona normalmente em modo offline, usando os templates estáticos embutidos. Favoritos ficam apenas no localStorage.

---

## Deploy no GitHub Pages

### Ativar (apenas uma vez)

1. No repositório GitHub, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Salve

A partir daí, todo push para `main` dispara o workflow `.github/workflows/deploy.yml` e publica automaticamente em:

```
https://<seu-usuario>.github.io/<nome-do-repositorio>/
```

### Disparar manualmente

No GitHub, vá em **Actions → Deploy to GitHub Pages → Run workflow**.

---

## Estrutura do projeto

```
.
├── index.html                    # Página principal
├── css/
│   └── style.css                 # Design system completo
├── js/
│   ├── templates.js              # Templates estáticos (fallback offline)
│   ├── api.js                    # Camada de integração com Google Sheets
│   └── app.js                    # Lógica principal do app
├── backend/
│   └── Code.gs                   # Google Apps Script (API + banco de dados)
└── .github/
    └── workflows/
        └── deploy.yml            # CI/CD para GitHub Pages
```

## Estrutura das abas no Google Sheets

### Templates
| Coluna | Descrição |
|--------|-----------|
| category | ID da categoria (ex: `curiosidade`) |
| label | Nome exibido (ex: `Curiosidade`) |
| emoji | Emoji da categoria |
| color | Cor hex do badge |
| template | Texto do template com `{tema}` |
| withEmoji | Versão com emojis |
| active | TRUE/FALSE |

### Favorites
| Coluna | Descrição |
|--------|-----------|
| id | ID único do favorito |
| sessionId | ID da sessão do usuário |
| text | Texto do gancho salvo |
| withEmoji | Versão com emojis |
| category | Categoria |
| emoji | Emoji |
| color | Cor hex |
| categoryLabel | Label da categoria |
| topic | Tema usado |
| savedAt | Timestamp ISO |
| active | TRUE/FALSE (soft delete) |

### Analytics
| Coluna | Descrição |
|--------|-----------|
| timestamp | Data/hora da geração |
| sessionId | ID da sessão |
| topic | Tema digitado |
| nicho | Nicho selecionado |
| categories | Categorias usadas |
| hooksGenerated | Quantidade gerada |

---

## Desenvolvimento local

Nenhuma dependência de build. Basta servir os arquivos estáticos:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8080
```

Acesse `http://localhost:8080`.

---

Feito com ❤️ para criadores de conteúdo brasileiros.
