<?php
header('Content-Type: application/json');

// --- ВАШИ НАСТРОЙКИ ---
$FIREBASE_URL = "https://adminpanelffa942456789764-default-rtdb.europe-west1.firebasedatabase.app";
$FIREBASE_SECRET = "Ve2XyR5iFdbzMitQQbUfTPNiuUOrBGfCv6prhHGp"; // Вставьте сюда секрет из Шага 1
$APP_SECRET_KEY = "d31f0a32-f0d6-487a-b384-4c8190f0634c"; // Секретный ключ для подписи (придумайте любой сложный)
// ----------------------

// Получаем HWID от C# клиента
$hwid = isset($_GET['hwid']) ? preg_replace('/[^A-Za-z0-9]/', '', $_GET['hwid']) : '';

if (empty($hwid)) {
    die(json_encode(["error" => "HWID not provided"]));
}

// 1. Делаем запрос к закрытой базе Firebase (используя секретный ключ)
$url = $FIREBASE_URL . '/Users/' . $hwid . '.json?auth=' . $FIREBASE_SECRET;
$response = @file_get_contents($url);

if ($response === false || $response === "null") {
    // Пользователя нет в базе
    $data = [
        "hwid" => $hwid,
        "isActive" => false,
        "expDate" => "none",
        "type" => "none"
    ];
} else {
    // Пользователь есть, разбираем ответ
    $fbData = json_decode($response, true);
    $data = [
        "hwid" => $hwid,
        "isActive" => (bool)($fbData['IsActive'] ?? false),
        "expDate" => $fbData['ExpirationDate'] ?? "none",
        "type" => $fbData['LicenseType'] ?? "none"
    ];
}

// 2. КРИПТОГРАФИЯ (HMAC Signature)
// Склеиваем важные данные в одну строку
$payloadString = $data['hwid'] . "|" . ($data['isActive'] ? "true" : "false") . "|" . $data['expDate'] . "|" . $data['type'];

// Создаем цифровую подпись (хэш) с использованием секретного ключа
$signature = hash_hmac('sha256', $payloadString, $APP_SECRET_KEY);

// Добавляем подпись к ответу
$data['signature'] = $signature;

// Отправляем C# клиенту
echo json_encode($data);
?>
