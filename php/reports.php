<?php
require_once 'config.php';
checkAuth('admin');

if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=Attendance_Summary_' . date('Y-m-d') . '.csv');

    $output = fopen('php://output', 'w');
    fputcsv($output, ['Date', 'Employee ID', 'Employee Name', 'Punch In', 'Punch Out', 'Hours', 'Latitude', 'Longitude', 'Distance (m)', 'Within Geofence']);

    $query = "SELECT a.*, e.full_name FROM attendance a JOIN employees e ON a.employee_id = e.employee_id ORDER BY a.date DESC";
    $result = $conn->query($query);

    while ($row = $result->fetch_assoc()) {
        fputcsv($output, [
            $row['date'],
            $row['employee_id'],
            $row['full_name'],
            $row['punch_in'],
            $row['punch_out'] ?? 'Active',
            $row['working_hours'],
            $row['latitude'],
            $row['longitude'],
            $row['distance_meters'],
            $row['is_within_radius'] ? 'Yes' : 'No'
        ]);
    }
    fclose($output);
    exit();
}
?>
