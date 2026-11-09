<?php
// Database configuration for GoDaddy MySQL
// Set your GoDaddy MySQL database credentials below or via environment variables

$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'jtech_visitor_analytics';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

function getDbConnection() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";
        $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_SILENT,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}
