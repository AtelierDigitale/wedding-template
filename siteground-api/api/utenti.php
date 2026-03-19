<?php
require_once __DIR__ . '/../db.php';
cors();

header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDb();

// POST /api/utenti.php?action=login — Login (public)
// POST /api/utenti.php — Create user (auth required)
// GET /api/utenti.php — List users (auth required)
// DELETE /api/utenti.php — Delete user (auth required)

$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $body = jsonBody();
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';

    if (!$username || !$password) {
        json(['error' => 'Credenziali mancanti'], 400);
    }

    $stmt = $pdo->prepare("SELECT id, username, password_hash, ruolo, nome FROM utenti WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        json(['error' => 'Credenziali non valide'], 401);
    }

    json([
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'ruolo' => $user['ruolo'],
        'nome' => $user['nome'],
    ]);
}

// All other actions require auth
if (!auth()) {
    json(['error' => 'Unauthorized'], 401);
}

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, username, ruolo, nome, created_at FROM utenti ORDER BY created_at");
    json($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = jsonBody();
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';
    $ruolo = $body['ruolo'] ?? '';
    $nome = trim($body['nome'] ?? '');

    if (!$username || !$password || !in_array($ruolo, ['sposi', 'planner'])) {
        json(['error' => 'Dati mancanti o ruolo non valido'], 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO utenti (username, password_hash, ruolo, nome) VALUES (?, ?, ?, ?)");
    try {
        $stmt->execute([$username, $hash, $ruolo, $nome ?: null]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            json(['error' => 'Username già esistente'], 409);
        }
        throw $e;
    }

    json([
        'id' => (int)$pdo->lastInsertId(),
        'username' => $username,
        'ruolo' => $ruolo,
        'nome' => $nome,
    ]);
}

if ($method === 'DELETE') {
    $body = jsonBody();
    $id = $body['id'] ?? null;
    if (!$id) {
        json(['error' => 'ID mancante'], 400);
    }
    $stmt = $pdo->prepare("DELETE FROM utenti WHERE id = ?");
    $stmt->execute([$id]);
    json(['ok' => true]);
}
