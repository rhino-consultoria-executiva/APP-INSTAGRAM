// =====================================================
// GanchoReel — Google Apps Script (Backend / API)
//
// SETUP (execute uma vez):
//   1. Crie uma planilha em sheets.google.com
//   2. Copie o ID da URL (entre /d/ e /edit)
//   3. Cole o ID em SPREADSHEET_ID abaixo
//   4. Abra Extensões → Apps Script e cole este código
//   5. Salve (Ctrl+S) e execute "setupSheets"
//   6. Implante: Implantar → Nova Implantação
//      Tipo: App da Web | Executar como: Eu
//      Quem tem acesso: Qualquer pessoa
//   7. Copie a URL gerada e cole em js/api.js → API_URL
// =====================================================

const SPREADSHEET_ID = 'COLE_SEU_SPREADSHEET_ID_AQUI';

const SHEET = {
  TEMPLATES: 'Templates',
  FAVORITES: 'Favorites',
  ANALYTICS: 'Analytics',
};

// ── Roteador principal ─────────────────────────────

function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || '';
    let result;

    switch (action) {
      case 'getTemplates':
        result = handleGetTemplates();
        break;
      case 'getFavorites':
        result = handleGetFavorites(e.parameter.sessionId);
        break;
      case 'saveFavorite':
        result = handleSaveFavorite(e.parameter);
        break;
      case 'removeFavorite':
        result = handleRemoveFavorite(e.parameter);
        break;
      case 'trackAnalytics':
        result = handleTrackAnalytics(e.parameter);
        break;
      default:
        result = { success: false, error: 'Ação desconhecida: ' + action };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── Handlers ───────────────────────────────────────

function handleGetTemplates() {
  const sheet = getSheet(SHEET.TEMPLATES);
  const rows  = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: {} };

  const templates = {};

  for (let i = 1; i < rows.length; i++) {
    const [category, label, emoji, color, template, withEmoji, active] = rows[i];
    if (!active || !category || !template) continue;

    if (!templates[category]) {
      templates[category] = { label, emoji, color, templates: [], withEmojis: [] };
    }
    templates[category].templates.push(String(template));
    templates[category].withEmojis.push(String(withEmoji || template));
  }

  return { success: true, data: templates };
}

function handleGetFavorites(sessionId) {
  if (!sessionId) return { success: false, error: 'sessionId obrigatório' };

  const sheet = getSheet(SHEET.FAVORITES);
  const rows  = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };

  const favorites = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, sid, text, withEmoji, category, emoji, color, categoryLabel, topic, savedAt, active] = rows[i];
    if (sid === sessionId && active !== false) {
      favorites.push({ id, text, withEmoji, category, emoji, color, categoryLabel, topic, savedAt });
    }
  }

  return { success: true, data: favorites };
}

function handleSaveFavorite(p) {
  if (!p.sessionId || !p.id) return { success: false, error: 'Parâmetros obrigatórios ausentes' };

  const sheet = getSheet(SHEET.FAVORITES);

  // Verifica se já existe (evita duplicatas)
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === p.id && rows[i][1] === p.sessionId) {
      // Reativa se estava inativo
      sheet.getRange(i + 1, 11).setValue(true);
      return { success: true, updated: true };
    }
  }

  sheet.appendRow([
    p.id,
    p.sessionId,
    p.text        || '',
    p.withEmoji   || '',
    p.category    || '',
    p.emoji       || '',
    p.color       || '',
    p.categoryLabel || '',
    p.topic       || '',
    p.timestamp   || new Date().toISOString(),
    true,
  ]);

  return { success: true, created: true };
}

function handleRemoveFavorite(p) {
  if (!p.id || !p.sessionId) return { success: false, error: 'id e sessionId obrigatórios' };

  const sheet = getSheet(SHEET.FAVORITES);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === p.id && rows[i][1] === p.sessionId) {
      sheet.getRange(i + 1, 11).setValue(false); // coluna "active"
      return { success: true };
    }
  }

  return { success: false, error: 'Favorito não encontrado' };
}

function handleTrackAnalytics(p) {
  const sheet = getSheet(SHEET.ANALYTICS);
  sheet.appendRow([
    p.timestamp  || new Date().toISOString(),
    p.sessionId  || '',
    p.topic      || '',
    p.nicho      || '',
    p.categories || '',
    Number(p.hooksGenerated) || 0,
  ]);
  return { success: true };
}

