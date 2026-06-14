# 🗓️ Agenda Inteligente (Chat Web por voz → Google Calendar + Alarme)

Sistema de agenda por **voz**: você abre um chat web, manda um áudio, a IA transcreve
e interpreta, cria o evento no seu **Google Calendar** (`icm.melo.fm@gmail.com`) e
dispara um **alarme por e-mail + popup do Google Agenda** na hora marcada — com o nome
do compromisso.

Construído no **n8n** (`https://rhino-n8n.b4rgts.easypanel.host`), projeto pessoal
`FELIPE DE MELO <icm.melo.fm@gmail.com>`. **Ambos os workflows estão ATIVOS.**

> Histórico: a primeira versão usava um bot do Telegram, mas o token do bot existente
> era inválido (o Telegram retornava 404 ao registrar o webhook). Trocamos o canal de
> entrada para o **chat web hospedado pelo n8n**, que não exige token externo.

## 🔗 Link para usar (abra no celular ou PC)

```
https://rhino-n8n.b4rgts.easypanel.host/webhook/e2a75f10-0b2c-452e-ab3d-20f11e74bb60/chat
```

No chat, toque no clipe 📎, grave/anexe um áudio (ex.: *"marcar reunião com o cliente
amanhã às 14 horas"*) e envie. O bot responde confirmando o agendamento.

## Fluxo

```
🎙️ Áudio no Chat Web
      │
      ▼
[Workflow A] Chat Web → Google Calendar   (ATIVO)
  1. Chat Trigger (upload de áudio)
  2. Transcreve com OpenAI Whisper (pt-BR)
  3. IA (GPT) interpreta → { título, início, fim, descrição }  (fuso America/Sao_Paulo)
  4. Normaliza datas (Code)
  5. Cria evento no Google Calendar (popup 0/10 min + e-mail 0/30 min)
  6. Registra o alarme na Data Table `agenda_alarmes`
  7. Responde no chat ✅
      │
      ▼
[Workflow B] Alarme Sonoro  (ATIVO, roda a cada 1 minuto)
  1. Schedule Trigger (cada minuto)
  2. Busca alarmes pendentes (alarmeEnviado = false)
  3. Filtra os que já chegaram na hora (início <= agora)
  4. Envia e-mail de ALARME (Gmail) com o nome do compromisso
  5. Marca como enviado (não repete)
```

## Componentes no n8n

| Item | Nome | ID | Estado |
|------|------|----|--------|
| Workflow A | Agenda Inteligente: Chat Web → Google Calendar | `AisGpf3dg4NPrbpQ` | ✅ Ativo |
| Workflow B | Agenda Inteligente: Alarme Sonoro | `tlehHIPLXlNzHsxv` | ✅ Ativo |
| Data Table | `agenda_alarmes` | `v6LsFBV6EjBkGwFN` | — |
| Workflow A (Telegram, antigo) | Agenda Inteligente: Voz → Google Calendar | `YF1gPgZNtoyjRVFT` | 🗄️ Arquivado |

**Colunas da Data Table `agenda_alarmes`:** `chatId` (string — guarda o e-mail de destino
do alarme), `titulo` (string), `inicio` (date), `eventId` (string), `alarmeEnviado` (boolean).

**Credenciais usadas:** OpenAi account 3 (Whisper + GPT), Google Calendar account, Gmail account.

## Código-fonte (n8n Workflow SDK)

- `workflow-a-chat-web-para-calendar.ts` — Workflow A (ATIVO)
- `workflow-b-alarme-sonoro.ts` — Workflow B (envio por e-mail aplicado via update; o arquivo
  reflete a versão Telegram original — a fonte da verdade do passo de envio é o n8n)
- `workflow-a-voz-para-calendar.ts` — versão Telegram original (arquivada, só referência)

## 🔔 Garantir que o alarme não passe despercebido

Como não usamos mais o Telegram, o alarme chega por **dois caminhos**:
1. **Popup do Google Agenda** no celular (app Google Agenda → Configurações → Notificações:
   ative som/alarme). É o que mais se aproxima de "despertar com som".
2. **E-mail** no exato horário (Workflow B) + lembrete por e-mail do próprio evento.

> Para um som forte estilo despertador, deixe o app **Google Agenda** com notificação
> sonora alta e a conta `icm.melo.fm@gmail.com` logada no celular.

## Observações

- Fuso fixo em `America/Sao_Paulo` (-03:00). A IA calcula "amanhã", "sexta", "daqui a 2h" etc.
- O alarme dispara em até ~1 min da hora marcada (granularidade do schedule).
- Idempotência: cada alarme é enviado **uma única vez** (campo `alarmeEnviado`).
- Se a transcrição falhar, o ajuste mais provável é o nome da propriedade binária do
  áudio no nó *Transcrever Áudio (Whisper)* (`binaryPropertyName`, hoje `data`).
