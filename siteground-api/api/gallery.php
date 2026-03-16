<?php
require_once __DIR__ . '/../db.php';
cors();

$pdo = getDb();
$stmt = $pdo->query("SELECT id, filename, nome_autore, commento, uploaded_at FROM foto ORDER BY uploaded_at DESC");
$foto = $stmt->fetchAll();

$result = array_map(function ($f) {
    return [
        'id' => (int)$f['id'],
        'url' => UPLOAD_URL . $f['filename'],
        'nome_autore' => $f['nome_autore'],
        'commento' => $f['commento'],
        'uploaded_at' => $f['uploaded_at'],
    ];
}, $foto);

json($result);
