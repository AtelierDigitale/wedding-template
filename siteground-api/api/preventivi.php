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

// GET — lista preventivi (opzionale: ?categoria_id=X)
if ($method === 'GET') {
    $categoriaId = $_GET['categoria_id'] ?? null;

    if ($categoriaId) {
        $stmt = $pdo->prepare("
            SELECT p.*, u.nome as created_by_nome, u.ruolo as created_by_ruolo
            FROM preventivi p
            LEFT JOIN utenti u ON p.created_by = u.id
            WHERE p.categoria_id = ?
            ORDER BY p.created_at
        ");
        $stmt->execute([$categoriaId]);
    } else {
        $stmt = $pdo->query("
            SELECT p.*, u.nome as created_by_nome, u.ruolo as created_by_ruolo,
                   c.nome as categoria_nome
            FROM preventivi p
            LEFT JOIN utenti u ON p.created_by = u.id
            LEFT JOIN categorie_preventivo c ON p.categoria_id = c.id
            ORDER BY p.categoria_id, p.created_at
        ");
    }

    $preventivi = $stmt->fetchAll();

    // Attach allegati
    foreach ($preventivi as &$p) {
        $stmtA = $pdo->prepare("SELECT * FROM preventivi_allegati WHERE preventivo_id = ? ORDER BY uploaded_at");
        $stmtA->execute([$p['id']]);
        $p['allegati'] = $stmtA->fetchAll();
    }

    json($preventivi);
}

// POST — crea preventivo
if ($method === 'POST') {
    $body = jsonBody();
    $categoriaId = $body['categoria_id'] ?? null;
    $fornitore = trim($body['fornitore'] ?? '');
    $descrizione = trim($body['descrizione'] ?? '');
    $prezzo = $body['prezzo'] ?? null;
    $note = trim($body['note'] ?? '');
    $createdBy = $body['created_by'] ?? null;

    if (!$categoriaId || !$fornitore || $prezzo === null) {
        json(['error' => 'Dati mancanti (categoria_id, fornitore, prezzo)'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO preventivi (categoria_id, fornitore, descrizione, prezzo, note, created_by) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$categoriaId, $fornitore, $descrizione ?: null, (float)$prezzo, $note ?: null, $createdBy]);

    json([
        'id' => (int)$pdo->lastInsertId(),
        'categoria_id' => (int)$categoriaId,
        'fornitore' => $fornitore,
        'prezzo' => (float)$prezzo,
    ]);
}

// PUT — aggiorna preventivo o segna come scelto
if ($method === 'PUT') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    $action = $body['action'] ?? 'update';

    if (!$id) {
        json(['error' => 'ID mancante'], 400);
    }

    // Azione: scegli preventivo
    if ($action === 'scegli') {
        // Get the preventivo to find its category
        $stmt = $pdo->prepare("SELECT categoria_id, fornitore, prezzo FROM preventivi WHERE id = ?");
        $stmt->execute([$id]);
        $prev = $stmt->fetch();

        if (!$prev) {
            json(['error' => 'Preventivo non trovato'], 404);
        }

        // Deselect all others in same category
        $stmt = $pdo->prepare("UPDATE preventivi SET scelto = 0 WHERE categoria_id = ?");
        $stmt->execute([$prev['categoria_id']]);

        // Select this one
        $stmt = $pdo->prepare("UPDATE preventivi SET scelto = 1 WHERE id = ?");
        $stmt->execute([$id]);

        // Create or update spesa
        $stmt = $pdo->prepare("SELECT id FROM spese WHERE preventivo_id = ?");
        $stmt->execute([$id]);
        $existingSpesa = $stmt->fetch();

        if ($existingSpesa) {
            $stmt = $pdo->prepare("UPDATE spese SET descrizione = ?, importo = ?, categoria_id = ? WHERE id = ?");
            $stmt->execute([$prev['fornitore'], $prev['prezzo'], $prev['categoria_id'], $existingSpesa['id']]);
        } else {
            // Remove old spesa for this category (if any non-manual one)
            $stmt = $pdo->prepare("DELETE FROM spese WHERE categoria_id = ? AND manuale = 0");
            $stmt->execute([$prev['categoria_id']]);

            // Create new spesa
            $stmt = $pdo->prepare("INSERT INTO spese (categoria_id, preventivo_id, descrizione, importo, manuale) VALUES (?, ?, ?, ?, 0)");
            $stmt->execute([$prev['categoria_id'], $id, $prev['fornitore'], $prev['prezzo']]);
        }

        json(['ok' => true, 'spesa_created' => true]);
    }

    // Azione: descegli preventivo
    if ($action === 'descegli') {
        $stmt = $pdo->prepare("UPDATE preventivi SET scelto = 0 WHERE id = ?");
        $stmt->execute([$id]);

        // Remove associated spesa
        $stmt = $pdo->prepare("DELETE FROM spese WHERE preventivo_id = ?");
        $stmt->execute([$id]);

        json(['ok' => true]);
    }

    // Azione: update campi
    $fornitore = trim($body['fornitore'] ?? '');
    $descrizione = trim($body['descrizione'] ?? '');
    $prezzo = $body['prezzo'] ?? null;
    $note = trim($body['note'] ?? '');

    if (!$fornitore || $prezzo === null) {
        json(['error' => 'Dati mancanti'], 400);
    }

    $stmt = $pdo->prepare("UPDATE preventivi SET fornitore = ?, descrizione = ?, prezzo = ?, note = ? WHERE id = ?");
    $stmt->execute([$fornitore, $descrizione ?: null, (float)$prezzo, $note ?: null, $id]);

    // If this preventivo is scelto, update the spesa too
    $stmt = $pdo->prepare("SELECT scelto, categoria_id FROM preventivi WHERE id = ?");
    $stmt->execute([$id]);
    $prev = $stmt->fetch();
    if ($prev && $prev['scelto']) {
        $stmt = $pdo->prepare("UPDATE spese SET descrizione = ?, importo = ? WHERE preventivo_id = ?");
        $stmt->execute([$fornitore, (float)$prezzo, $id]);
    }

    json(['ok' => true]);
}

// DELETE — elimina preventivo
if ($method === 'DELETE') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    if (!$id) {
        json(['error' => 'ID mancante'], 400);
    }

    // Remove associated spesa
    $stmt = $pdo->prepare("DELETE FROM spese WHERE preventivo_id = ?");
    $stmt->execute([$id]);

    // Delete preventivo (cascade deletes allegati)
    $stmt = $pdo->prepare("DELETE FROM preventivi WHERE id = ?");
    $stmt->execute([$id]);
    json(['ok' => true]);
}
