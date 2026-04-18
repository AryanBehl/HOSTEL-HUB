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
        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading students...</div>';
        try {
            const res = await fetch(`${BACKEND_URL}/api/students`);
            const data = await res.json();
            if (data.students && data.students.length > 0) {
                displayStudents(data.students);
                document.getElementById('totalStudents').textContent = data.students.length;
            } else {
                container.innerHTML = '<div style="text-align:center;padding:20px;">No students found</div>';
                document.getElementById('totalStudents').textContent = '0';
            }
        } catch (err) {
            console.error('Error:', err);
            container.innerHTML = '<div style="text-align:center;padding:20px;color:red;">Cannot connect to backend</div>';
        }
    }
    
    function displayStudents(students) {
        const container = document.getElementById('studentsList');
        let html = '<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;border-radius:10px;margin-bottom:10px;"><div>Roll No</div><div>Name</div><div>Email</div><div>Course</div><div>Actions</div></div>';
        students.forEach(s => {
            html += `<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;border-bottom:1px solid #eee;">
                <div>${s.rollNo || 'N/A'}</div>
                <div>${s.name}</div>
                <div>${s.email}</div>
                <div>B.Tech CSE</div>
                <div>
                    <button class="delete-student" data-id="${s.id}" style="background:#ef4444;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;">Delete</button>
                </div>
            </div>`;
        });
        container.innerHTML = html;
        
        document.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                if (confirm('Delete this student?')) {
                    await fetch(`${BACKEND_URL}/api/students/delete/${id}`, { method: 'DELETE' });
                    loadStudents();
                }
            });
        });
    }
    
    // Load Complaints
    async function loadComplaints() {
        const container = document.getElementById('complaintsList');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading complaints...</div>';
        try {
            const res = await fetch(`${BACKEND_URL}/api/complaints/all`);
            const data = await res.json();
            console.log('Complaints data:', data);
            if (data.complaints && data.complaints.length > 0) {
                let html = '<div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;border-radius:10px;margin-bottom:10px;"><div>Student</div><div>Type</div><div>Description</div><div>Date</div><div>Status</div></div>';
                data.complaints.forEach(c => {
                    const statusColor = c.status === 'resolved' ? '#10b981' : '#f59e0b';
                    html += `<div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;border-bottom:1px solid #eee;">
                        <div>${c.studentName}</div>
                        <div>${c.type}</div>
                        <div>${c.description.substring(0, 60)}</div>
                        <div>${c.date}</div>
                        <div style="color:${statusColor};font-weight:500;">${c.status === 'resolved' ? 'Resolved ✓' : 'Pending'}</div>
                    </div>`;
                });
                container.innerHTML = html;
                
                // Update stats
                const total = data.complaints.length;
                const resolved = data.complaints.filter(c => c.status === 'resolved').length;
                const percent = total > 0 ? Math.round((resolved / total) * 100) : 0;
                document.getElementById('totalComplaints').textContent = total;
                document.getElementById('resolvedComplaints').textContent = resolved;
                document.getElementById('resolvePercent').textContent = percent + '%';
                document.getElementById('resolveFill').style.width = percent + '%';
            } else {
                container.innerHTML = '<div style="text-align:center;padding:20px;">No complaints found</div>';
                document.getElementById('totalComplaints').textContent = '0';
                document.getElementById('resolvedComplaints').textContent = '0';
                document.getElementById('resolvePercent').textContent = '0%';
                document.getElementById('resolveFill').style.width = '0%';
            }
        } catch (err) {
            console.error('Error loading complaints:', err);
            container.innerHTML = '<div style="text-align:center;padding:20px;color:red;">Cannot connect to backend. Make sure server is running.</div>';
        }
    }
    
    // Add Student
    document.getElementById('addStudentBtn')?.addEventListener('click', async () => {
        const name = prompt('Enter student name:');
        const rollNo = prompt('Enter roll number:');
        const email = prompt('Enter email:');
        if (name && rollNo && email) {
            try {
                await fetch(`${BACKEND_URL}/api/students/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rollNo, email })
                });
                alert('Student added successfully!');
                loadStudents();
            } catch (err) {
                alert('Error adding student');
            }
        }
    });
    
    loadStudents();
    loadComplaints();
});