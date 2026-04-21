/* =====================================================
   GanchoReel — Templates estáticos (fallback offline)
   10 categorias × 6 templates cada
   ===================================================== */

const HOOK_TEMPLATES = {
  curiosidade: {
    label: 'Curiosidade',
    emoji: '🤔',
    color: '#7c3aed',
    templates: [
      'Você sabia que {tema} pode mudar completamente sua vida?',
      'O que ninguém te conta sobre {tema}...',
      'Por que 99% das pessoas erram em {tema}?',
      'A verdade sobre {tema} que você nunca ouviu',
      'O segredo de {tema} que os especialistas guardam a sete chaves',
      'Existe algo em {tema} que vai te deixar de boca aberta',
    ],
    withEmojis: [
      '🤔 Você sabia que {tema} pode mudar completamente sua vida?',
      '🤫 O que ninguém te conta sobre {tema}...',
      '❓ Por que 99% das pessoas erram em {tema}?',
      '👀 A verdade sobre {tema} que você nunca ouviu',
      '🔑 O segredo de {tema} que os especialistas guardam a sete chaves',
      '😮 Existe algo em {tema} que vai te deixar de boca aberta',
    ],
  },

  choque: {
    label: 'Choque',
    emoji: '😱',
    color: '#dc2626',
    templates: [
      'Descobri algo sobre {tema} que me deixou em choque',
      'A verdade chocante sobre {tema} que ninguém fala',
      'Fui pesquisar sobre {tema} e não acreditei no que achei',
      'Isso sobre {tema} vai te surpreender demais',
      '{tema}: o que descobri me deixou completamente sem palavras',
      'Nunca imaginei que {tema} pudesse causar tudo isso',
    ],
    withEmojis: [
      '😱 Descobri algo sobre {tema} que me deixou em choque',
      '⚡ A verdade chocante sobre {tema} que ninguém fala',
      '🔍 Fui pesquisar sobre {tema} e não acreditei no que achei',
      '🤯 Isso sobre {tema} vai te surpreender demais',
      '💥 {tema}: o que descobri me deixou completamente sem palavras',
      '😳 Nunca imaginei que {tema} pudesse causar tudo isso',
    ],
  },

  problema: {
    label: 'Problema',
    emoji: '⚠️',
    color: '#d97706',
    templates: [
      'Cansado de não ter resultados com {tema}?',
      'Se você sofre com {tema}, esse vídeo é para você',
      'O maior erro de quem começa em {tema}...',
      'Por que {tema} não está funcionando para você?',
      'Você está travado em {tema}? Eu sei o motivo',
      '{tema} te frustra? A culpa não é sua — é do método',
    ],
    withEmojis: [
      '😤 Cansado de não ter resultados com {tema}?',
      '💔 Se você sofre com {tema}, esse vídeo é para você',
      '⚠️ O maior erro de quem começa em {tema}...',
      '🤷 Por que {tema} não está funcionando para você?',
      '😩 Você está travado em {tema}? Eu sei o motivo',
      '😔 {tema} te frustra? A culpa não é sua — é do método',
    ],
  },

  polemica: {
    label: 'Polêmica',
    emoji: '🔥',
    color: '#ea580c',
    templates: [
      '{tema} não funciona do jeito que te ensinaram',
      'Vou falar o que ninguém tem coragem de dizer sobre {tema}',
      'Para de perder tempo com {tema} desse jeito',
      'A grande mentira sobre {tema} que todo mundo acredita',
      'Discordo de tudo que você aprendeu sobre {tema}',
      'Isso que chamam de {tema} está completamente errado',
    ],
    withEmojis: [
      '🚫 {tema} não funciona do jeito que te ensinaram',
      '🔥 Vou falar o que ninguém tem coragem de dizer sobre {tema}',
      '✋ Para de perder tempo com {tema} desse jeito',
      '🎭 A grande mentira sobre {tema} que todo mundo acredita',
      '⚡ Discordo de tudo que você aprendeu sobre {tema}',
      '💣 Isso que chamam de {tema} está completamente errado',
    ],
  },

  historia: {
    label: 'História',
    emoji: '📖',
    color: '#2563eb',
    templates: [
      'Há 1 ano eu não sabia NADA sobre {tema}, hoje...',
      'Uma coisa que aconteceu comigo em {tema} mudou tudo',
      'Minha maior falha com {tema} me ensinou algo incrível',
      'Nunca vou esquecer o dia que descobri {tema}',
      'Me pediram para nunca contar o que aprendi sobre {tema}',
      'Quando comecei em {tema}, errei tudo — e foi a melhor coisa',
    ],
    withEmojis: [
      '📅 Há 1 ano eu não sabia NADA sobre {tema}, hoje...',
      '💡 Uma coisa que aconteceu comigo em {tema} mudou tudo',
      '😅 Minha maior falha com {tema} me ensinou algo incrível',
      '🗓️ Nunca vou esquecer o dia que descobri {tema}',
      '🤫 Me pediram para nunca contar o que aprendi sobre {tema}',
      '🎯 Quando comecei em {tema}, errei tudo — e foi a melhor coisa',
    ],
  },

  desafio: {
    label: 'Desafio',
    emoji: '✅',
    color: '#16a34a',
    templates: [
      'Testa isso com {tema} por 7 dias e me conta o resultado',
      'Faz esse exercício sobre {tema} agora e veja a diferença',
      'Desafio: aplique {tema} por 30 dias e transforme sua vida',
      'Se você conseguir fazer isso em {tema}, me marca nos comentários',
      'Aceita o desafio de {tema} comigo?',
      'Prove para você mesmo que {tema} funciona: faça isso hoje',
    ],
    withEmojis: [
      '⏱️ Testa isso com {tema} por 7 dias e me conta o resultado',
      '💪 Faz esse exercício sobre {tema} agora e veja a diferença',
      '🏆 Desafio: aplique {tema} por 30 dias e transforme sua vida',
      '🙋 Se você conseguir fazer isso em {tema}, me marca nos comentários',
      '🤝 Aceita o desafio de {tema} comigo?',
      '✅ Prove para você mesmo que {tema} funciona: faça isso hoje',
    ],
  },

  dicaRapida: {
    label: 'Dica Rápida',
    emoji: '💡',
    color: '#0891b2',
    templates: [
      '3 segredos de {tema} que os especialistas escondem',
      'O truque de {tema} que ninguém jamais te ensinou',
      'Como dominar {tema} em menos de 5 minutos',
      'A dica de {tema} que vai te economizar horas de trabalho',
      'O método mais rápido para {tema} que já vi na vida',
      'Aprenda {tema} agora: muito mais simples do que parece',
    ],
    withEmojis: [
      '💡 3 segredos de {tema} que os especialistas escondem',
      '🎯 O truque de {tema} que ninguém jamais te ensinou',
      '⚡ Como dominar {tema} em menos de 5 minutos',
      '⏰ A dica de {tema} que vai te economizar horas de trabalho',
      '🚀 O método mais rápido para {tema} que já vi na vida',
      '📚 Aprenda {tema} agora: muito mais simples do que parece',
    ],
  },

  erroComum: {
    label: 'Erro Comum',
    emoji: '😅',
    color: '#9333ea',
    templates: [
      '3 erros de {tema} que praticamente todo mundo comete',
      'Você está fazendo {tema} COMPLETAMENTE ERRADO',
      'Para de cometer esses erros em {tema}!',
      'O erro número 1 de quem tenta {tema} pela primeira vez',
      'Esses erros em {tema} estão te sabotando sem você saber',
      'Fiz esses erros em {tema} e aprendi da maneira mais difícil',
    ],
    withEmojis: [
      '❌ 3 erros de {tema} que praticamente todo mundo comete',
      '🚫 Você está fazendo {tema} COMPLETAMENTE ERRADO',
      '⛔ Para de cometer esses erros em {tema}!',
      '😬 O erro número 1 de quem tenta {tema} pela primeira vez',
      '🔴 Esses erros em {tema} estão te sabotando sem você saber',
      '😓 Fiz esses erros em {tema} e aprendi da maneira mais difícil',
    ],
  },

  transformacao: {
    label: 'Transformação',
    emoji: '🏆',
    color: '#0d9488',
    templates: [
      'Como {tema} transformou minha vida em apenas 30 dias',
      'De zero ao máximo em {tema}: minha história real',
      'Antes e depois com {tema}: resultados que ninguém acreditou',
      '{tema} mudou tudo na minha vida — e pode mudar na sua também',
      'O que {tema} fez por mim em apenas 3 meses vai te surpreender',
      'Minha transformação com {tema} que absolutamente ninguém esperava',
    ],
    withEmojis: [
      '🔄 Como {tema} transformou minha vida em apenas 30 dias',
      '📈 De zero ao máximo em {tema}: minha história real',
      '✨ Antes e depois com {tema}: resultados que ninguém acreditou',
      '🌟 {tema} mudou tudo na minha vida — e pode mudar na sua também',
      '🏅 O que {tema} fez por mim em apenas 3 meses vai te surpreender',
      '🦋 Minha transformação com {tema} que absolutamente ninguém esperava',
    ],
  },

  dado: {
    label: 'Estatística',
    emoji: '📊',
    color: '#1d4ed8',
    templates: [
      '95% das pessoas desistem de {tema} por esse motivo',
      'Um estudo revelou que {tema} pode aumentar seus resultados em 300%',
      'Só 5% das pessoas realmente sabem disso sobre {tema}',
      'Os números sobre {tema} vão te deixar de queixo caído',
      'Dado chocante: 8 em cada 10 pessoas erram nessa etapa de {tema}',
      'Pesquisa recente mostrou que {tema} é muito mais eficaz do que pensamos',
    ],
    withEmojis: [
      '📊 95% das pessoas desistem de {tema} por esse motivo',
      '🔬 Um estudo revelou que {tema} pode aumentar seus resultados em 300%',
      '💯 Só 5% das pessoas realmente sabem disso sobre {tema}',
      '🔢 Os números sobre {tema} vão te deixar de queixo caído',
      '📉 Dado chocante: 8 em cada 10 pessoas erram nessa etapa de {tema}',
      '📈 Pesquisa recente mostrou que {tema} é muito mais eficaz do que pensamos',
    ],
  },
};

