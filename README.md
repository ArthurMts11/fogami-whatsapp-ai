# FOGAMI WhatsApp AI

Atendimento automatico da FOGAMI no WhatsApp usando WhatsApp Cloud API e OpenAI.

## Recursos

- Responde automaticamente em portugues
- Mantem historico por numero de telefone
- Qualifica nome, problema, empresa, prazo e investimento
- Encaminha conversas complexas ou urgentes para um atendente humano
- Verifica assinatura dos webhooks quando `WHATSAPP_APP_SECRET` esta configurado
- Deduplicacao basica por ID da mensagem

## Configuracao

1. Instale Node.js 22 ou mais novo.
2. Execute `npm install`.
3. Copie `.env.example` para `.env` e configure as credenciais.
4. Execute `npm run dev`.

Para receber webhooks, o servidor precisa estar publicado em HTTPS. No painel da Meta:

- URL do webhook: `https://SEU-DOMINIO/webhook`
- Token de verificacao: o valor de `WHATSAPP_VERIFY_TOKEN`
- Campo assinado: `messages`
- Configure o numero do WhatsApp Business no mesmo aplicativo da Meta

## Variaveis

| Variavel | Uso |
|---|---|
| `OPENAI_API_KEY` | Chave da API OpenAI |
| `OPENAI_MODEL` | Modelo, padrao `gpt-4o-mini` |
| `WHATSAPP_TOKEN` | Token temporario ou permanente da Graph API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do numero no WhatsApp Business |
| `WHATSAPP_VERIFY_TOKEN` | Token de verificacao do webhook |
| `WHATSAPP_APP_SECRET` | Segredo do app Meta para validar assinaturas |
| `WHATSAPP_TEAM_PHONE` | Numero que recebera encaminhamentos humanos |

## Implantacao

Use um servidor ou plataforma com HTTPS persistente. Mantenha o diretorio `data/` em volume persistente.
