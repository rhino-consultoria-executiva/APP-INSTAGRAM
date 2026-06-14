import {
  workflow,
  node,
  trigger,
  languageModel,
  outputParser,
  newCredential,
  expr,
} from '@n8n/workflow-sdk';

const receberAudio = trigger({
  type: 'n8n-nodes-base.telegramTrigger',
  version: 1.3,
  config: {
    name: 'Telegram - Receber Áudio',
    parameters: { updates: ['message'] },
    credentials: { telegramApi: newCredential('Telegram account', '1MKtKQAFTBzDz9P1') },
  },
  output: [{ message: { chat: { id: 123456789 }, voice: { file_id: 'AwACAgEAA...' } } }],
});

const baixarAudio = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Baixar Áudio do Telegram',
    parameters: {
      resource: 'file',
      operation: 'get',
      fileId: expr('{{ $json.message.voice?.file_id || $json.message.audio?.file_id }}'),
      download: true,
    },
    credentials: { telegramApi: newCredential('Telegram account', '1MKtKQAFTBzDz9P1') },
  },
  output: [{ result: { file_id: 'AwACAgEAA...', file_path: 'voice/file_1.oga', file_size: 12345 } }],
});

const transcrever = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.3,
  config: {
    name: 'Transcrever Áudio (Whisper)',
    parameters: {
      resource: 'audio',
      operation: 'transcribe',
      binaryPropertyName: 'data',
      options: { language: 'pt' },
    },
    credentials: { openAiApi: newCredential('OpenAi account 5', 'yLprf17tOwSUKeUL') },
  },
  output: [{ text: 'Marcar reunião com o cliente amanhã às 14 horas' }],
});

const modeloOpenAi = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  version: 1.3,
  config: {
    name: 'OpenAI Chat Model',
    parameters: { model: { __rl: true, mode: 'list', value: 'gpt-5-mini' } },
    credentials: { openAiApi: newCredential('OpenAi account 5', 'yLprf17tOwSUKeUL') },
  },
});

const formatoEstruturado = outputParser({
  type: '@n8n/n8n-nodes-langchain.outputParserStructured',
  version: 1.3,
  config: {
    name: 'Formato Estruturado',
    parameters: {
      schemaType: 'fromJson',
      jsonSchemaExample:
        '{ "titulo": "Reunião com o cliente", "inicio": "2026-06-15T14:00:00-03:00", "fim": "2026-06-15T15:00:00-03:00", "descricao": "Detalhes do compromisso" }',
    },
  },
});

const interpretar = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Interpretar Agendamento',
    parameters: {
      promptType: 'define',
      hasOutputParser: true,
      text: expr(
        'Data e hora atual: {{ $now.setZone("America/Sao_Paulo").toFormat("yyyy-MM-dd HH:mm") }} ' +
          '(dia da semana: {{ $now.setZone("America/Sao_Paulo").setLocale("pt-BR").toFormat("cccc") }}). ' +
          'Fuso horário: America/Sao_Paulo (offset -03:00).\n\n' +
          'Transcrição do áudio enviado pelo usuário:\n"{{ $json.text }}"\n\n' +
          'Extraia os dados do agendamento a partir dessa transcrição.',
      ),
      options: {
        systemMessage:
          'Você é um assistente de agenda em português do Brasil. A partir da transcrição de um áudio, ' +
          'extraia um único agendamento e retorne SOMENTE o objeto JSON pedido. Regras: ' +
          '1) "titulo": nome curto e claro do compromisso. ' +
          '2) "inicio" e "fim": datas no formato ISO 8601 com offset -03:00 (ex.: 2026-06-15T14:00:00-03:00), ' +
          'sempre relativas à data/hora atual informada e ao fuso America/Sao_Paulo. ' +
          '3) Se o usuário disser "amanhã", "hoje", "sexta", "daqui a 2 horas" etc., calcule a data absoluta. ' +
          '4) Se não houver hora de término, deixe "fim" como o início + 1 hora. ' +
          '5) "descricao": detalhes extras ou string vazia. ' +
          'Nunca invente compromissos que não estejam no áudio.',
      },
    },
    subnodes: { model: modeloOpenAi, outputParser: formatoEstruturado },
  },
  output: [
    {
      output: {
        titulo: 'Reunião com o cliente',
        inicio: '2026-06-15T14:00:00-03:00',
        fim: '2026-06-15T15:00:00-03:00',
        descricao: '',
      },
    },
  ],
});