/* Nichos pré-definidos */
const NICHOS = [
  { id: 'fitness',         label: '💪 Fitness' },
  { id: 'financas',        label: '💰 Finanças' },
  { id: 'moda',            label: '👗 Moda' },
  { id: 'culinaria',       label: '🍳 Culinária' },
  { id: 'tecnologia',      label: '💻 Tecnologia' },
  { id: 'relacionamentos', label: '❤️ Relacionamentos' },
  { id: 'negocios',        label: '📈 Negócios' },
  { id: 'beleza',          label: '💄 Beleza' },
];

/* Sugestões de tema por nicho */
const NICHE_TOPICS = {
  fitness:         ['treino em casa', 'perda de peso', 'ganho de massa muscular', 'corrida', 'yoga'],
  financas:        ['investimentos', 'renda extra', 'economia doméstica', 'criptomoedas', 'tesouro direto'],
  moda:            ['looks do dia a dia', 'tendências 2025', 'moda sustentável', 'estilo pessoal', 'capsule wardrobe'],
  culinaria:       ['receitas fit', 'culinária rápida', 'meal prep semanal', 'sobremesas saudáveis', 'comida italiana'],
  tecnologia:      ['inteligência artificial', 'produtividade digital', 'apps imperdíveis', 'programação', 'gadgets'],
  relacionamentos: ['comunicação no casal', 'autoconhecimento', 'limites saudáveis', 'amor próprio', 'amizades'],
  negocios:        ['empreendedorismo', 'marketing digital', 'vendas online', 'gestão de tempo', 'liderança'],
  beleza:          ['skincare', 'maquiagem', 'cuidados com o cabelo', 'beleza natural', 'rotina de cuidados'],
};
