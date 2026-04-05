// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Modal functionality
let currentUserType = 'student';

function showLoginModal(type) {
    currentUserType = type;
    const modal = document.getElementById('loginModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const demoCreds = document.getElementById('demoCreds');
    
    if (type === 'student') {
        modalIcon.innerHTML = '<i class="fas fa-user-graduate"></i>';
        modalTitle.textContent = 'Student Login';
        demoCreds.innerHTML = `
            <div><strong>Student Demo:</strong> student@krmu.com / 123456</div>
            <div><strong>OR</strong></div>
            <div>aryan@krmu.com / 123456</div>
        `;
    } else if (type === 'warden') {
        modalIcon.innerHTML = '<i class="fas fa-user-tie"></i>';
        modalTitle.textContent = 'Warden Login';
        demoCreds.innerHTML = `
            <div><strong>Warden Demo:</strong> warden@krmu.com / 123456</div>
        `;
    } else if (type === 'admin') {
        modalIcon.innerHTML = '<i class="fas fa-user-shield"></i>';
        modalTitle.textContent = 'Admin Login';
        demoCreds.innerHTML = `
            <div><strong>Admin Demo:</strong> admin@krmu.com / 123456</div>
        `;
    }
    
    modal.style.display = 'flex';
}

// Close modal
document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('loginModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// ========== LOGIN WITH BACKEND (NEW CODE) ==========
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.querySelector('.btn-login-submit');
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Login successful! Redirecting...', 'success');
            
            // Save user info
            sessionStorage.setItem('userName', data.name);
            sessionStorage.setItem('userRole', data.role);
            sessionStorage.setItem('userRollNo', data.rollNo || '');
            
            setTimeout(() => {
                if (data.role === 'student') {
                    window.location.href = 'student-dashboard.html';
                } else if (data.role === 'warden') {
                    window.location.href = 'warden-dashboard.html';
                } else if (data.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                }
            }, 1500);
        } else {
            showNotification(data.message || 'Invalid credentials', 'error');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Cannot connect to backend. Make sure server is running on port 5000', 'error');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Login';
    }
});

// Notification function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span>`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Mobile menu toggle
document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    const navButtons = document.querySelector('.nav-buttons');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
        navButtons.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navButtons.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navButtons.style.flexDirection = 'column';
    }
});