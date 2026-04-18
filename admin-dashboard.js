const BACKEND_URL = 'https://hostel-backend-aw3h.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    
    // Tab Switching
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            if (tabId === 'students') loadStudents();
            if (tabId === 'complaints') loadComplaints();
        });
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('Logout?')) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });
    
    // Load Students
    async function loadStudents() {
        const container = document.getElementById('studentsList');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading...</div>';
        try {
            const res = await fetch(`${BACKEND_URL}/api/students`);
            const data = await res.json();
            if (data.students && data.students.length > 0) {
                displayStudents(data.students);
                document.getElementById('totalStudents').textContent = data.students.length;
            } else {
                container.innerHTML = '<div style="text-align:center;padding:20px;">No students</div>';
                document.getElementById('totalStudents').textContent = '0';
            }
        } catch (err) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:red;">Backend error</div>';
        }
    }
    
    function displayStudents(students) {
        const container = document.getElementById('studentsList');
        let html = '<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;"><div>Roll No</div><div>Name</div><div>Email</div><div>Course</div><div>Actions</div></div>';
        students.forEach(s => {
            html += `<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;border-bottom:1px solid #eee;">
                <div>${s.rollNo || 'N/A'}</div>
                <div>${s.name}</div>
                <div>${s.email}</div>
                <div>B.Tech CSE</div>
                <div>
                    <button class="edit-btn" data-id="${s.id}" style="background:#3b82f6;color:white;border:none;padding:4px 10px;border-radius:5px;margin-right:5px;">Edit</button>
                    <button class="delete-btn" data-id="${s.id}" style="background:#ef4444;color:white;border:none;padding:4px 10px;border-radius:5px;">Del</button>
                </div>
            </div>`;
        });
        container.innerHTML = html;
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => alert('Edit feature coming soon'));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => alert('Delete feature coming soon'));
        });
    }
    
    // Load Complaints
    async function loadComplaints() {
        const container = document.getElementById('complaintsList');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading...</div>';
        try {
            const res = await fetch(`${BACKEND_URL}/api/complaints/all`);
            const data = await res.json();
            if (data.complaints && data.complaints.length > 0) {
                let html = '<div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;"><div>Student</div><div>Type</div><div>Description</div><div>Date</div><div>Status</div></div>';
                data.complaints.forEach(c => {
                    html += `<div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;border-bottom:1px solid #eee;">
                        <div>${c.studentName}</div>
                        <div>${c.type}</div>
                        <div>${c.description}</div>
                        <div>${c.date}</div>
                        <div style="color:${c.status === 'resolved' ? 'green' : 'orange'}">${c.status}</div>
                    </div>`;
                });
                container.innerHTML = html;
                document.getElementById('totalComplaints').textContent = data.complaints.length;
                const resolved = data.complaints.filter(c => c.status === 'resolved').length;
                document.getElementById('resolvedComplaints').textContent = resolved;
            } else {
                container.innerHTML = '<div style="text-align:center;padding:20px;">No complaints</div>';
            }
        } catch (err) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:red;">Backend error</div>';
        }
    }
    
    // Add Student (Simple - without backend API for now)
    document.getElementById('addStudentBtn')?.addEventListener('click', () => {
        const name = prompt('Enter student name:');
        const rollNo = prompt('Enter roll number:');
        const email = prompt('Enter email:');
        if (name && rollNo && email) {
            alert(`Student added!\nName: ${name}\nRoll: ${rollNo}\nEmail: ${email}\n\nNote: Student will appear after backend API is added.`);
            loadStudents();
        }
    });
    
    loadStudents();
    loadComplaints();
});