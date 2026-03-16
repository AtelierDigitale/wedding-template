<?php
require_once __DIR__ . '/../db.php';
cors();

if (!auth()) {
    json(['error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDb();

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT g.*,
            (SELECT COUNT(*) FROM inviti WHERE gruppo_id = g.id) as totale_inviti,
            (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id) as totale_invitati,
            (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 1) as confermati,
            (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 0) as rifiutati,
            (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato IS NULL) as in_attesa
        FROM gruppi g
        ORDER BY g.nome
    ");
    json($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = jsonBody();
    $nome = trim($body['nome'] ?? '');

    if (!$nome) {
        json(['error' => 'Nome mancante'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO gruppi (nome) VALUES (?)");
    $stmt->execute([$nome]);

    json(['id' => (int)$pdo->lastInsertId(), 'nome' => $nome]);
}

if ($method === 'PUT') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    $nome = trim($body['nome'] ?? '');

    if (!$id || !$nome) {
        json(['error' => 'Dati mancanti'], 400);
    }

    $stmt = $pdo->prepare("UPDATE gruppi SET nome = ? WHERE id = ?");
    $stmt->execute([$nome, $id]);

    json(['ok' => true]);
}

if ($method === 'DELETE') {
    $body = jsonBody();
    $id = $body['id'] ?? null;

    if (!$id) {
        json(['error' => 'ID mancante'], 400);
    }

    $stmt = $pdo->prepare("UPDATE inviti SET gruppo_id = NULL WHERE gruppo_id = ?");
    $stmt->execute([$id]);

    $stmt = $pdo->prepare("DELETE FROM gruppi WHERE id = ?");
    $stmt->execute([$id]);

    json(['ok' => true]);
}
