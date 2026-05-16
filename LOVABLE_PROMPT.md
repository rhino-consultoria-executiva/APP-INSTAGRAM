# Prompt Completo para Lovable — GanchoReel + Supabase

> Cole este prompt inteiro no Lovable para gerar o app do zero.

---

## VISÃO GERAL

Crie um app web chamado **GanchoReel** — um gerador de ganchos (aberturas) para Instagram Reels voltado para criadores de conteúdo brasileiros. O usuário digita o tema do vídeo, escolhe o nicho e o tipo de gancho, clica em "Gerar" e recebe cards com variações de texto para copiar e usar nos seus Reels.

---

## STACK TÉCNICA

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL + Auth anônima + Realtime não obrigatório)
- **Fontes:** Plus Jakarta Sans (Google Fonts)
- **Deploy:** Lovable hosting

---

## DESIGN SYSTEM

### Paleta de cores — inspirada no Instagram
```
Gradient brand: linear-gradient(135deg, #405DE6, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45)
Accent principal: #C13584
Accent hover: #a01060

Light mode:
  bg: #f4f4f6
  bg-card: #ffffff
  bg-secondary: #f0f0f3
  text-primary: #111118
  text-secondary: #52525b
  text-muted: #a1a1aa
  border: #e4e4e7

Dark mode:
  bg: #09090b
  bg-card: #18181b
  bg-secondary: #27272a
  text-primary: #fafafa
  text-secondary: #a1a1aa
  border: #27272a
```

### Tipografia
- Fonte: `Plus Jakarta Sans` (pesos: 400, 500, 600, 700, 800)
- Títulos hero: peso 800, tamanho grande
- Texto em gradiente Instagram: aplicar `background-clip: text` com o `ig-gradient-text`

### Bordas e sombras
- Radius padrão: 16px | Pill: 999px | Pequeno: 8px
- Sombras suaves, sem sombras pesadas

### Animações
- Transições: 200ms `cubic-bezier(0.4, 0, 0.2, 1)`
- Cards de resultado: entrada com stagger (cada card aparece 55ms depois do anterior) com `opacity: 0 → 1` + `translateY(12px → 0)`
- Botão favoritar: animação pop (scale 1.4 → 1) quando ativado
- Input com shake quando submetido vazio
- Toast notification que desliza de baixo

---

## BANCO DE DADOS — SUPABASE

### Tabela: `templates`
```sql
create table templates (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  label       text not null,
  emoji       text not null,
  color       text not null,
  template    text not null,
  with_emoji  text not null,
  active      boolean not null default true,
  created_at  timestamptz default now()
);

-- Habilitar leitura pública (sem autenticação)
alter table templates enable row level security;
create policy "Public read" on templates for select using (true);
```

### Tabela: `favorites`
```sql
create table favorites (
  id              text primary key,
  session_id      text not null,
  text            text not null,
  with_emoji      text not null,
  category        text not null,
  emoji           text not null,
  color           text not null,
  category_label  text not null,
  topic           text not null,
  saved_at        timestamptz default now(),
  active          boolean not null default true
);

create index on favorites(session_id);

alter table favorites enable row level security;
create policy "Session owner full access" on favorites
  using (session_id = current_setting('app.session_id', true))
  with check (session_id = current_setting('app.session_id', true));
```

### Tabela: `analytics`
```sql
create table analytics (
  id               uuid primary key default gen_random_uuid(),
  session_id       text not null,
  topic            text not null,
  nicho            text,
  categories       text,
  hooks_generated  int not null default 0,
  created_at       timestamptz default now()
);

alter table analytics enable row level security;
create policy "Insert only" on analytics for insert with check (true);
```

