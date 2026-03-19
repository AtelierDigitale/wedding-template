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

// GET — lista spese con dettagli categoria
if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT s.*, c.nome as categoria_nome
        FROM spese s
        LEFT JOIN categorie_preventivo c ON s.categoria_id = c.id
        ORDER BY s.created_at
    ");
    $spese = $stmt->fetchAll();

    // Calcola totali
    $totale = 0;
    $saldato = 0;
    $acconto = 0;
    $da_pagare = 0;
    foreach ($spese as $s) {
        $totale += (float)$s['importo'];
        if ($s['stato'] === 'saldato') $saldato += (float)$s['importo'];
        elseif ($s['stato'] === 'acconto') $acconto += (float)$s['importo'];
        else $da_pagare += (float)$s['importo'];
    }

    json([
        'spese' => $spese,
        'totali' => [
            'totale' => $totale,
            'saldato' => $saldato,
            'acconto' => $acconto,
            'da_pagare' => $da_pagare,
        ],
    ]);
}

// POST — crea spesa manuale (solo sposi)
if ($method === 'POST') {
    $body = jsonBody();
    $descrizione = trim($body['descrizione'] ?? '');
    $importo = $body['importo'] ?? null;
    $categoriaId = $body['categoria_id'] ?? null;
    $nota = trim($body['nota'] ?? '');

    if (!$descrizione || $importo === null) {
        json(['error' => 'Dati mancanti'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO spese (categoria_id, descrizione, importo, nota, manuale) VALUES (?, ?, ?, ?, 1)");
    $stmt->execute([$categoriaId, $descrizione, (float)$importo, $nota ?: null]);

    json(['id' => (int)$pdo->lastInsertId(), 'ok' => true]);
}

// PUT — aggiorna stato spesa
if ($method === 'PUT') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    $stato = $body['stato'] ?? null;

    if (!$id || !in_array($stato, ['da_pagare', 'acconto', 'saldato'])) {
        json(['error' => 'Dati mancanti o stato non valido'], 400);
    }

    $stmt = $pdo->prepare("UPDATE spese SET stato = ? WHERE id = ?");
    $stmt->execute([$stato, $id]);
    json(['ok' => true]);
}

// DELETE — elimina spesa manuale
if ($method === 'DELETE') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    if (!$id) {
        json(['error' => 'ID mancante'], 400);
    }

    // Solo spese manuali possono essere eliminate direttamente
    $stmt = $pdo->prepare("SELECT manuale FROM spese WHERE id = ?");
    $stmt->execute([$id]);
    $spesa = $stmt->fetch();

    if (!$spesa) {
        json(['error' => 'Spesa non trovata'], 404);
    }

    if (!$spesa['manuale']) {
        json(['error' => 'Le spese da preventivo si eliminano dalla sezione preventivi'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM spese WHERE id = ?");
    $stmt->execute([$id]);
    json(['ok' => true]);
}
