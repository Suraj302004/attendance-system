<?php
require_once 'config.php';
header('Content-Type: application/json');
checkAuth('employee');

$action = $_GET['action'] ?? '';
$empId = $_SESSION['user_id'];

if ($action === 'punch') {
    $lat = floatval($_POST['latitude'] ?? 0);
    $lng = floatval($_POST['longitude'] ?? 0);
    $today = date('Y-m-d');
    $timeStr = date('H:i:s');

    // Fetch Company HQ Coordinates
    $compRes = $conn->query("SELECT * FROM company LIMIT 1");
    $company = $compRes->fetch_assoc();

    $distance = calculateHaversineDistance($lat, $lng, $company['latitude'], $company['longitude']);
    $isWithinRadius = ($distance <= $company['allowed_radius_meters']) ? 1 : 0;

    // Check existing punch for today
    $checkStmt = $conn->prepare("SELECT * FROM attendance WHERE employee_id = ? AND date = ?");
    $checkStmt->bind_param("ss", $empId, $today);
    $checkStmt->execute();
    $attRes = $checkStmt->get_result();

    if ($attRes->num_rows === 0) {
        // Punch In
        $insert = $conn->prepare("INSERT INTO attendance (employee_id, date, punch_in, latitude, longitude, distance_meters, is_within_radius) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $insert->bind_param("sssddii", $empId, $today, $timeStr, $lat, $lng, $distance, $isWithinRadius);
        $insert->execute();

        echo json_encode([
            'success' => true,
            'type' => 'punch_in',
            'message' => 'Punch In recorded successfully at ' . $timeStr,
            'distance' => $distance,
            'is_within' => (bool)$isWithinRadius
        ]);
        exit();
    } else {
        // Punch Out
        $row = $attRes->fetch_assoc();
        if ($row['punch_out'] !== null) {
            echo json_encode(['success' => false, 'message' => 'Already punched out for today']);
            exit();
        }

        // Calculate hours
        $inTime = strtotime($row['punch_in']);
        $outTime = strtotime($timeStr);
        $diffHours = round(($outTime - $inTime) / 3600, 2) . ' hrs';

        $update = $conn->prepare("UPDATE attendance SET punch_out = ?, working_hours = ? WHERE id = ?");
        $update->bind_param("ssi", $timeStr, $diffHours, $row['id']);
        $update->execute();

        echo json_encode([
            'success' => true,
            'type' => 'punch_out',
            'message' => 'Punch Out recorded successfully at ' . $timeStr,
            'hours' => $diffHours
        ]);
        exit();
    }
}
?>
