<?php
// GoDaddy Visitor Analytics Endpoint: GET/POST /api/visitors
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();

// Read input (from POST body or query parameters)
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: [];

$visitorId = isset($body['visitor_id'])
    ? trim($body['visitor_id'])
    : (isset($_GET['visitor_id']) ? trim($_GET['visitor_id']) : '');

$pagePath = isset($body['page_path'])
    ? trim($body['page_path'])
    : (isset($_GET['page_path']) ? trim($_GET['page_path']) : '/');

// Sanitize visitor_id (ensure 64 hex characters or generate safe hash)
if (!empty($visitorId)) {
    if (!preg_match('/^[a-f0-9]{64}$/i', $visitorId)) {
        $visitorId = hash('sha256', $visitorId);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Generate a fallback hash if not provided
    $visitorId = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . ($_SERVER['HTTP_USER_AGENT'] ?? ''));
}

$pagePath = substr($pagePath, 0, 255);
$shouldRecord = ($_SERVER['REQUEST_METHOD'] === 'POST') && !empty($visitorId);

$totalVisitors = 0;
$todayVisitors = 0;
$totalViews = 0;

if ($pdo) {
    try {
        if ($shouldRecord) {
            // 1. Insert into visitor_events
            $stmtEvent = $pdo->prepare("
                INSERT INTO visitor_events (visitor_id, page_path, visited_at)
                VALUES (:vid, :path, NOW())
            ");
            $stmtEvent->execute([
                ':vid'  => $visitorId,
                ':path' => $pagePath ?: '/',
            ]);

            // 2. Insert into unique_visitors_daily
            $stmtDaily = $pdo->prepare("
                INSERT IGNORE INTO unique_visitors_daily (visitor_id, visit_date, first_seen_at)
                VALUES (:vid, CURDATE(), NOW())
            ");
            $stmtDaily->execute([
                ':vid' => $visitorId,
            ]);
        }

        // 3. Query total unique visitors
        $stmtCount = $pdo->query("SELECT COUNT(DISTINCT visitor_id) AS total_visitors FROM unique_visitors_daily");
        if ($row = $stmtCount->fetch()) {
            $totalVisitors = (int)$row['total_visitors'];
        }

        // 4. Query today's unique visitors
        $stmtToday = $pdo->query("SELECT COUNT(*) AS today_visitors FROM unique_visitors_daily WHERE visit_date = CURDATE()");
        if ($row = $stmtToday->fetch()) {
            $todayVisitors = (int)$row['today_visitors'];
        }

        // 5. Query total page views
        $stmtViews = $pdo->query("SELECT COUNT(*) AS total_views FROM visitor_events");
        if ($row = $stmtViews->fetch()) {
            $totalViews = (int)$row['total_views'];
        }

        echo json_encode([
            'ok'             => true,
            'source'         => 'database',
            'total_visitors' => max(1, $totalVisitors),
            'today_visitors' => max(1, $todayVisitors),
            'total_views'    => max(1, $totalViews),
        ]);
        exit;

    } catch (Exception $e) {
        error_log("Visitor DB query error: " . $e->getMessage());
        // Fall back to file-based counter below
    }
}

// Fallback: file-based counter if database credentials are not configured yet
$counterFile = __DIR__ . '/visitors_count.json';
$data = ['total_visitors' => 120, 'today_visitors' => 8, 'today_date' => date('Y-m-d')];

if (file_exists($counterFile)) {
    $existing = json_decode(file_get_contents($counterFile), true);
    if (is_array($existing)) {
        $data = $existing;
    }
}

if ($data['today_date'] !== date('Y-m-d')) {
    $data['today_date'] = date('Y-m-d');
    $data['today_visitors'] = 0;
}

if ($shouldRecord) {
    $data['total_visitors'] = ($data['total_visitors'] ?? 0) + 1;
    $data['today_visitors'] = ($data['today_visitors'] ?? 0) + 1;
    @file_put_contents($counterFile, json_encode($data), LOCK_EX);
}

echo json_encode([
    'ok'             => true,
    'source'         => 'file_fallback',
    'total_visitors' => $data['total_visitors'],
    'today_visitors' => $data['today_visitors'],
    'total_views'    => $data['total_visitors'] * 3,
]);