### Seed — inserir todos os templates (execute no SQL Editor do Supabase)
```sql
insert into templates (category, label, emoji, color, template, with_emoji, active) values
-- CURIOSIDADE
('curiosidade','Curiosidade','🤔','#7c3aed','Você sabia que {tema} pode mudar completamente sua vida?','🤔 Você sabia que {tema} pode mudar completamente sua vida?',true),
('curiosidade','Curiosidade','🤔','#7c3aed','O que ninguém te conta sobre {tema}...','🤫 O que ninguém te conta sobre {tema}...',true),
('curiosidade','Curiosidade','🤔','#7c3aed','Por que 99% das pessoas erram em {tema}?','❓ Por que 99% das pessoas erram em {tema}?',true),
('curiosidade','Curiosidade','🤔','#7c3aed','A verdade sobre {tema} que você nunca ouviu','👀 A verdade sobre {tema} que você nunca ouviu',true),
('curiosidade','Curiosidade','🤔','#7c3aed','O segredo de {tema} que os especialistas guardam a sete chaves','🔑 O segredo de {tema} que os especialistas guardam a sete chaves',true),
('curiosidade','Curiosidade','🤔','#7c3aed','Existe algo em {tema} que vai te deixar de boca aberta','😮 Existe algo em {tema} que vai te deixar de boca aberta',true),
-- CHOQUE
('choque','Choque','😱','#dc2626','Descobri algo sobre {tema} que me deixou em choque','😱 Descobri algo sobre {tema} que me deixou em choque',true),
('choque','Choque','😱','#dc2626','A verdade chocante sobre {tema} que ninguém fala','⚡ A verdade chocante sobre {tema} que ninguém fala',true),
('choque','Choque','😱','#dc2626','Fui pesquisar sobre {tema} e não acreditei no que achei','🔍 Fui pesquisar sobre {tema} e não acreditei no que achei',true),
('choque','Choque','😱','#dc2626','Isso sobre {tema} vai te surpreender demais','🤯 Isso sobre {tema} vai te surpreender demais',true),
('choque','Choque','😱','#dc2626','{tema}: o que descobri me deixou completamente sem palavras','💥 {tema}: o que descobri me deixou completamente sem palavras',true),
('choque','Choque','😱','#dc2626','Nunca imaginei que {tema} pudesse causar tudo isso','😳 Nunca imaginei que {tema} pudesse causar tudo isso',true),
-- PROBLEMA
('problema','Problema','⚠️','#d97706','Cansado de não ter resultados com {tema}?','😤 Cansado de não ter resultados com {tema}?',true),
('problema','Problema','⚠️','#d97706','Se você sofre com {tema}, esse vídeo é para você','💔 Se você sofre com {tema}, esse vídeo é para você',true),
('problema','Problema','⚠️','#d97706','O maior erro de quem começa em {tema}...','⚠️ O maior erro de quem começa em {tema}...',true),
('problema','Problema','⚠️','#d97706','Por que {tema} não está funcionando para você?','🤷 Por que {tema} não está funcionando para você?',true),
('problema','Problema','⚠️','#d97706','Você está travado em {tema}? Eu sei o motivo','😩 Você está travado em {tema}? Eu sei o motivo',true),
('problema','Problema','⚠️','#d97706','{tema} te frustra? A culpa não é sua — é do método','😔 {tema} te frustra? A culpa não é sua — é do método',true),
-- POLÊMICA
('polemica','Polêmica','🔥','#ea580c','{tema} não funciona do jeito que te ensinaram','🚫 {tema} não funciona do jeito que te ensinaram',true),
('polemica','Polêmica','🔥','#ea580c','Vou falar o que ninguém tem coragem de dizer sobre {tema}','🔥 Vou falar o que ninguém tem coragem de dizer sobre {tema}',true),
('polemica','Polêmica','🔥','#ea580c','Para de perder tempo com {tema} desse jeito','✋ Para de perder tempo com {tema} desse jeito',true),
('polemica','Polêmica','🔥','#ea580c','A grande mentira sobre {tema} que todo mundo acredita','🎭 A grande mentira sobre {tema} que todo mundo acredita',true),
('polemica','Polêmica','🔥','#ea580c','Discordo de tudo que você aprendeu sobre {tema}','⚡ Discordo de tudo que você aprendeu sobre {tema}',true),
('polemica','Polêmica','🔥','#ea580c','Isso que chamam de {tema} está completamente errado','💣 Isso que chamam de {tema} está completamente errado',true),
-- HISTÓRIA
('historia','História','📖','#2563eb','Há 1 ano eu não sabia NADA sobre {tema}, hoje...','📅 Há 1 ano eu não sabia NADA sobre {tema}, hoje...',true),
('historia','História','📖','#2563eb','Uma coisa que aconteceu comigo em {tema} mudou tudo','💡 Uma coisa que aconteceu comigo em {tema} mudou tudo',true),
('historia','História','📖','#2563eb','Minha maior falha com {tema} me ensinou algo incrível','😅 Minha maior falha com {tema} me ensinou algo incrível',true),
('historia','História','📖','#2563eb','Nunca vou esquecer o dia que descobri {tema}','🗓️ Nunca vou esquecer o dia que descobri {tema}',true),
('historia','História','📖','#2563eb','Me pediram para nunca contar o que aprendi sobre {tema}','🤫 Me pediram para nunca contar o que aprendi sobre {tema}',true),
('historia','História','📖','#2563eb','Quando comecei em {tema}, errei tudo — e foi a melhor coisa','🎯 Quando comecei em {tema}, errei tudo — e foi a melhor coisa',true),
-- DESAFIO
('desafio','Desafio','✅','#16a34a','Testa isso com {tema} por 7 dias e me conta o resultado','⏱️ Testa isso com {tema} por 7 dias e me conta o resultado',true),
('desafio','Desafio','✅','#16a34a','Faz esse exercício sobre {tema} agora e veja a diferença','💪 Faz esse exercício sobre {tema} agora e veja a diferença',true),
('desafio','Desafio','✅','#16a34a','Desafio: aplique {tema} por 30 dias e transforme sua vida','🏆 Desafio: aplique {tema} por 30 dias e transforme sua vida',true),
('desafio','Desafio','✅','#16a34a','Se você conseguir fazer isso em {tema}, me marca nos comentários','🙋 Se você conseguir fazer isso em {tema}, me marca nos comentários',true),
('desafio','Desafio','✅','#16a34a','Aceita o desafio de {tema} comigo?','🤝 Aceita o desafio de {tema} comigo?',true),
('desafio','Desafio','✅','#16a34a','Prove para você mesmo que {tema} funciona: faça isso hoje','✅ Prove para você mesmo que {tema} funciona: faça isso hoje',true),
-- DICA RÁPIDA
('dicaRapida','Dica Rápida','💡','#0891b2','3 segredos de {tema} que os especialistas escondem','💡 3 segredos de {tema} que os especialistas escondem',true),
('dicaRapida','Dica Rápida','💡','#0891b2','O truque de {tema} que ninguém jamais te ensinou','🎯 O truque de {tema} que ninguém jamais te ensinou',true),
('dicaRapida','Dica Rápida','💡','#0891b2','Como dominar {tema} em menos de 5 minutos','⚡ Como dominar {tema} em menos de 5 minutos',true),
('dicaRapida','Dica Rápida','💡','#0891b2','A dica de {tema} que vai te economizar horas de trabalho','⏰ A dica de {tema} que vai te economizar horas de trabalho',true),
('dicaRapida','Dica Rápida','💡','#0891b2','O método mais rápido para {tema} que já vi na vida','🚀 O método mais rápido para {tema} que já vi na vida',true),
('dicaRapida','Dica Rápida','💡','#0891b2','Aprenda {tema} agora: muito mais simples do que parece','📚 Aprenda {tema} agora: muito mais simples do que parece',true),
-- ERRO COMUM
('erroComum','Erro Comum','😅','#9333ea','3 erros de {tema} que praticamente todo mundo comete','❌ 3 erros de {tema} que praticamente todo mundo comete',true),
('erroComum','Erro Comum','😅','#9333ea','Você está fazendo {tema} COMPLETAMENTE ERRADO','🚫 Você está fazendo {tema} COMPLETAMENTE ERRADO',true),
('erroComum','Erro Comum','😅','#9333ea','Para de cometer esses erros em {tema}!','⛔ Para de cometer esses erros em {tema}!',true),
('erroComum','Erro Comum','😅','#9333ea','O erro número 1 de quem tenta {tema} pela primeira vez','😬 O erro número 1 de quem tenta {tema} pela primeira vez',true),
('erroComum','Erro Comum','😅','#9333ea','Esses erros em {tema} estão te sabotando sem você saber','🔴 Esses erros em {tema} estão te sabotando sem você saber',true),
('erroComum','Erro Comum','😅','#9333ea','Fiz esses erros em {tema} e aprendi da maneira mais difícil','😓 Fiz esses erros em {tema} e aprendi da maneira mais difícil',true),
-- TRANSFORMAÇÃO
('transformacao','Transformação','🏆','#0d9488','Como {tema} transformou minha vida em apenas 30 dias','🔄 Como {tema} transformou minha vida em apenas 30 dias',true),
('transformacao','Transformação','🏆','#0d9488','De zero ao máximo em {tema}: minha história real','📈 De zero ao máximo em {tema}: minha história real',true),
('transformacao','Transformação','🏆','#0d9488','Antes e depois com {tema}: resultados que ninguém acreditou','✨ Antes e depois com {tema}: resultados que ninguém acreditou',true),
('transformacao','Transformação','🏆','#0d9488','{tema} mudou tudo na minha vida — e pode mudar na sua também','🌟 {tema} mudou tudo na minha vida — e pode mudar na sua também',true),
('transformacao','Transformação','🏆','#0d9488','O que {tema} fez por mim em apenas 3 meses vai te surpreender','🏅 O que {tema} fez por mim em apenas 3 meses vai te surpreender',true),
('transformacao','Transformação','🏆','#0d9488','Minha transformação com {tema} que absolutamente ninguém esperava','🦋 Minha transformação com {tema} que absolutamente ninguém esperava',true),
-- ESTATÍSTICA
('dado','Estatística','📊','#1d4ed8','95% das pessoas desistem de {tema} por esse motivo','📊 95% das pessoas desistem de {tema} por esse motivo',true),
('dado','Estatística','📊','#1d4ed8','Um estudo revelou que {tema} pode aumentar seus resultados em 300%','🔬 Um estudo revelou que {tema} pode aumentar seus resultados em 300%',true),
('dado','Estatística','📊','#1d4ed8','Só 5% das pessoas realmente sabem disso sobre {tema}','💯 Só 5% das pessoas realmente sabem disso sobre {tema}',true),
('dado','Estatística','📊','#1d4ed8','Os números sobre {tema} vão te deixar de queixo caído','🔢 Os números sobre {tema} vão te deixar de queixo caído',true),
('dado','Estatística','📊','#1d4ed8','Dado chocante: 8 em cada 10 pessoas erram nessa etapa de {tema}','📉 Dado chocante: 8 em cada 10 pessoas erram nessa etapa de {tema}',true),
('dado','Estatística','📊','#1d4ed8','Pesquisa recente mostrou que {tema} é muito mais eficaz do que pensamos','📈 Pesquisa recente mostrou que {tema} é muito mais eficaz do que pensamos',true);
```