const normalizar = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Normalizar Dados',
    parameters: {
      mode: 'runOnceForEachItem',
      language: 'javaScript',
      jsCode:
        'const out = $json.output ?? $json;\n' +
        'const data = typeof out === "string" ? JSON.parse(out) : out;\n' +
        'let inicio = data.inicio;\n' +
        'let fim = data.fim;\n' +
        'if (inicio && !fim) {\n' +
        '  fim = DateTime.fromISO(inicio).plus({ hours: 1 }).toISO();\n' +
        '}\n' +
        'return {\n' +
        '  titulo: data.titulo || "Compromisso",\n' +
        '  inicio: inicio,\n' +
        '  fim: fim,\n' +
        '  descricao: data.descricao || "",\n' +
        '};',
    },
  },
  output: [
    {
      titulo: 'Reunião com o cliente',
      inicio: '2026-06-15T14:00:00-03:00',
      fim: '2026-06-15T15:00:00-03:00',
      descricao: '',
    },
  ],
});

const criarEvento = node({
  type: 'n8n-nodes-base.googleCalendar',
  version: 1.3,
  config: {
    name: 'Criar Evento no Google Calendar',
    parameters: {
      resource: 'event',
      operation: 'create',
      calendar: { __rl: true, mode: 'id', value: 'primary' },
      start: expr('{{ $json.inicio }}'),
      end: expr('{{ $json.fim }}'),
      useDefaultReminders: false,
      additionalFields: {
        summary: expr('{{ $json.titulo }}'),
        description: expr('{{ $json.descricao }}'),
      },
      remindersUi: {
        remindersValues: [
          { method: 'popup', minutes: 0 },
          { method: 'popup', minutes: 10 },
          { method: 'email', minutes: 30 },
        ],
      },
    },
    credentials: { googleCalendarOAuth2Api: newCredential('Google Calendar account', 'xZ36kPiQvOE88CUD') },
  },
  output: [
    {
      id: 'abc123eventid',
      summary: 'Reunião com o cliente',
      start: { dateTime: '2026-06-15T14:00:00-03:00' },
      htmlLink: 'https://www.google.com/calendar/event?eid=abc123',
    },
  ],
});

const registrarAlarme = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Registrar Alarme',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: 'v6LsFBV6EjBkGwFN' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          chatId: expr('{{ $(\'Telegram - Receber Áudio\').item.json.message.chat.id }}'),
          titulo: expr('{{ $(\'Normalizar Dados\').item.json.titulo }}'),
          inicio: expr('{{ $(\'Normalizar Dados\').item.json.inicio }}'),
          eventId: expr('{{ $json.id }}'),
          alarmeEnviado: expr('{{ false }}'),
        },
        schema: [
          { id: 'chatId', displayName: 'chatId', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'titulo', displayName: 'titulo', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'inicio', displayName: 'inicio', required: false, defaultMatch: false, display: true, type: 'date', canBeUsedToMatch: true },
          { id: 'eventId', displayName: 'eventId', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'alarmeEnviado', displayName: 'alarmeEnviado', required: false, defaultMatch: false, display: true, type: 'boolean', canBeUsedToMatch: true },
        ],
      },
    },
  },
  output: [{ id: 1, createdAt: '2026-06-14T22:40:00.000Z' }],
});

const confirmar = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Confirmar no Telegram',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: expr('{{ $(\'Telegram - Receber Áudio\').item.json.message.chat.id }}'),
      text: expr(
        '✅ Agendamento criado!\n\n' +
          '📌 <b>{{ $(\'Normalizar Dados\').item.json.titulo }}</b>\n' +
          '📅 {{ DateTime.fromISO($(\'Normalizar Dados\').item.json.inicio).setZone("America/Sao_Paulo").setLocale("pt-BR").toFormat("cccc, dd/MM/yyyy \'às\' HH:mm") }}\n\n' +
          '🔔 Você receberá um alarme sonoro na hora marcada.',
      ),
      additionalFields: { parse_mode: 'HTML', appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('Telegram account', '1MKtKQAFTBzDz9P1') },
  },
  output: [{ ok: true, result: { message_id: 100 } }],
});

export default workflow('agenda-inteligente-voz', 'Agenda Inteligente: Voz → Google Calendar')
  .add(receberAudio)
  .to(baixarAudio)
  .to(transcrever)
  .to(interpretar)
  .to(normalizar)
  .to(criarEvento)
  .to(registrarAlarme)
  .to(confirmar);