// ── Setup inicial das abas ─────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ── Templates ──────────────────────────────────
  let tSheet = ss.getSheetByName(SHEET.TEMPLATES);
  if (!tSheet) {
    tSheet = ss.insertSheet(SHEET.TEMPLATES);
    tSheet.appendRow(['category', 'label', 'emoji', 'color', 'template', 'withEmoji', 'active']);
    tSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#833AB4').setFontColor('#ffffff');

    // Popula templates padrão
    DEFAULT_TEMPLATES.forEach(row => tSheet.appendRow(row));

    Logger.log('Aba Templates criada com ' + DEFAULT_TEMPLATES.length + ' templates.');
  }

  // ── Favorites ──────────────────────────────────
  let fSheet = ss.getSheetByName(SHEET.FAVORITES);
  if (!fSheet) {
    fSheet = ss.insertSheet(SHEET.FAVORITES);
    fSheet.appendRow(['id', 'sessionId', 'text', 'withEmoji', 'category', 'emoji', 'color', 'categoryLabel', 'topic', 'savedAt', 'active']);
    fSheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#C13584').setFontColor('#ffffff');
    Logger.log('Aba Favorites criada.');
  }

  // ── Analytics ──────────────────────────────────
  let aSheet = ss.getSheetByName(SHEET.ANALYTICS);
  if (!aSheet) {
    aSheet = ss.insertSheet(SHEET.ANALYTICS);
    aSheet.appendRow(['timestamp', 'sessionId', 'topic', 'nicho', 'categories', 'hooksGenerated']);
    aSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#405DE6').setFontColor('#ffffff');
    Logger.log('Aba Analytics criada.');
  }

  Logger.log('Setup completo! Agora implante como Web App.');
  return 'Setup concluído com sucesso.';
}

// ── Utilitários ────────────────────────────────────

function getSheet(name) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Aba "' + name + '" não encontrada. Execute setupSheets() primeiro.');
  return sheet;
}

function jsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ── Templates padrão (usados no setup inicial) ─────