---

## ESTRUTURA DE COMPONENTES

```
src/
├── components/
│   ├── Header.tsx           — logo, botão Favoritos (com badge contador), toggle dark mode
│   ├── HeroSection.tsx      — título, subtítulo, estatísticas (10 categorias / 60+ templates / 8 nichos)
│   ├── InputSection.tsx     — campo de tema, seletor de nicho, seletor de categorias, botão Gerar
│   ├── NichoPills.tsx       — pills horizontais (scrollável) com os 8 nichos
│   ├── CategoryGrid.tsx     — grid de cards de categorias (multipla seleção)
│   ├── ResultsSection.tsx   — grid de hook cards gerados + botão Regenerar
│   ├── HookCard.tsx         — card individual com texto simples, versão emoji, copiar, favoritar, compartilhar
│   ├── FavoritesPanel.tsx   — lista de favoritos salvos (colapsável via botão no header)
│   ├── Toast.tsx            — notificação temporária (success / info / warn)
│   └── Footer.tsx
├── hooks/
│   ├── useSession.ts        — cria/recupera sessionId do localStorage
│   ├── useTemplates.ts      — carrega templates do Supabase (com fallback estático)
│   ├── useFavorites.ts      — CRUD de favoritos (localStorage + sync Supabase)
│   └── useToast.ts          — controle do toast global
├── lib/
│   ├── supabase.ts          — cliente Supabase
│   ├── templates-static.ts  — templates estáticos (fallback quando offline)
│   └── utils.ts             — shuffleArray, uid, hexToRgba, escapeHtml
├── types/
│   └── index.ts             — interfaces: Template, HookCard, Favorite, Nicho
└── App.tsx
```

