// Файл: api/license.js
import crypto from 'crypto';

export default async function handler(req, res) {
    // --- ВАШИ НАСТРОЙКИ ---
    const FIREBASE_URL = "https://adminpanelffa942456789764-default-rtdb.europe-west1.firebasedatabase.app";
    const FIREBASE_SECRET = "Ve2XyR5iFdbzMitQQbUfTPNiuUOrBGfCv6prhHGp"; // Ваш секрет БД
    const APP_SECRET_KEY = "d31f0a32-f0d6-487a-b384-4c8190f0634c"; // Секретный ключ приложения
    // ----------------------

    const { hwid } = req.query;

    if (!hwid) {
        return res.status(400).json({ error: "HWID not provided" });
    }

    // Очистка HWID от лишних символов (аналог preg_replace)
    const cleanHwid = hwid.replace(/[^a-zA-Z0-9]/g, '');

    try {
        // 1. Запрос к Firebase
        const url = `${FIREBASE_URL}/Users/${cleanHwid}.json?auth=${FIREBASE_SECRET}`;
        const fbResponse = await fetch(url);
        const fbData = await fbResponse.json();

        let data = {
            hwid: cleanHwid,
            isActive: false,
            expDate: "none",
            type: "none"
        };

        // Если пользователь найден
        if (fbData && typeof fbData === 'object') {
            data.isActive = Boolean(fbData.IsActive);
            data.expDate = fbData.ExpirationDate || "none";
            data.type = fbData.LicenseType || "none";
        }

        // 2. КРИПТОГРАФИЯ (HMAC Signature)
        const isActiveStr = data.isActive ? "true" : "false";
        const payloadString = `${data.hwid}|${isActiveStr}|${data.expDate}|${data.type}`;
        
        // Создаем подпись (sha256 hmac)
        const signature = crypto
            .createHmac('sha256', APP_SECRET_KEY)
            .update(payloadString)
            .digest('hex')
            .toLowerCase(); // Приводим к нижнему регистру, как в C#

        data.signature = signature;

        // Отправляем JSON ответ клиенту
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
