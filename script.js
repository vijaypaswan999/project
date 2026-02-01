// Simulate database with localStorage
let users = JSON.parse(localStorage.getItem('users')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const expenseForm = document.getElementById('expenseForm');
const loginDiv = document.getElementById('login-form');
const registerDiv = document.getElementById('register-form');
const employeeDashboard = document.getElementById('employee-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');
const expenseList = document.getElementById('expense-list');
const adminExpenseList = document.getElementById('admin-expense-list');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');
const logoutBtn = document.getElementById('logout-btn');
const logoutBtnAdmin = document.getElementById('logout-btn-admin');

// Toggle between login and register
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginDiv.style.display = 'none';
    registerDiv.style.display = 'block';
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerDiv.style.display = 'none';
    loginDiv.style.display = 'block';
});

// Register employee
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Validate password length
    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    users.push({ username, password, role: 'employee' });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    registerDiv.style.display = 'none';
    loginDiv.style.display = 'block';
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    let user;
    if (role === 'admin' && username === 'admin' && password === 'admin') {
        user = { role: 'admin' };
    } else {
        user = users.find(u => u.username === username && u.password === password && u.role === role);
    }
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard(role);
    } else {
        alert('Invalid credentials');
    }
});

// Show dashboard based on role
function showDashboard(role) {
    loginDiv.style.display = 'none';
    registerDiv.style.display = 'none';
    if (role === 'employee') {
        employeeDashboard.style.display = 'block';
        loadEmployeeExpenses();
    } else {
        adminDashboard.style.display = 'block';
        loadAdminExpenses();
    }
}

// Logout
logoutBtn.addEventListener('click', logout);
logoutBtnAdmin.addEventListener('click', logout);

function logout() {
    localStorage.removeItem('currentUser');
    employeeDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    loginDiv.style.display = 'block';
}

// Add expense (employee)
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const empName = document.getElementById('emp-name').value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const fileInput = document.getElementById('file');
    let fileData = null;
    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fileData = e.target.result;
            saveExpense(empName, amount, description, fileData);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveExpense(empName, amount, description, fileData);
    }
});

function saveExpense(empName, amount, description, fileData) {
    const expense = {
        id: Date.now(),
        empName,
        amount,
        description,
        file: fileData,
        status: 'pending'
    };
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    loadEmployeeExpenses();
    expenseForm.reset();
}

// Load employee expenses
function loadEmployeeExpenses() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userExpenses = expenses.filter(e => e.empName === user.username);
    expenseList.innerHTML = '';
    userExpenses.forEach(exp => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${exp.empName}</strong> - $${exp.amount} - ${exp.description} - Status: ${exp.status}
            ${exp.file ? `<br><a href="${exp.file}" download>Download File</a>` : ''}
        `;
        expenseList.appendChild(li);
    });
}

// Load admin expenses
function loadAdminExpenses() {
    adminExpenseList.innerHTML = '';
    expenses.forEach(exp => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${exp.empName}</strong> - $${exp.amount} - ${exp.description} - Status: ${exp.status}
            ${exp.file ? `<br><a href="${exp.file}" download>Download File</a>` : ''}
            <button onclick="approveExpense(${exp.id})">Approve</button>
            <button onclick="rejectExpense(${exp.id})">Reject</button>
        `;
        adminExpenseList.appendChild(li);
    });
}

// Approve expense
function approveExpense(id) {
    const exp = expenses.find(e => e.id === id);
    if (exp) {
        exp.status = 'approved';
        localStorage.setItem('expenses', JSON.stringify(expenses));
        loadAdminExpenses();
    }
}

// Reject expense
function rejectExpense(id) {
    const exp = expenses.find(e => e.id === id);
    if (exp) {
        exp.status = 'rejected';
        localStorage.setItem('expenses', JSON.stringify(expenses));
        loadAdminExpenses();
    }
}

// Check if user is logged in on load
window.onload = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        showDashboard(user.role);
    }
};