---

## FUNCIONALIDADES DETALHADAS

### 1. Session ID
- Na inicialização, gerar e salvar em `localStorage` um ID único: `sess_${Date.now()}_${Math.random().toString(36).slice(2,11)}`
- Usar em todas as operações de favoritos e analytics

### 2. Carregar Templates
- Ao iniciar: buscar `templates` do Supabase onde `active = true`
- Se a busca falhar ou retornar vazio: usar os templates estáticos embutidos no código
- Agrupar por `category`, montar objeto com `label`, `emoji`, `color`, array `templates[]`, array `with_emoji[]`

### 3. Seleção de Nichos
Mostrar como pills horizontais com scroll. Os 8 nichos são:
```
{ id: 'fitness',         label: '💪 Fitness' }
{ id: 'financas',        label: '💰 Finanças' }
{ id: 'moda',            label: '👗 Moda' }
{ id: 'culinaria',       label: '🍳 Culinária' }
{ id: 'tecnologia',      label: '💻 Tecnologia' }
{ id: 'relacionamentos', label: '❤️ Relacionamentos' }
{ id: 'negocios',        label: '📈 Negócios' }
{ id: 'beleza',          label: '💄 Beleza' }
```
Ao selecionar um nicho, atualizar o placeholder do campo de tema com sugestões:
- fitness: "treino em casa, perda de peso, ganho de massa muscular"
- financas: "investimentos, renda extra, economia doméstica"
- moda: "looks do dia a dia, tendências 2025, moda sustentável"
- culinaria: "receitas fit, culinária rápida, meal prep semanal"
- tecnologia: "inteligência artificial, produtividade digital, apps"
- relacionamentos: "comunicação no casal, autoconhecimento, amor próprio"
- negocios: "empreendedorismo, marketing digital, vendas online"
- beleza: "skincare, maquiagem, cuidados com o cabelo"

