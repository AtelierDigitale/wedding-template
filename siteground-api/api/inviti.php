<?php
require_once __DIR__ . '/../db.php';
cors();

if (!auth()) {
    json(['error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDb();

if ($method === 'GET') {
    // Dettaglio singolo invito
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $stmt = $pdo->prepare("SELECT * FROM inviti WHERE id = ?");
        $stmt->execute([$id]);
        $invito = $stmt->fetch();
        if (!$invito) {
            json(['error' => 'Non trovato'], 404);
        }
        $stmt = $pdo->prepare("SELECT id, nome, genere, confermato FROM invitati WHERE invito_id = ?");
        $stmt->execute([$id]);
        $invitati = $stmt->fetchAll();
        json(['invito' => $invito, 'invitati' => $invitati]);
    }

    // Statistiche
    if (isset($_GET['stats']) && $_GET['stats'] === '1') {
        $stmt = $pdo->query("
            SELECT
                (SELECT COUNT(*) FROM inviti) as totale_inviti,
                (SELECT COUNT(*) FROM invitati) as totale_invitati,
                (SELECT COUNT(*) FROM invitati WHERE confermato = 1) as confermati,
                (SELECT COUNT(*) FROM invitati WHERE confermato = 0) as rifiutati,
                (SELECT COUNT(*) FROM invitati WHERE confermato IS NULL) as in_attesa
        ");
        $totals = $stmt->fetch();

        $stmt = $pdo->query("
            SELECT g.id, g.nome,
                (SELECT COUNT(*) FROM inviti WHERE gruppo_id = g.id) as totale_inviti,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id) as totale_invitati,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 1) as confermati,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 0) as rifiutati,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato IS NULL) as in_attesa
            FROM gruppi g ORDER BY g.nome
        ");
        $perGruppo = $stmt->fetchAll();

        $stmt = $pdo->query("
            SELECT
                (SELECT COUNT(*) FROM inviti WHERE gruppo_id IS NULL) as totale_inviti,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL) as totale_invitati,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL AND inv.confermato = 1) as confermati,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL AND inv.confermato = 0) as rifiutati,
                (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL AND inv.confermato IS NULL) as in_attesa
        ");
        $senzaGruppo = $stmt->fetch();

        $totals['per_gruppo'] = $perGruppo;
        $totals['senza_gruppo'] = $senzaGruppo;
        json($totals);
    }

    // Lista invitati
    if (isset($_GET['invitati']) && $_GET['invitati'] === '1') {
        $stmt = $pdo->query("
            SELECT inv.id, inv.nome, inv.genere, inv.confermato, inv.confirmed_at, i.nome_gruppo, g.nome as gruppo
            FROM invitati inv
            JOIN inviti i ON inv.invito_id = i.id
            LEFT JOIN gruppi g ON i.gruppo_id = g.id
            ORDER BY g.nome, i.nome_gruppo, inv.nome
        ");
        json($stmt->fetchAll());
    }

    // Lista inviti
    $stmt = $pdo->query("
        SELECT i.*, g.nome as gruppo_nome,
            (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id) as totale_invitati,
            (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id AND confermato = 1) as confermati,
            (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id AND confermato = 0) as rifiutati,
            (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id AND confermato IS NULL) as in_attesa
        FROM inviti i
        LEFT JOIN gruppi g ON i.gruppo_id = g.id
        ORDER BY g.nome, i.created_at DESC
    ");
    json($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = jsonBody();
    $nome_gruppo = $body['nome_gruppo'] ?? '';
    $gruppo_id = $body['gruppo_id'] ?? null;
    $invitati = $body['invitati'] ?? [];
    $note = $body['note'] ?? null;

    if (!$nome_gruppo || empty($invitati)) {
        json(['error' => 'Dati mancanti'], 400);
    }

    $token = bin2hex(random_bytes(16));

    $pdo->beginTransaction();
    $stmt = $pdo->prepare("INSERT INTO inviti (token, nome_gruppo, gruppo_id, note) VALUES (?, ?, ?, ?)");
    $stmt->execute([$token, $nome_gruppo, $gruppo_id, $note]);
    $invito_id = $pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO invitati (invito_id, nome, genere) VALUES (?, ?, ?)");
    foreach ($invitati as $inv) {
        if (is_string($inv)) {
            $nome = trim($inv);
            $genere = 'M';
        } else {
            $nome = trim($inv['nome'] ?? '');
            $genere = $inv['genere'] ?? 'M';
        }
        if ($nome) {
            $stmt->execute([$invito_id, $nome, $genere]);
        }
    }
    $pdo->commit();

    json(['id' => (int)$invito_id, 'token' => $token]);
}

if ($method === 'PUT') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    $nome_gruppo = $body['nome_gruppo'] ?? '';
    $gruppo_id = $body['gruppo_id'] ?? null;
    $invitati = $body['invitati'] ?? [];
    $note = $body['note'] ?? null;

    if (!$id || !$nome_gruppo || empty($invitati)) {
        json(['error' => 'Dati mancanti'], 400);
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("UPDATE inviti SET nome_gruppo = ?, gruppo_id = ?, note = ? WHERE id = ?");
    $stmt->execute([$nome_gruppo, $gruppo_id, $note, $id]);

    $stmt = $pdo->prepare("SELECT id FROM invitati WHERE invito_id = ?");
    $stmt->execute([$id]);
    $existingIds = array_column($stmt->fetchAll(), 'id');

    $keptIds = [];
    foreach ($invitati as $inv) {
        $nome = trim($inv['nome'] ?? '');
        $genere = $inv['genere'] ?? 'M';
        if (!$nome) continue;

        if (!empty($inv['id'])) {
            $stmt = $pdo->prepare("UPDATE invitati SET nome = ?, genere = ? WHERE id = ? AND invito_id = ?");
            $stmt->execute([$nome, $genere, $inv['id'], $id]);
            $keptIds[] = (int)$inv['id'];
        } else {
            $stmt = $pdo->prepare("INSERT INTO invitati (invito_id, nome, genere) VALUES (?, ?, ?)");
            $stmt->execute([$id, $nome, $genere]);
        }
    }

    $toDelete = array_diff($existingIds, $keptIds);
    if (!empty($toDelete)) {
        $placeholders = implode(',', array_fill(0, count($toDelete), '?'));
        $stmt = $pdo->prepare("DELETE FROM invitati WHERE id IN ($placeholders)");
        $stmt->execute(array_values($toDelete));
    }

    $pdo->commit();
    json(['ok' => true]);
}

if ($method === 'DELETE') {
    $body = jsonBody();
    $id = $body['id'] ?? null;

    if (!$id) {
        json(['error' => 'ID mancante'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM inviti WHERE id = ?");
    $stmt->execute([$id]);
    json(['ok' => true]);
}
