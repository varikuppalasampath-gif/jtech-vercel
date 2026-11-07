<?php
// GoDaddy cPanel PHP API handler: POST /api/enquiry
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Read JSON input
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

// Honeypot check for bots
if (!empty($data['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

// Validate input fields
$name    = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$company = isset($data['company']) ? trim(strip_tags($data['company'])) : '';
$email   = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone   = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$topic   = isset($data['topic']) ? trim(strip_tags($data['topic'])) : 'General';
$message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';

if (strlen($name) < 2) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please enter your full name.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($message) < 10) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Message must be at least 10 characters.']);
    exit;
}

// Construct email
$to = 'info@jtech-ai.com';
$subject = "Website enquiry: {$topic} - {$name}";

$body = "New Enquiry from Jtech Website\n\n"
      . "Name: {$name}\n"
      . "Company: " . ($company ?: 'Not specified') . "\n"
      . "Email: {$email}\n"
      . "Phone: " . ($phone ?: 'Not specified') . "\n"
      . "Interest: {$topic}\n\n"
      . "Project Details:\n{$message}\n\n"
      . "---\nSubmitted on: " . date('Y-m-d H:i:s T') . "\n"
      . "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown');

$headers = [];
$headers[] = 'From: Jtech Website <info@jtech-ai.com>';
$headers[] = "Reply-To: {$name} <{$email}>";
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

// Send email using PHP mail() (native on GoDaddy cPanel)
$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    // If mail() returned false, write backup to a local file
    @file_put_contents(
        __DIR__ . '/enquiries_backup.jsonl',
        json_encode([
            'date' => date('c'),
            'name' => $name,
            'company' => $company,
            'email' => $email,
            'phone' => $phone,
            'topic' => $topic,
            'message' => $message,
        ]) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );

    // Return success or friendly message
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Could not send enquiry through server. Please contact info@jtech-ai.com.',
    ]);
}
