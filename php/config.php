<?php
/**
 * Database Configuration & Helper Utilities
 * PHP 8 / MySQLi Connection
 */

session_start();

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'attendance_db');

// Create MySQL connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check Connection
if ($conn->connect_error) {
    die("Database Connection Failed: " . $conn->connect_error);
}

// Set UTF-8
$conn->set_charset("utf8mb4");

/**
 * Haversine Formula in PHP to calculate distance in meters between two GPS coordinates
 */
function calculateHaversineDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371000; // Earth radius in meters

    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);

    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);

    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return round($earthRadius * $c);
}

/**
 * Check if User is Authenticated Session
 */
function checkAuth($requiredRole = null) {
    if (!isset($_SESSION['user_id'])) {
        header("Location: ../login.html");
        exit();
    }
    if ($requiredRole && $_SESSION['user_role'] !== $requiredRole) {
        die("Unauthorized Access");
    }
}
?>
