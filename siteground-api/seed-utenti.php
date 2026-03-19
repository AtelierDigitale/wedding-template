<?php
/**
 * Script per creare gli utenti di default.
 * Eseguire UNA VOLTA da browser: https://dominio/api-wedding-template/seed-utenti.php
 * Poi ELIMINARE il file dal server.
 */
require_once __DIR__ . '/db.php';

$pdo = getDb();

// Crea tabella se non esiste
$pdo->exec("CREATE TABLE IF NOT EXISTS utenti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  ruolo ENUM('sposi', 'planner') NOT NULL,
  nome VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$users = [
    [
        'username' => 'sposo',
        'password' => 'sposo123',
        'ruolo' => 'sposi',
        'nome' => 'Francesco',
    ],
    [
        'username' => 'sposa',
        'password' => 'sposa123',
        'ruolo' => 'sposi',
        'nome' => 'Marcella',
    ],
    [
        'username' => 'planner',
        'password' => 'planner123',
        'ruolo' => 'planner',
        'nome' => 'Wedding Planner',
    ],
];

$stmt = $pdo->prepare(
    "INSERT INTO utenti (username, password_hash, ruolo, nome) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), ruolo = VALUES(ruolo), nome = VALUES(nome)"
);

echo "<h2>Seed Utenti</h2>";
foreach ($users as $u) {
    $hash = password_hash($u['password'], PASSWORD_DEFAULT);
    $stmt->execute([$u['username'], $hash, $u['ruolo'], $u['nome']]);
    echo "<p>✅ {$u['username']} ({$u['ruolo']}) — password: {$u['password']}</p>";
}

echo "<hr><p><strong>IMPORTANTE: Elimina questo file dal server dopo l'uso!</strong></p>";
