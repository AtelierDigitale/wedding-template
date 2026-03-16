<?php
require_once __DIR__ . '/../db.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['foto'])) {
    json(['error' => 'Foto mancante'], 400);
}

$file = $_FILES['foto'];
$ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
$filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $filename)) {
    json(['error' => 'Upload fallito'], 500);
}

$pdo = getDb();
$stmt = $pdo->prepare("INSERT INTO foto (filename, nome_autore, commento) VALUES (?, ?, ?)");
$stmt->execute([
    $filename,
    $_POST['nome_autore'] ?? null,
    $_POST['commento'] ?? null,
]);

json(['ok' => true]);
