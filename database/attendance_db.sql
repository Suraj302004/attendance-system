-- ===================================================
-- Employee Attendance Management System Database Schema
-- Supported for MySQL / MariaDB (XAMPP Environment)
-- ===================================================

CREATE DATABASE IF NOT EXISTS `attendance_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `attendance_db`;

-- --------------------------------------------------------
-- Table Structure: Company Settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `company` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `allowed_radius_meters` INT DEFAULT 200,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Company Configuration
INSERT INTO `company` (`company_name`, `address`, `latitude`, `longitude`, `allowed_radius_meters`) VALUES
('Antigravity Technologies Corp.', 'Tech Park Tower A, Silicon Valley, CA', 18.52040000, 73.85670000, 200);

-- --------------------------------------------------------
-- Table Structure: Admins
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` VARCHAR(50) UNIQUE NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Admin Credentials (Password: Admin@123 hashed via password_hash)
INSERT INTO `admins` (`admin_id`, `full_name`, `email`, `password`) VALUES
('ADMIN001', 'Alexander Pierce', 'admin@antigravity.com', '$2y$10$e8w.xV8Bw7fC.uWvB6z20.E8R1s/4nSg/5E3tYvO7n9VbK0wXm2u6');

-- --------------------------------------------------------
-- Table Structure: Employees
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` VARCHAR(50) UNIQUE NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `designation` VARCHAR(50) NOT NULL,
  `joining_date` DATE NOT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Employee Accounts (Password: Emp@123)
INSERT INTO `employees` (`employee_id`, `full_name`, `email`, `phone`, `department`, `designation`, `joining_date`, `status`, `password`) VALUES
('EMP001', 'Sarah Connor', 'sarah.c@antigravity.com', '+1 800-555-0123', 'Engineering', 'Senior Frontend Engineer', '2023-06-10', 'Active', '$2y$10$q2U7F1wE9S8f.Y.uWvB6z20.E8R1s/4nSg/5E3tYvO7n9VbK0wXm2'),
('EMP002', 'Marcus Vance', 'marcus.v@antigravity.com', '+1 800-555-0144', 'Design', 'UI/UX Designer', '2024-02-01', 'Active', '$2y$10$q2U7F1wE9S8f.Y.uWvB6z20.E8R1s/4nSg/5E3tYvO7n9VbK0wXm2');

-- --------------------------------------------------------
-- Table Structure: Attendance Logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `punch_in` TIME NOT NULL,
  `punch_out` TIME DEFAULT NULL,
  `working_hours` VARCHAR(50) DEFAULT 'In Progress',
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `distance_meters` INT NOT NULL,
  `is_within_radius` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table Structure: Leave Requests
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `leave_type` VARCHAR(50) NOT NULL,
  `from_date` DATE NOT NULL,
  `to_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `admin_remark` TEXT DEFAULT NULL,
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table Structure: Audit Login Logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `login_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `login_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
