import {
  workflow,
  node,
  trigger,
  newCredential,
  expr,
} from '@n8n/workflow-sdk';

const agendarVerificacao = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'A Cada Minuto',
    parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 1 }] } },
  },
  output: [{}],
});

const buscarPendentes = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Buscar Alarmes Pendentes',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'v6LsFBV6EjBkGwFN' },
      matchType: 'anyCondition',
      filters: { conditions: [{ keyName: 'alarmeEnviado', condition: 'isFalse' }] },
      returnAll: true,
    },
  },
  output: [
    {
      id: 1,
      chatId: '123456789',
      titulo: 'Reunião com o cliente',
      inicio: '2026-06-15T14:00:00-03:00',
      eventId: 'abc123eventid',
      alarmeEnviado: false,
    },
  ],
});

const filtrarHora = node({
  type: 'n8n-nodes-base.filter',
  version: 2.3,
  config: {
    name: 'Filtrar Hora do Alarme',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [
          {
            leftValue: expr('{{ $json.inicio }}'),
            operator: { type: 'dateTime', operation: 'before' },
            rightValue: expr('{{ $now.plus({ seconds: 30 }) }}'),
          },
        ],
      },
      looseTypeValidation: true,
    },
  },
  output: [
    {
      id: 1,
      chatId: '123456789',
      titulo: 'Reunião com o cliente',
      inicio: '2026-06-15T14:00:00-03:00',
      eventId: 'abc123eventid',
      alarmeEnviado: false,
    },
  ],
});

const dispararAlarme = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Disparar Alarme no Telegram',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: expr('{{ $json.chatId }}'),
      text: expr(
        '🔔🔔🔔 <b>ALARME DE AGENDAMENTO</b> 🔔🔔🔔\n\n' +
          '⏰ AGORA: <b>{{ $json.titulo }}</b>\n\n' +
          'Seu compromisso está começando! Não deixe passar.',
      ),
      additionalFields: { parse_mode: 'HTML', appendAttribution: false, disable_notification: false },
    },
    credentials: { telegramApi: newCredential('Telegram account', '1MKtKQAFTBzDz9P1') },
  },
  output: [{ ok: true, result: { message_id: 200 } }],
});

const marcarEnviado = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Marcar Alarme Enviado',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: { __rl: true, mode: 'id', value: 'v6LsFBV6EjBkGwFN' },
      matchType: 'allConditions',
      filters: {
        conditions: [
          {
            keyName: 'id',
            condition: 'eq',
            keyValue: expr('{{ $(\'Filtrar Hora do Alarme\').item.json.id }}'),
          },
        ],
      },
      columns: {
        mappingMode: 'defineBelow',
        value: { alarmeEnviado: expr('{{ true }}') },
        schema: [
          { id: 'alarmeEnviado', displayName: 'alarmeEnviado', required: false, defaultMatch: false, display: true, type: 'boolean', canBeUsedToMatch: true },
        ],
      },
    },
  },
  output: [{ id: 1, alarmeEnviado: true }],
});

export default workflow('agenda-inteligente-alarme', 'Agenda Inteligente: Alarme Sonoro')
  .add(agendarVerificacao)
  .to(buscarPendentes)
  .to(filtrarHora)
  .to(dispararAlarme)
  .to(marcarEnviado);
