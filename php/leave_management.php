<?php
require_once 'config.php';
header('Content-Type: application/json');
checkAuth();

$action = $_GET['action'] ?? '';

if ($action === 'apply' && $_SESSION['user_role'] === 'employee') {
    $empId = $_SESSION['user_id'];
    $leaveType = trim($_POST['leave_type'] ?? '');
    $fromDate = trim($_POST['from_date'] ?? '');
    $toDate = trim($_POST['to_date'] ?? '');
    $reason = trim($_POST['reason'] ?? '');

    $stmt = $conn->prepare("INSERT INTO leave_requests (employee_id, leave_type, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?, 'Pending')");
    $stmt->bind_param("sssss", $empId, $leaveType, $fromDate, $toDate, $reason);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Leave application submitted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error submitting application']);
    }
    exit();
}

if ($action === 'update_status' && $_SESSION['user_role'] === 'admin') {
    $leaveId = intval($_POST['leave_id'] ?? 0);
    $status = trim($_POST['status'] ?? '');
    $remark = trim($_POST['admin_remark'] ?? '');

    if (in_array($status, ['Approved', 'Rejected'])) {
        $stmt = $conn->prepare("UPDATE leave_requests SET status = ?, admin_remark = ? WHERE id = ?");
        $stmt->bind_param("ssi", $status, $remark, $leaveId);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Leave request updated to ' . $status]);
        exit();
    }
}
?>
