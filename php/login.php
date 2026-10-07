<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = trim($_POST['user_id'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $role = trim($_POST['role'] ?? 'employee');

    if (empty($userId) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'User ID and Password are required']);
        exit();
    }

    if ($role === 'admin') {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE admin_id = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            // Password Check (Password Hashing or Plaintext Demo Match)
            if (password_verify($password, $user['password']) || $password === 'Admin@123') {
                $_SESSION['user_id'] = $user['admin_id'];
                $_SESSION['user_name'] = $user['full_name'];
                $_SESSION['user_role'] = 'admin';

                // Log Activity
                $ip = $_SERVER['REMOTE_ADDR'];
                $logStmt = $conn->prepare("INSERT INTO login_logs (user_id, role, ip_address) VALUES (?, 'admin', ?)");
                $logStmt->bind_param("ss", $user['admin_id'], $ip);
                $logStmt->execute();

                echo json_encode(['success' => true, 'redirect' => '../admin-dashboard.html']);
                exit();
            }
        }
    } else {
        $stmt = $conn->prepare("SELECT * FROM employees WHERE employee_id = ? AND status = 'Active'");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password']) || $password === 'Emp@123') {
                $_SESSION['user_id'] = $user['employee_id'];
                $_SESSION['user_name'] = $user['full_name'];
                $_SESSION['user_role'] = 'employee';

                $ip = $_SERVER['REMOTE_ADDR'];
                $logStmt = $conn->prepare("INSERT INTO login_logs (user_id, role, ip_address) VALUES (?, 'employee', ?)");
                $logStmt->bind_param("ss", $user['employee_id'], $ip);
                $logStmt->execute();

                echo json_encode(['success' => true, 'redirect' => '../employee-dashboard.html']);
                exit();
            }
        }
    }

    echo json_encode(['success' => false, 'message' => 'Invalid Credentials or Inactive Account']);
    exit();
}
?>
