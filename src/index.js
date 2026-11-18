import crypto from "node:crypto";
import express from "express";
import { config } from "./config.js";
import { generateReply } from "./ai.js";
import { readConversations, saveConversations } from "./store.js";
import { sendWhatsAppText } from "./whatsapp.js";

const app = express();

app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

function verifySignature(req) {
  if (!config.whatsappAppSecret) return true;
  const signature = req.get("x-hub-signature-256");
  if (!signature) return false;
  const digest = `sha256=${crypto
    .createHmac("sha256", config.whatsappAppSecret)
    .update(req.body)
    .digest("hex")}`;
  const signatureBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);
  return signatureBuffer.length === digestBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "fogami-whatsapp-ai" });
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === config.whatsappVerifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  if (!verifySignature(req)) return;

  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return;
  }

  const change = payload.entry?.[0]?.changes?.[0]?.value;
  const message = change?.messages?.[0];
  if (!message || message.type !== "text") return;

  const from = message.from;
  const text = message.text?.body?.trim();
  const messageId = message.id;
  if (!from || !text || !messageId) return;

  const conversations = await readConversations();
  const conversation = conversations[from] || {
    from,
    state: "qualifying",
    messages: [],
    seenMessageIds: [],
  };

  if (conversation.seenMessageIds.includes(messageId)) return;
  conversation.seenMessageIds = [...conversation.seenMessageIds.slice(-99), messageId];
  conversation.messages.push({ role: "user", content: text });

  try {
    const aiResult = await generateReply(conversation);
    conversation.messages.push({ role: "assistant", content: aiResult.message });
    conversation.lastSummary = aiResult.summary;

    if (aiResult.handoff) {
      conversation.state = "handoff";
      if (config.whatsappTeamPhone) {
        await sendWhatsAppText(
          config.whatsappTeamPhone,
          `Novo lead FOGAMI para atendimento humano:\nTelefone: ${from}\nResumo: ${aiResult.summary || "Sem resumo"}\nUltima mensagem: ${text}`,
        );
      }
    }

    conversations[from] = conversation;
    await saveConversations(conversations);
    await sendWhatsAppText(from, aiResult.message);
  } catch (error) {
    console.error(error);
    await sendWhatsAppText(
      from,
      "Desculpe, tive uma instabilidade agora. Posso encaminhar sua mensagem para a equipe da FOGAMI.",
    );
  }
});

app.listen(config.port, () => {
  console.log(`FOGAMI WhatsApp AI running on port ${config.port}`);
});