### 4. Seleção de Categorias
- Grid de cards — **seleção múltipla**
- Card "Todas ✨" como opção padrão (quando selecionado, deseleciona as outras)
- Selecionar uma categoria específica remove "Todas" da seleção
- Se todas as categorias forem deselecionadas, volta para "Todas"
- Visual: fundo com a cor da categoria em 15% opacidade, borda colorida quando ativo

### 5. Gerar Ganchos
- Validar: campo de tema não pode estar vazio (se vazio: shake animation no input + toast "Digite um tema para continuar 😊")
- Para cada categoria selecionada: embaralhar os templates, pegar 2 aleatórios
- Substituir `{tema}` pelo valor digitado no input
- Cada gancho gerado tem:
  ```typescript
  interface HookCard {
    id: string            // uid único
    text: string          // template simples com tema substituído
    withEmoji: string     // template com emoji + tema substituído
    category: string      // chave da categoria
    categoryLabel: string // label legível
    emoji: string         // emoji da categoria
    color: string         // cor hex da categoria
    topic: string         // tema digitado
  }
  ```
- Rolar suavemente para a seção de resultados
- Registrar na tabela `analytics` (fire-and-forget, não bloquear a UI)

### 6. Cards de Resultado
Cada card deve ter:
- Badge da categoria (fundo colorido em 15% + cor da categoria)
- Botão favoritar (🤍 / ❤️) no canto superior direito — com animação pop ao favoritar
- Bloco "Texto simples" com o gancho e contador de caracteres
- Bloco "Com emojis" com o gancho emoji e contador de caracteres
- Três botões de ação:
  - **📋 Copiar Texto** — copia a versão simples + feedback visual "✅ Copiado!" por 2s
  - **🎨 Copiar c/ Emoji** — copia a versão com emoji + mesmo feedback
  - **📤 Compartilhar** — usa `navigator.share` se disponível; fallback: copia texto com emoji
- Botão **🔄 Regenerar** no header dos resultados para gerar novamente com o mesmo tema