const DEFAULT_TEMPLATES = [
  // curiosidade
  ['curiosidade','Curiosidade','🤔','#7c3aed','Você sabia que {tema} pode mudar completamente sua vida?','🤔 Você sabia que {tema} pode mudar completamente sua vida?',true],
  ['curiosidade','Curiosidade','🤔','#7c3aed','O que ninguém te conta sobre {tema}...','🤫 O que ninguém te conta sobre {tema}...',true],
  ['curiosidade','Curiosidade','🤔','#7c3aed','Por que 99% das pessoas erram em {tema}?','❓ Por que 99% das pessoas erram em {tema}?',true],
  ['curiosidade','Curiosidade','🤔','#7c3aed','A verdade sobre {tema} que você nunca ouviu','👀 A verdade sobre {tema} que você nunca ouviu',true],
  ['curiosidade','Curiosidade','🤔','#7c3aed','O segredo de {tema} que os especialistas guardam a sete chaves','🔑 O segredo de {tema} que os especialistas guardam a sete chaves',true],
  ['curiosidade','Curiosidade','🤔','#7c3aed','Existe algo em {tema} que vai te deixar de boca aberta','😮 Existe algo em {tema} que vai te deixar de boca aberta',true],
  // choque
  ['choque','Choque','😱','#dc2626','Descobri algo sobre {tema} que me deixou em choque','😱 Descobri algo sobre {tema} que me deixou em choque',true],
  ['choque','Choque','😱','#dc2626','A verdade chocante sobre {tema} que ninguém fala','⚡ A verdade chocante sobre {tema} que ninguém fala',true],
  ['choque','Choque','😱','#dc2626','Fui pesquisar sobre {tema} e não acreditei no que achei','🔍 Fui pesquisar sobre {tema} e não acreditei no que achei',true],
  ['choque','Choque','😱','#dc2626','Isso sobre {tema} vai te surpreender demais','🤯 Isso sobre {tema} vai te surpreender demais',true],
  ['choque','Choque','😱','#dc2626','{tema}: o que descobri me deixou completamente sem palavras','💥 {tema}: o que descobri me deixou completamente sem palavras',true],
  ['choque','Choque','😱','#dc2626','Nunca imaginei que {tema} pudesse causar tudo isso','😳 Nunca imaginei que {tema} pudesse causar tudo isso',true],
  // problema
  ['problema','Problema','⚠️','#d97706','Cansado de não ter resultados com {tema}?','😤 Cansado de não ter resultados com {tema}?',true],
  ['problema','Problema','⚠️','#d97706','Se você sofre com {tema}, esse vídeo é para você','💔 Se você sofre com {tema}, esse vídeo é para você',true],
  ['problema','Problema','⚠️','#d97706','O maior erro de quem começa em {tema}...','⚠️ O maior erro de quem começa em {tema}...',true],
  ['problema','Problema','⚠️','#d97706','Por que {tema} não está funcionando para você?','🤷 Por que {tema} não está funcionando para você?',true],
  ['problema','Problema','⚠️','#d97706','Você está travado em {tema}? Eu sei o motivo','😩 Você está travado em {tema}? Eu sei o motivo',true],
  ['problema','Problema','⚠️','#d97706','{tema} te frustra? A culpa não é sua — é do método','😔 {tema} te frustra? A culpa não é sua — é do método',true],
  // polemica
  ['polemica','Polêmica','🔥','#ea580c','{tema} não funciona do jeito que te ensinaram','🚫 {tema} não funciona do jeito que te ensinaram',true],
  ['polemica','Polêmica','🔥','#ea580c','Vou falar o que ninguém tem coragem de dizer sobre {tema}','🔥 Vou falar o que ninguém tem coragem de dizer sobre {tema}',true],
  ['polemica','Polêmica','🔥','#ea580c','Para de perder tempo com {tema} desse jeito','✋ Para de perder tempo com {tema} desse jeito',true],
  ['polemica','Polêmica','🔥','#ea580c','A grande mentira sobre {tema} que todo mundo acredita','🎭 A grande mentira sobre {tema} que todo mundo acredita',true],
  ['polemica','Polêmica','🔥','#ea580c','Discordo de tudo que você aprendeu sobre {tema}','⚡ Discordo de tudo que você aprendeu sobre {tema}',true],
  ['polemica','Polêmica','🔥','#ea580c','Isso que chamam de {tema} está completamente errado','💣 Isso que chamam de {tema} está completamente errado',true],
  // historia
  ['historia','História','📖','#2563eb','Há 1 ano eu não sabia NADA sobre {tema}, hoje...','📅 Há 1 ano eu não sabia NADA sobre {tema}, hoje...',true],
  ['historia','História','📖','#2563eb','Uma coisa que aconteceu comigo em {tema} mudou tudo','💡 Uma coisa que aconteceu comigo em {tema} mudou tudo',true],
  ['historia','História','📖','#2563eb','Minha maior falha com {tema} me ensinou algo incrível','😅 Minha maior falha com {tema} me ensinou algo incrível',true],
  ['historia','História','📖','#2563eb','Nunca vou esquecer o dia que descobri {tema}','🗓️ Nunca vou esquecer o dia que descobri {tema}',true],
  ['historia','História','📖','#2563eb','Me pediram para nunca contar o que aprendi sobre {tema}','🤫 Me pediram para nunca contar o que aprendi sobre {tema}',true],
  ['historia','História','📖','#2563eb','Quando comecei em {tema}, errei tudo — e foi a melhor coisa','🎯 Quando comecei em {tema}, errei tudo — e foi a melhor coisa',true],
  // desafio
  ['desafio','Desafio','✅','#16a34a','Testa isso com {tema} por 7 dias e me conta o resultado','⏱️ Testa isso com {tema} por 7 dias e me conta o resultado',true],
  ['desafio','Desafio','✅','#16a34a','Faz esse exercício sobre {tema} agora e veja a diferença','💪 Faz esse exercício sobre {tema} agora e veja a diferença',true],
  ['desafio','Desafio','✅','#16a34a','Desafio: aplique {tema} por 30 dias e transforme sua vida','🏆 Desafio: aplique {tema} por 30 dias e transforme sua vida',true],
  ['desafio','Desafio','✅','#16a34a','Se você conseguir fazer isso em {tema}, me marca nos comentários','🙋 Se você conseguir fazer isso em {tema}, me marca nos comentários',true],
  ['desafio','Desafio','✅','#16a34a','Aceita o desafio de {tema} comigo?','🤝 Aceita o desafio de {tema} comigo?',true],
  ['desafio','Desafio','✅','#16a34a','Prove para você mesmo que {tema} funciona: faça isso hoje','✅ Prove para você mesmo que {tema} funciona: faça isso hoje',true],
  // dicaRapida
  ['dicaRapida','Dica Rápida','💡','#0891b2','3 segredos de {tema} que os especialistas escondem','💡 3 segredos de {tema} que os especialistas escondem',true],
  ['dicaRapida','Dica Rápida','💡','#0891b2','O truque de {tema} que ninguém jamais te ensinou','🎯 O truque de {tema} que ninguém jamais te ensinou',true],
  ['dicaRapida','Dica Rápida','💡','#0891b2','Como dominar {tema} em menos de 5 minutos','⚡ Como dominar {tema} em menos de 5 minutos',true],
  ['dicaRapida','Dica Rápida','💡','#0891b2','A dica de {tema} que vai te economizar horas de trabalho','⏰ A dica de {tema} que vai te economizar horas de trabalho',true],
  ['dicaRapida','Dica Rápida','💡','#0891b2','O método mais rápido para {tema} que já vi na vida','🚀 O método mais rápido para {tema} que já vi na vida',true],
  ['dicaRapida','Dica Rápida','💡','#0891b2','Aprenda {tema} agora: muito mais simples do que parece','📚 Aprenda {tema} agora: muito mais simples do que parece',true],
  // erroComum
  ['erroComum','Erro Comum','😅','#9333ea','3 erros de {tema} que praticamente todo mundo comete','❌ 3 erros de {tema} que praticamente todo mundo comete',true],
  ['erroComum','Erro Comum','😅','#9333ea','Você está fazendo {tema} COMPLETAMENTE ERRADO','🚫 Você está fazendo {tema} COMPLETAMENTE ERRADO',true],
  ['erroComum','Erro Comum','😅','#9333ea','Para de cometer esses erros em {tema}!','⛔ Para de cometer esses erros em {tema}!',true],
  ['erroComum','Erro Comum','😅','#9333ea','O erro número 1 de quem tenta {tema} pela primeira vez','😬 O erro número 1 de quem tenta {tema} pela primeira vez',true],
  ['erroComum','Erro Comum','😅','#9333ea','Esses erros em {tema} estão te sabotando sem você saber','🔴 Esses erros em {tema} estão te sabotando sem você saber',true],
  ['erroComum','Erro Comum','😅','#9333ea','Fiz esses erros em {tema} e aprendi da maneira mais difícil','😓 Fiz esses erros em {tema} e aprendi da maneira mais difícil',true],
  // transformacao
  ['transformacao','Transformação','🏆','#0d9488','Como {tema} transformou minha vida em apenas 30 dias','🔄 Como {tema} transformou minha vida em apenas 30 dias',true],
  ['transformacao','Transformação','🏆','#0d9488','De zero ao máximo em {tema}: minha história real','📈 De zero ao máximo em {tema}: minha história real',true],
  ['transformacao','Transformação','🏆','#0d9488','Antes e depois com {tema}: resultados que ninguém acreditou','✨ Antes e depois com {tema}: resultados que ninguém acreditou',true],
  ['transformacao','Transformação','🏆','#0d9488','{tema} mudou tudo na minha vida — e pode mudar na sua também','🌟 {tema} mudou tudo na minha vida — e pode mudar na sua também',true],
  ['transformacao','Transformação','🏆','#0d9488','O que {tema} fez por mim em apenas 3 meses vai te surpreender','🏅 O que {tema} fez por mim em apenas 3 meses vai te surpreender',true],
  ['transformacao','Transformação','🏆','#0d9488','Minha transformação com {tema} que absolutamente ninguém esperava','🦋 Minha transformação com {tema} que absolutamente ninguém esperava',true],
  // dado
  ['dado','Estatística','📊','#1d4ed8','95% das pessoas desistem de {tema} por esse motivo','📊 95% das pessoas desistem de {tema} por esse motivo',true],
  ['dado','Estatística','📊','#1d4ed8','Um estudo revelou que {tema} pode aumentar seus resultados em 300%','🔬 Um estudo revelou que {tema} pode aumentar seus resultados em 300%',true],
  ['dado','Estatística','📊','#1d4ed8','Só 5% das pessoas realmente sabem disso sobre {tema}','💯 Só 5% das pessoas realmente sabem disso sobre {tema}',true],
  ['dado','Estatística','📊','#1d4ed8','Os números sobre {tema} vão te deixar de queixo caído','🔢 Os números sobre {tema} vão te deixar de queixo caído',true],
  ['dado','Estatística','📊','#1d4ed8','Dado chocante: 8 em cada 10 pessoas erram nessa etapa de {tema}','📉 Dado chocante: 8 em cada 10 pessoas erram nessa etapa de {tema}',true],
  ['dado','Estatística','📊','#1d4ed8','Pesquisa recente mostrou que {tema} é muito mais eficaz do que pensamos','📈 Pesquisa recente mostrou que {tema} é muito mais eficaz do que pensamos',true],
];
