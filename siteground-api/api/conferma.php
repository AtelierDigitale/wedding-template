<?php
require_once __DIR__ . '/../db.php';
cors();

$body = jsonBody();
$invitati = $body['invitati'] ?? [];

if (empty($invitati)) {
    json(['error' => 'Dati mancanti'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare("UPDATE invitati SET confermato = ?, confirmed_at = NOW() WHERE id = ?");

foreach ($invitati as $inv) {
    $stmt->execute([$inv['confermato'] ? 1 : 0, $inv['id']]);
}

json(['ok' => true]);