### 7. Favoritos
- Salvar favorito: inserir no Supabase (`favorites` table) + salvar no `localStorage`
- Remover favorito: `soft delete` — setar `active = false` no Supabase + remover do localStorage
- Na inicialização: carregar do localStorage; em background, buscar do Supabase (buscar onde `session_id = sessionId AND active = true`) e fazer merge (Supabase tem prioridade para itens novos)
- Painel de favoritos:
  - Aberto/fechado pelo botão no header
  - Badge no botão mostra a contagem atual
  - Para cada favorito: badge de categoria, texto, botões copiar texto / copiar c/ emoji, botão X para remover
  - Estado vazio: ícone 🤍 + "Nenhum favorito ainda" + instrução
  - Botão "Limpar todos" com confirmação

### 8. Dark Mode
- Toggle 🌙 / ☀️ no header
- Persistir preferência no `localStorage` (chave `gr_darkMode`)
- Aplicar via `data-theme="dark"` no `<html>` ou via classe `dark` do Tailwind
- Transição suave (200ms) em todos os elementos de cor/fundo

### 9. Toast Notifications
Tipos e mensagens:
- `success`: "Adicionado aos favoritos ❤️", "Copiado para a área de transferência ✅"
- `info`: "Removido dos favoritos", "Copiado para compartilhar! 📋"
- `warn`: "Digite um tema para continuar 😊"
- Aparece no canto inferior central, desliza para cima, some após 2.6s

### 10. Analytics (Supabase)
Inserir na tabela `analytics` a cada clique em Gerar:
```typescript
{
  session_id:       string,
  topic:            string,
  nicho:            string | null,
  categories:       string,   // categorias separadas por vírgula
  hooks_generated:  number,
  created_at:       timestamp
}
```
Usar fire-and-forget (`.then().catch()` sem await) para não bloquear a UX.

---

## LAYOUT DAS PÁGINAS

### Header (sticky, glassmorphism)
```
[ ✨ GanchoReel PRO ]          [ ❤️ Favoritos (3) ]  [ 🌙 ]
```
- Fundo: `rgba(255,255,255,0.85)` + `backdrop-filter: blur(16px)`
- Dark: `rgba(9,9,11,0.85)`
- Borda inferior sutil

### Hero Section
```
                Para criadores de conteúdo brasileiros ✦

         Ganchos que  [param o scroll]  ← gradiente Instagram

    Gere aberturas irresistíveis para seus Reels em segundos.
         10 categorias, centenas de possibilidades.

    [ 10 ]          [ 60+ ]          [ 8 ]
  Categorias       Templates        Nichos
```

### Seção de Input
```
┌─────────────────────────────────────────┐
│  ⚙️ Configure seu gancho                │
│                                         │
│  Tema / Tópico do Reel                  │
│  ┌───────────────────────────────────┐  │
│  │ 🎯  Ex: como ganhar dinheiro...  ✕│  │
│  └───────────────────────────────────┘  │
│  Seja específico para ganchos mais      │
│  precisos 💡                            │
│                                         │
│  Nicho (opcional)                       │
│  [Todos] [💪 Fitness] [💰 Finanças] ... │
│                                         │
│  Tipo de Gancho  [Múltipla escolha]     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │  ✨  │ │  🤔  │ │  😱  │ │  ⚠️  │  │
│  │Todas │ │Curio.│ │Choque│ │Probl.│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    ⚡  Gerar Ganchos   [GRÁTIS] │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Cards de Resultado
```
┌────────────────────────────────────────┐
│ [🤔 Curiosidade]              [🤍]    │
│                                        │
│ Texto simples                          │
│ "Você sabia que marketing digital      │
│  pode mudar completamente sua vida?"   │
│                                    73 c│
│                                        │
│ Com emojis                             │
│ "🤔 Você sabia que marketing digital   │
│  pode mudar completamente sua vida?"   │
│                                    76 c│
│                                        │
│ [📋 Copiar Texto] [🎨 c/ Emoji] [📤] │
└────────────────────────────────────────┘
```

### Painel de Favoritos (abaixo dos resultados, colapsável)
```
┌────────────────────────────────────────┐
│ ❤️ Favoritos              [Limpar todos]│
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ [🤔 Curiosidade]             [✕] │   │
│ │ Você sabia que...                │   │
│ │ [📋 Copiar] [🎨 c/ Emoji]       │   │
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘
```

---

## LÓGICA DE GERAÇÃO (pseudocódigo)

```typescript
function generateHooks(topic: string, selectedCategories: string[], templates: TemplateMap): HookCard[] {
  return selectedCategories.flatMap(categoryKey => {
    const cat = templates[categoryKey]
    if (!cat) return []

    // Zipar template simples com versão emoji
    const pairs = cat.templates.map((t, i) => ({ t, e: cat.withEmojis[i] }))

    // Embaralhar e pegar 2
    const shuffled = shuffleArray([...pairs]).slice(0, 2)

    return shuffled.map(({ t, e }) => ({
      id:            uid(),
      text:          t.replace(/\{tema\}/g, topic),
      withEmoji:     e.replace(/\{tema\}/g, topic),
      category:      categoryKey,
      categoryLabel: cat.label,
      emoji:         cat.emoji,
      color:         cat.color,
      topic,
    }))
  })
}
```

---

## INTERAÇÕES SUPABASE

### Buscar templates
```typescript
const { data } = await supabase
  .from('templates')
  .select('*')
  .eq('active', true)
  .order('category')
