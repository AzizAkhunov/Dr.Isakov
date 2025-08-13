export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { title, data, page, ts } = req.body || {};

  if (!title || !data || typeof data !== 'object') {
    return res.status(400).json({ ok: false, error: "Missing or invalid required fields" });
  }

  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return chatId;
  }

  const text =
    `📩 <b>${title}</b>\n\n` +
    Object.entries(data)
      .map(([key, value]) => `• <b>${key}:</b> ${value}`)
      .join("\n") +
    `\n\n🌐 Страница: ${page || "—"}\n🕒 ${ts || new Date().toISOString()}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML"
      }),
    });

    if (!tgRes.ok) {
      const errorText = await tgRes.text();
      console.error("Telegram API error:", tgRes.status, errorText);
      throw new Error("Telegram API request failed");
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Telegram send error:", err);
    res.status(500).json({ ok: false, error: "Telegram send error" });
  }
}
