/**
 * Employee Attendance Management System Engine
 * Fully Functional State Manager, Geolocation Punch Engine,
 * Precise Time Calculator, Haversine Distance Formula, Leave Manager, CRUD, & Exporter.
 */

const STORAGE_KEYS = {
    EMPLOYEES: 'eas_employees',
    ATTENDANCE: 'eas_attendance',
    LEAVES: 'eas_leaves',
    COMPANY: 'eas_company',
    AUTH: 'eas_current_user'
};

// Initial Seed Data for Instant Out-of-the-Box Functionality
const DEFAULT_COMPANY = {
    name: 'Antigravity Technologies Corp.',
    address: 'Tech Park Tower A, Silicon Valley, CA',
    latitude: 18.5204, // Default HQ Coordinates
    longitude: 73.8567,
    allowedRadius: 200 // meters
};

const DEFAULT_EMPLOYEES = [
    {
        id: 'ADMIN001',
        name: 'Alexander Pierce (Admin)',
        email: 'admin@antigravity.com',
        phone: '+1 800-555-0199',
        role: 'admin',
        department: 'Management',
        designation: 'System Administrator',
        joiningDate: '2023-01-15',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        passwordHash: 'Admin@123'
    },
    {
        id: 'EMP001',
        name: 'Sarah Connor',
        email: 'sarah.c@antigravity.com',
        phone: '+1 800-555-0123',
        role: 'employee',
        department: 'Engineering',
        designation: 'Senior Frontend Engineer',
        joiningDate: '2023-06-10',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        passwordHash: 'Emp@123'
    },
    {
        id: 'EMP002',
        name: 'Marcus Vance',
        email: 'marcus.v@antigravity.com',
        phone: '+1 800-555-0144',
        role: 'employee',
        department: 'Design',
        designation: 'UI/UX Designer',
        joiningDate: '2024-02-01',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        passwordHash: 'Emp@123'
    }
];

const DEFAULT_ATTENDANCE = [
    {
        id: 'att_101',
        date: new Date().toISOString().split('T')[0],
        employeeId: 'EMP001',
        employeeName: 'Sarah Connor',
        punchIn: '09:05:12 AM',
        punchOut: '05:30:45 PM',
        hours: '8 hrs 25 mins',
        lat: 18.5206,
        lng: 73.8569,
        distance: 30
    },
    {
        id: 'att_102',
        date: new Date().toISOString().split('T')[0],
        employeeId: 'EMP002',
        employeeName: 'Marcus Vance',
        punchIn: '09:15:00 AM',
        punchOut: null,
        hours: 'In Progress',
        lat: 18.5208,
        lng: 73.8571,
        distance: 55
    }
];

const DEFAULT_LEAVES = [
    {
        id: 'l_201',
        appliedOn: new Date().toISOString().split('T')[0],
        employeeId: 'EMP001',
        employeeName: 'Sarah Connor',
        leaveType: 'Casual Leave',
        fromDate: '2026-08-05',
        toDate: '2026-08-06',
        reason: 'Personal family event',
        status: 'Pending'
    }
];

// Helper: Haversine Formula for Distance Calculation (meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// Helper: Time Duration Difference Calculator
function calculateTimeDuration(startTimeStr, endTimeStr) {
    try {
        const parseTime = (str) => {
            const date = new Date();
            const [time, modifier] = str.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours, 10);
            minutes = parseInt(minutes, 10);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            date.setHours(hours, minutes, 0, 0);
            return date;
        };

        const start = parseTime(startTimeStr);
        const end = parseTime(endTimeStr);
        let diffMs = end - start;
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Next day fallback

        const totalMins = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;

        return `${hrs} hrs ${mins} mins`;
    } catch (e) {
        return '8 hrs 0 mins';
    }
}

// App State Management Class
class AppStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.COMPANY)) {
            localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
        }
        
        // Auto-seed or repair employees list if missing or empty
        let currentEmps = [];
        try {
            currentEmps = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) || [];
        } catch (e) {
            currentEmps = [];
        }

        if (!Array.isArray(currentEmps) || currentEmps.length === 0) {
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
        } else {
            // Ensure default ADMIN001 and EMP001 exist
            DEFAULT_EMPLOYEES.forEach(defEmp => {
                if (!currentEmps.some(e => e.id.toUpperCase() === defEmp.id.toUpperCase())) {
                    currentEmps.push(defEmp);
                }
            });
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(currentEmps));
        }

        if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
            localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCE));
        }
        if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
            localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(DEFAULT_LEAVES));
        }
    }

    getCompany() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPANY)) || DEFAULT_COMPANY;
    }

    saveCompany(data) {
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(data));
    }

    getEmployees() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) || DEFAULT_EMPLOYEES;
    }

    getEmployeeById(id) {
        if (!id) return null;
        const cleanId = String(id).trim().toUpperCase();
        return this.getEmployees().find(emp => String(emp.id).trim().toUpperCase() === cleanId);
    }

    saveEmployee(employee) {
        let employees = this.getEmployees();
        const cleanId = String(employee.id).trim().toUpperCase();
        const existingIndex = employees.findIndex(e => String(e.id).trim().toUpperCase() === cleanId);
        if (existingIndex >= 0) {
            employees[existingIndex] = { ...employees[existingIndex], ...employee };
        } else {
            employees.push(employee);
        }
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }

    deleteEmployee(id) {
        const cleanId = String(id).trim().toUpperCase();
        let employees = this.getEmployees().filter(e => String(e.id).trim().toUpperCase() !== cleanId);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }

    getAttendance() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || [];
    }

    saveAttendanceRecord(record) {
        let records = this.getAttendance();
        const existingIndex = records.findIndex(r => r.id === record.id);
        if (existingIndex >= 0) {
            records[existingIndex] = record;
        } else {
            records.unshift(record);
        }
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    }

    getLeaves() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES)) || [];
    }

    saveLeave(leave) {
        let leaves = this.getLeaves();
        const existingIndex = leaves.findIndex(l => l.id === leave.id);
        if (existingIndex >= 0) {
            leaves[existingIndex] = leave;
        } else {
            leaves.unshift(leave);
        }
        localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH));
        } catch (e) {
            return null;
        }
    }

    setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        window.location.href = 'login.html';
    }
}

const store = new AppStore();

// Notification Toast Engine
function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast_' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' :
                    type === 'error' ? 'bg-danger text-white' :
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 show shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-semibold">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    setTimeout(() => {
        const el = document.getElementById(toastId);
        if (el) el.remove();
    }, 4500);
}

// Global Export to CSV Function
function exportTableToCSV(filename, rows) {
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
