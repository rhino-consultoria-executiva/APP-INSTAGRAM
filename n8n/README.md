# 🗓️ Agenda Inteligente (Telegram → Google Calendar + Alarme Sonoro)

Sistema de agenda por **voz**: você manda um áudio no Telegram, a IA transcreve e
interpreta, cria o evento no seu **Google Calendar** (`icm.melo.fm@gmail.com`) e
dispara um **alarme sonoro** no celular na hora marcada — com o nome do compromisso.

Construído no **n8n** (`https://rhino-n8n.b4rgts.easypanel.host`), projeto pessoal
`FELIPE DE MELO <icm.melo.fm@gmail.com>`.

## Fluxo

```
🎙️ Áudio no Telegram
      │
      ▼
[Workflow A] Voz → Google Calendar
  1. Telegram Trigger (recebe a mensagem de voz)
  2. Baixa o arquivo de áudio
  3. Transcreve com OpenAI Whisper (pt-BR)
  4. IA (GPT) interpreta → { título, início, fim, descrição }  (fuso America/Sao_Paulo)
  5. Normaliza datas (Code)
  6. Cria evento no Google Calendar (lembretes popup + e-mail)
  7. Registra o alarme na Data Table `agenda_alarmes`
  8. Confirma no Telegram ✅
      │
      ▼
[Workflow B] Alarme Sonoro  (roda a cada 1 minuto)
  1. Schedule Trigger (cada minuto)
  2. Busca alarmes pendentes (alarmeEnviado = false)
  3. Filtra os que já chegaram na hora (início <= agora)
  4. Dispara mensagem de ALARME no Telegram (com som / notificação)
  5. Marca como enviado (não repete)
```

## Componentes no n8n

| Item | Nome | ID |
|------|------|----|
| Workflow A | Agenda Inteligente: Voz → Google Calendar | `YF1gPgZNtoyjRVFT` |
| Workflow B | Agenda Inteligente: Alarme Sonoro | `tlehHIPLXlNzHsxv` |
| Data Table | `agenda_alarmes` | `v6LsFBV6EjBkGwFN` |

**Colunas da Data Table `agenda_alarmes`:** `chatId` (string), `titulo` (string),
`inicio` (date), `eventId` (string), `alarmeEnviado` (boolean).

**Credenciais usadas (já existentes na conta):** Telegram account, Google Calendar
account, OpenAi account 5.

## Código-fonte (n8n Workflow SDK)

- `workflow-a-voz-para-calendar.ts`
- `workflow-b-alarme-sonoro.ts`

São a fonte da verdade. Para recriar/atualizar, use o MCP do n8n
(`validate_workflow` → `create_workflow_from_code` / `update_workflow`).

## ⚙️ Passos finais para ativar (você precisa fazer)

1. **Confirme o bot do Telegram.** O Workflow A usa a credencial *"Telegram account"*.
   - ⚠️ Um bot do Telegram só pode ter **um** webhook ativo por vez. Se essa mesma
     credencial já é usada por outro workflow ativo (ex.: *"ATENDENTE PRINCIPAL - (RHINO)"*),
     **crie um bot novo** com o [@BotFather](https://t.me/BotFather) só para a agenda e
     cadastre a credencial nele. Caso contrário haverá conflito.
2. **Inicie uma conversa com o bot** (envie qualquer mensagem) para que ele consiga te responder.
3. **Ative o Workflow A** e o **Workflow B** (toggle "Active" em cada um).
4. **Teste:** mande um áudio do tipo *"marcar reunião com o cliente amanhã às 14 horas"*.
   - O bot deve responder confirmando, o evento aparece no Google Calendar e, na hora,
     chega o alarme.
5. **Som garantido no celular:**
   - No app **Google Agenda** → Configurações → Notificações: ative som/alarme.
   - No **Telegram**: deixe as notificações do bot com som alto e sem silenciar a conversa.
     O alarme do Workflow B usa notificação sonora (não silenciosa).

## Observações

- Fuso fixo em `America/Sao_Paulo` (-03:00). A IA calcula "amanhã", "sexta", "daqui a 2h" etc.
- O alarme dispara em até ~1 min da hora marcada (granularidade do schedule).
- Idempotência: cada alarme é enviado **uma única vez** (campo `alarmeEnviado`).
