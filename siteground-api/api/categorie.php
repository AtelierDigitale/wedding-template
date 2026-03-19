<?php
require_once __DIR__ . '/../db.php';
cors();

header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDb();

if (!auth()) {
    json(['error' => 'Unauthorized'], 401);
}

// GET — lista categorie con conteggi preventivi
if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT c.*,
            (SELECT COUNT(*) FROM preventivi WHERE categoria_id = c.id) as totale_preventivi,
            (SELECT COUNT(*) FROM preventivi WHERE categoria_id = c.id AND scelto = 1) as preventivo_scelto,
            (SELECT COALESCE(SUM(prezzo), 0) FROM preventivi WHERE categoria_id = c.id AND scelto = 1) as importo_scelto
        FROM categorie_preventivo c
        ORDER BY c.ordine, c.nome
    ");
    json($stmt->fetchAll());
}

// POST — crea categoria
if ($method === 'POST') {
    $body = jsonBody();
    $nome = trim($body['nome'] ?? '');
    $icona = trim($body['icona'] ?? '');
    $ordine = (int)($body['ordine'] ?? 0);

    if (!$nome) {
        json(['error' => 'Nome mancante'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO categorie_preventivo (nome, icona, ordine) VALUES (?, ?, ?)");
    $stmt->execute([$nome, $icona ?: null, $ordine]);

    json([
        'id' => (int)$pdo->lastInsertId(),
        'nome' => $nome,
        'icona' => $icona ?: null,
        'ordine' => $ordine,
    ]);
}

// PUT — aggiorna categoria
if ($method === 'PUT') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    $nome = trim($body['nome'] ?? '');
    $icona = trim($body['icona'] ?? '');
    $ordine = (int)($body['ordine'] ?? 0);

    if (!$id || !$nome) {
        json(['error' => 'Dati mancanti'], 400);
    }

    $stmt = $pdo->prepare("UPDATE categorie_preventivo SET nome = ?, icona = ?, ordine = ? WHERE id = ?");
    $stmt->execute([$nome, $icona ?: null, $ordine, $id]);
    json(['ok' => true]);
}

// DELETE — elimina categoria (cascade elimina preventivi)
if ($method === 'DELETE') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    if (!$id) {
        json(['error' => 'ID mancante'], 400);
    }
    $stmt = $pdo->prepare("DELETE FROM categorie_preventivo WHERE id = ?");
    $stmt->execute([$id]);
    json(['ok' => true]);
}
