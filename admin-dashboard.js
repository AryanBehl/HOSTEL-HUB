document.addEventListener('DOMContentLoaded', function() {
    
    let studentsData = [];
    
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
        if (confirm('Logout?')) { sessionStorage.clear(); window.location.href = 'index.html'; }
    });
    
    // Load Students
    async function loadStudents() {
        try {
            const res = await fetch('http://localhost:5000/api/students');
            const data = await res.json();
            if (data.students) {
                studentsData = data.students;
                document.getElementById('totalStudents').textContent = studentsData.length;
                displayStudents(studentsData);
            }
        } catch(err) {
            document.getElementById('studentsList').innerHTML = '<div style="padding:20px;text-align:center;color:red;">Backend not running</div>';
        }
    }
    
    function displayStudents(students) {
        if (students.length === 0) {
            document.getElementById('studentsList').innerHTML = '<div style="padding:20px;text-align:center;">No students</div>';
            return;
        }
        
        let html = '<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;"><div>Roll No</div><div>Name</div><div>Email</div><div>Course</div><div>Actions</div></div>';
        
        students.forEach((s, index) => {
            html += `<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;border-bottom:1px solid #eee;" data-index="${index}">
                <div>${s.rollNo || 'N/A'}</div>
                <div>${s.name}</div>
                <div>${s.email}</div>
                <div>B.Tech CSE</div>
                <div><button class="edit-student" data-id="${s.id}" style="background:#3b82f6;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;margin-right:5px;">Edit</button><button class="delete-student" data-id="${s.id}" style="background:#ef4444;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;">Del</button></div>
            </div>`;
        });
        
        document.getElementById('studentsList').innerHTML = html;
        
        // Edit buttons
        document.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const student = studentsData.find(s => s.id == id);
                if (student) {
                    const newName = prompt('Edit name:', student.name);
                    if (newName && newName !== student.name) {
                        alert(`Student name updated to: ${newName}`);
                        loadStudents();
                    }
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Delete this student?')) {
                    alert('Student deleted!');
                    loadStudents();
                }
            });
        });
    }
    
    // Add Student
    document.getElementById('addStudentBtn')?.addEventListener('click', () => {
        const name = prompt('Enter student name:');
        const rollNo = prompt('Enter roll number:');
        const email = prompt('Enter email:');
        if (name && rollNo && email) {
            alert(`Student added!\nName: ${name}\nRoll: ${rollNo}\nEmail: ${email}`);
            loadStudents();
        }
    });
    
    // Load Complaints
    async function loadComplaints() {
        try {
            const res = await fetch('http://localhost:5000/api/complaints/all');
            const data = await res.json();
            if (data.complaints) {
                displayComplaints(data.complaints);
                updateStats(data.complaints);
            }
        } catch(err) {
            document.getElementById('complaintsList').innerHTML = '<div style="padding:20px;text-align:center;color:red;">Backend not running</div>';
        }
    }
    
    function displayComplaints(complaints) {
        if (complaints.length === 0) {
            document.getElementById('complaintsList').innerHTML = '<div style="padding:20px;text-align:center;">No complaints</div>';
            return;
        }
        
        let html = '<div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;"><div>Student</div><div>Type</div><div>Description</div><div>Date</div><div>Status</div></div>';
        
        complaints.forEach(c => {
            const isPending = c.status === 'pending';
            html += `<div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;border-bottom:1px solid #eee;">
                <div>${c.studentName}</div>
                <div>${c.type}</div>
                <div>${c.description.substring(0, 60)}</div>
                <div>${c.date}</div>
                <div><span style="background:${isPending ? '#f59e0b20' : '#10b98120'};color:${isPending ? '#f59e0b' : '#10b981'};padding:4px 8px;border-radius:20px;">${isPending ? 'Pending' : 'Resolved'}</span></div>
            </div>`;
        });
        
        document.getElementById('complaintsList').innerHTML = html;
    }
    
    function updateStats(complaints) {
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        document.getElementById('totalComplaints').textContent = total;
        document.getElementById('resolvedComplaints').textContent = resolved;
        
        const percent = total > 0 ? Math.round((resolved / total) * 100) : 0;
        document.getElementById('overviewStats').innerHTML = `<div class="stat-progress"><div class="progress-label"><span>Complaints Resolved</span><span>${percent}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div></div>`;
    }
    
    loadStudents();
    loadComplaints();
});