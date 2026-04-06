const crypto = require('crypto');

export default async function handler(req, res) {
    const FIREBASE_URL = "https://adminpanelffa942456789764-default-rtdb.europe-west1.firebasedatabase.app";
    const FIREBASE_SECRET = "ВАШ_СЕКРЕТ_БАЗЫ_ДАННЫХ_ИЗ_FIREBASE";
    const APP_SECRET_KEY = "d31f0a32-f0d6-487a-b384-4c8190f0634c"; // Ваш ключ

    const hwid = req.query.hwid;
    if (!hwid) {
        return res.status(400).json({ error: "HWID not provided" });
    }

    try {
        const url = `${FIREBASE_URL}/Users/${hwid}.json?auth=${FIREBASE_SECRET}`;
        const response = await fetch(url);
        const fbData = await response.json();

        let data = { hwid: hwid, isActive: false, expDate: "none", type: "none" };

        if (fbData !== null) {
            data.isActive = fbData.IsActive || false;
            data.expDate = fbData.ExpirationDate || "none";
            data.type = fbData.LicenseType || "none";
        }

        const payloadString = `${data.hwid}|${data.isActive ? "true" : "false"}|${data.expDate}|${data.type}`;
        const signature = crypto.createHmac('sha256', APP_SECRET_KEY).update(payloadString).digest('hex');
        
        data.signature = signature;
        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}
