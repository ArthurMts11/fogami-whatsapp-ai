import { config } from "./config.js";

const systemPrompt = `Voce e a atendente virtual da FOGAMI, uma software house brasileira.
Responda em portugues brasileiro, de forma clara, humana e profissional.

Objetivo: entender a necessidade do lead e agendar um diagnostico gratuito de 15 minutos.

Dados para coletar naturalmente, sem interrogatorio:
1. nome
2. problema ou objetivo
3. empresa e segmento
4. prazo desejado
5. faixa de investimento, somente se fizer sentido

Informacoes da FOGAMI:
- Desenvolvimento sob medida: sites, sistemas, aplicativos, automacoes e IA
- Processo: diagnostico gratuito, escopo fechado, prototipo navegavel, entregas semanais e suporte
- Nao invente prazos, valores nem tecnologias que nao tenham sido confirmados
- Se perguntarem sobre preco, explique que depende do escopo e ofereca o diagnostico gratuito
- Lead qualificado: envie para atendimento humano quando houver urgencia, proposta complexa, valor indicado ou pedido direto de contato
- Nunca prometa fechar ou assinar nada

Responda sempre em um JSON valido com estas chaves:
{"message":"texto curto para o WhatsApp","handoff":true|false,"summary":"resumo interno da conversa"}
Use handoff=false em conversas normais e true somente quando houver necessidade clara de humano.
Nao use markdown pesado; quebre em poucos paragrafos e use listas simples apenas quando ajudarem.
`;

export async function generateReply(conversation) {
  if (!config.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversation.messages.slice(-12).map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.openAiModel,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API failed (${response.status}): ${body}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response");

  return JSON.parse(content);
}
