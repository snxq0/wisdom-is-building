export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { name, username, age, reason, timestamp, website } = req.body;

        // --- 1. HONEYPOT (боты палятся) ---
        if (website) {
            return res.status(200).json({ success: true });
        }

        // --- 2. TIME LIMIT (Europe/Berlin) ---
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("de-DE", {
            timeZone: "Europe/Berlin",
            hour: "numeric",
            hour12: false
        });

        const hour = parseInt(formatter.format(now));

        if (hour < 9 || hour >= 18) {
            return res.status(403).json({ error: "OUT_OF_WORKING_HOURS" });
        }

        // --- 3. TIME CHECK (слишком быстро = бот) ---
        const timeSpent = Date.now() - timestamp;
        if (timeSpent < 2000) {
            return res.status(200).json({ success: true });
        }

        // --- 4. RATE LIMIT (IP) ---
        const ip = req.headers["x-forwarded-for"] || "unknown";

        global.rateLimit = global.rateLimit || {};

        const nowTime = Date.now();
        const windowMs = 60 * 1000;

        if (!global.rateLimit[ip]) {
            global.rateLimit[ip] = [];
        }

        global.rateLimit[ip] = global.rateLimit[ip].filter(
            t => nowTime - t < windowMs
        );

        if (global.rateLimit[ip].length >= 3) {
            return res.status(429).json({ error: "Too many requests" });
        }

        global.rateLimit[ip].push(nowTime);

        // --- 5. ВАЛИДАЦИЯ ---
        if (!name || !username || !age || !reason) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // --- 6. TELEGRAM ---
        const message =
            `🔥 Новая заявка Wisdom\n\n` +
            `👤 Имя: ${name}\n` +
            `🎂 Возраст: ${age}\n` +
            `💬 TG: @${username}\n` +
            `📝 Почему: ${reason}`;

        const tgRes = await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: message
                })
            }
        );

        if (!tgRes.ok) throw new Error();

        return res.status(200).json({ success: true });

    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
}