```

### Salvar favorito
```typescript
await supabase.from('favorites').upsert({
  id:             hook.id,
  session_id:     sessionId,
  text:           hook.text,
  with_emoji:     hook.withEmoji,
  category:       hook.category,
  emoji:          hook.emoji,
  color:          hook.color,
  category_label: hook.categoryLabel,
  topic:          hook.topic,
  saved_at:       new Date().toISOString(),
  active:         true,
})
```

### Remover favorito (soft delete)
```typescript
await supabase
  .from('favorites')
  .update({ active: false })
  .eq('id', hookId)
  .eq('session_id', sessionId)
```

### Buscar favoritos da sessão
```typescript
const { data } = await supabase
  .from('favorites')
  .select('*')
  .eq('session_id', sessionId)
  .eq('active', true)
  .order('saved_at', { ascending: false })
```

### Registrar analytics
```typescript
// Fire-and-forget
supabase.from('analytics').insert({
  session_id:      sessionId,
  topic,
  nicho:           selectedNicho ?? null,
  categories:      selectedCategories.join(','),
  hooks_generated: hooks.length,
}).then().catch()
```

---

## VARIÁVEIS DE AMBIENTE

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## RESPONSIVIDADE

- Mobile first
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Grid de categorias: 2 colunas em mobile, 4-5 em desktop
- Grid de hooks: 1 coluna em mobile, 2 em desktop
- Header: label "Favoritos" escondido em mobile (só ícone + badge)
- Pills de nichos: scroll horizontal sem quebra de linha em mobile

---

## ACESSIBILIDADE

- `aria-label` em todos os botões de ação (favoritar, copiar, compartilhar)
- `role="status"` no toast
- Foco visível (outline) em todos os elementos interativos
- Contraste de cores adequado em ambos os temas

---

## FOOTER

```
Feito com ❤️ para criadores de conteúdo brasileiros
Dados salvos no Supabase • rhinotreinamentos.com • Funciona offline
```

---

## COMPORTAMENTOS ESPECIAIS

1. **Shake no input vazio:** ao tentar gerar sem digitar o tema, o input recebe classe `shake` com animation `translateX(-6px, 6px, -4px, 4px, 0)` em 400ms
2. **Stagger nos cards:** cada card de resultado aparece com delay de `index * 55ms`, entrando de baixo com `translateY(12px → 0)` + `opacity: 0 → 1`
3. **Feedback de cópia:** botão vira "✅ Copiado!" por 2 segundos, depois volta ao texto original
4. **Pop no favoritar:** botão escala para 1.4 e volta a 1 em 300ms com `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
5. **Enter no input:** pressionar Enter dispara a geração
6. **Botão ✕ no input:** aparece somente quando há texto digitado (transition opacity)
7. **Regenerar:** usa o mesmo tema e categorias da última geração, reembaralhando os templates

---

## RESUMO FINAL

O app deve funcionar completamente offline com os templates estáticos embutidos. O Supabase enriquece a experiência com:
- Templates dinâmicos (admin pode adicionar novos no banco sem redeploy)
- Favoritos sincronizados entre dispositivos na mesma sessão
- Analytics de uso

Não há login — a identificação é por `sessionId` no localStorage.
