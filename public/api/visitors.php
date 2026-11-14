<?php
// GoDaddy Visitor Analytics Endpoint: GET/POST /api/visitors
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

date_default_timezone_set('Asia/Kolkata');

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
$totalVisitorDays = 0;
$totalPageViews = 0;
$todayVisitors = 0;
$dailyStats = [];

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

        // 1. Total Visitors (Lifetime): COUNT(DISTINCT visitor_id)
        $stmtCount = $pdo->query("SELECT COUNT(DISTINCT visitor_id) AS total_visitors FROM unique_visitors_daily");
        if ($row = $stmtCount->fetch()) {
            $totalVisitors = (int)$row['total_visitors'];
        }

        // 2. Total Unique Visitor-Days: COUNT(*)
        $stmtVisitorDays = $pdo->query("SELECT COUNT(*) AS total_visitor_days FROM unique_visitors_daily");
        if ($row = $stmtVisitorDays->fetch()) {
            $totalVisitorDays = (int)$row['total_visitor_days'];
        }

        // 3. Total Page Views: COUNT(*)
        $stmtViews = $pdo->query("SELECT COUNT(*) AS total_page_views FROM visitor_events");
        if ($row = $stmtViews->fetch()) {
            $totalPageViews = (int)$row['total_page_views'];
        }

        // 4. Today's Unique Visitors: COUNT(DISTINCT visitor_id) WHERE visit_date = CURDATE()
        $stmtToday = $pdo->query("SELECT COUNT(DISTINCT visitor_id) AS today_visitors FROM unique_visitors_daily WHERE visit_date = CURDATE()");
        if ($row = $stmtToday->fetch()) {
            $todayVisitors = (int)$row['today_visitors'];
        }

        // 5. Daily Visitor Statistics
        $stmtDailyStats = $pdo->query("
            SELECT DATE_FORMAT(visit_date, '%Y-%m-%d') AS visit_date, COUNT(DISTINCT visitor_id) AS visitors
            FROM unique_visitors_daily
            GROUP BY visit_date
            ORDER BY visit_date ASC
        ");
        while ($row = $stmtDailyStats->fetch()) {
            $dailyStats[] = [
                'visit_date' => (string)$row['visit_date'],
                'visitors'   => (int)$row['visitors']
            ];
        }

        echo json_encode([
            'ok'                 => true,
            'source'             => 'database',
            'total_visitors'     => max(1, $totalVisitors),
            'total_visitor_days' => max(1, $totalVisitorDays),
            'total_page_views'   => max(1, $totalPageViews),
            'total_views'        => max(1, $totalPageViews), // backward compatibility
            'today_visitors'     => max(1, $todayVisitors),
            'daily_stats'        => $dailyStats,
        ]);
        exit;

    } catch (Exception $e) {
        error_log("Visitor DB query error: " . $e->getMessage());
        // Fall back to file-based counter below
    }
}

// Fallback: file-based counter if database credentials are not configured yet
$counterFile = __DIR__ . '/visitors_count.json';
$data = [
    'total_visitors'     => 126,
    'total_visitor_days' => 264,
    'total_page_views'   => 272,
    'today_visitors'     => 17,
    'today_date'         => date('Y-m-d'),
    'daily_stats'        => []
];

if (file_exists($counterFile)) {
    $existing = json_decode(file_get_contents($counterFile), true);
    if (is_array($existing)) {
        $data = array_merge($data, $existing);
    }
}

if ($data['today_date'] !== date('Y-m-d')) {
    $data['today_date'] = date('Y-m-d');
    $data['today_visitors'] = 0;
}

if ($shouldRecord) {
    $data['total_visitors'] = ($data['total_visitors'] ?? 0) + 1;
    $data['total_visitor_days'] = ($data['total_visitor_days'] ?? 0) + 1;
    $data['total_page_views'] = ($data['total_page_views'] ?? 0) + 1;
    $data['today_visitors'] = ($data['today_visitors'] ?? 0) + 1;
    @file_put_contents($counterFile, json_encode($data), LOCK_EX);
}

echo json_encode([
    'ok'                 => true,
    'source'             => 'file_fallback',
    'total_visitors'     => $data['total_visitors'],
    'total_visitor_days' => $data['total_visitor_days'] ?? $data['total_visitors'],
    'total_page_views'   => $data['total_page_views'] ?? ($data['total_visitors'] * 3),
    'total_views'        => $data['total_page_views'] ?? ($data['total_visitors'] * 3),
    'today_visitors'     => $data['today_visitors'],
    'daily_stats'        => $data['daily_stats'] ?? [],
]);
