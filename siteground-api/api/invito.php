<?php
require_once __DIR__ . '/../db.php';
cors();

$token = $_GET['token'] ?? '';
if (!$token) {
    json(['error' => 'Token mancante'], 400);
}

$pdo = getDb();

$stmt = $pdo->prepare("SELECT id, token, nome_gruppo, note FROM inviti WHERE token = ?");
$stmt->execute([$token]);
$invito = $stmt->fetch();

if (!$invito) {
    json(['error' => 'Invito non trovato'], 404);
}

$stmt = $pdo->prepare("SELECT id, nome, genere, confermato FROM invitati WHERE invito_id = ?");
$stmt->execute([$invito['id']]);
$invitati = $stmt->fetchAll();

json(['invito' => $invito, 'invitati' => $invitati]);
