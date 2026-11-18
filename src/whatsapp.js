import { config } from "./config.js";

export async function sendWhatsAppText(to, text) {
  if (!config.whatsappToken || !config.whatsappPhoneNumberId) {
    throw new Error("WhatsApp Cloud API is not configured");
  }

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${config.whatsappPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: true, body: text },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp API failed (${response.status}): ${body}`);
  }

  return response.json();
}
