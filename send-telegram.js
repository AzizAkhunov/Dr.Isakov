// api/send-telegram.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    res.status(500).json({ ok: false, error: 'Server not configured' });
    return;
  }

  try {
    const body = req.body;
    // basic server-side validation
    if (!body || typeof body !== 'object' || !body.title || !body.data) {
      res.status(400).json({ ok: false, error: 'Invalid payload' });
      return;
    }

    // build message text (HTML-safe - we will escape < & >)
    const escape = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let text = `<b>${escape(body.title)}</b>\n`;
    for (const k of Object.keys(body.data)) {
      text += `${escape(k)}: ${escape(body.data[k])}\n`;
    }
    text += `\nИсточник: ${escape(body.page)}\nВремя: ${escape(body.ts)}`;

    // send to telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
    const data = await tgRes.json();
    if (!data.ok) {
      console.error('Telegram API error', data);
      res.status(500).json({ ok: false, error: 'Telegram error', details: data });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ ok: false, error: 'internal' });
  }
}
