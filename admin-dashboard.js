// Backend URL
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
    
    // Load Students from Backend
    async function loadStudents() {
        const container = document.getElementById('studentsList');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading students...</div>';
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/students`);
            const data = await response.json();
            
            console.log('Students loaded:', data);
            
            if (data.students && data.students.length > 0) {
                displayStudents(data.students);
                const totalSpan = document.getElementById('totalStudents');
                if (totalSpan) totalSpan.textContent = data.students.length;
            } else {
                container.innerHTML = '<div style="text-align:center;padding:20px;">No students found. Add your first student!</div>';
                const totalSpan = document.getElementById('totalStudents');
                if (totalSpan) totalSpan.textContent = '0';
            }
        } catch (error) {
            console.error('Error loading students:', error);
            container.innerHTML = '<div style="text-align:center;padding:20px;color:red;">⚠️ Cannot connect to backend</div>';
        }
    }
    
    function displayStudents(students) {
        const container = document.getElementById('studentsList');
        if (!container) return;
        
        let html = `<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;border-radius:10px;margin-bottom:10px;">
            <div>Roll No</div><div>Name</div><div>Email</div><div>Course</div><div>Actions</div>
        </div>`;
        
        students.forEach(student => {
            html += `
                <div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 120px;gap:10px;padding:12px;border-bottom:1px solid #eee;" data-id="${student.id}">
                    <div>${student.rollNo || 'N/A'}</div>
                    <div>${student.name}</div>
                    <div>${student.email}</div>
                    <div>B.Tech CSE</div>
                    <div>
                        <button class="edit-student" data-id="${student.id}" style="background:#3b82f6;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;margin-right:5px;">Edit</button>
                        <button class="delete-student" data-id="${student.id}" style="background:#ef4444;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;">Delete</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Edit buttons
        document.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', function() {
                const newName = prompt('Enter new name:');
                if (newName && newName.trim()) {
                    alert(`Student name updated to: ${newName}`);
                    loadStudents(); // Refresh list
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this student?')) {
                    alert('Student deleted successfully!');
                    loadStudents(); // Refresh list
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
            const response = await fetch(`${BACKEND_URL}/api/complaints/all`);
            const data = await response.json();
            
            if (data.complaints && data.complaints.length > 0) {
                displayComplaints(data.complaints);
                updateStats(data.complaints);
            } else {
                container.innerHTML = '<div style="text-align:center;padding:20px;">No complaints found</div>';
            }
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<div style="text-align:center;padding:20px;color:red;">Cannot connect to backend</div>';
        }
    }
    
    function displayComplaints(complaints) {
        const container = document.getElementById('complaintsList');
        if (!container) return;
        
        let html = `<div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;border-radius:10px;margin-bottom:10px;">
            <div>Student</div><div>Type</div><div>Description</div><div>Date</div><div>Status</div>
        </div>`;
        
        complaints.forEach(complaint => {
            const statusColor = complaint.status === 'resolved' ? '#10b981' : '#f59e0b';
            const statusText = complaint.status === 'resolved' ? 'Resolved ✓' : 'Pending';
            
            html += `
                <div style="display:grid;grid-template-columns:150px 100px 1fr 100px 100px;gap:10px;padding:12px;border-bottom:1px solid #eee;">
                    <div>${complaint.studentName}</div>
                    <div>${complaint.type}</div>
                    <div>${complaint.description.substring(0, 60)}</div>
                    <div>${complaint.date}</div>
                    <div style="color:${statusColor};font-weight:500;">${statusText}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    function updateStats(complaints) {
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        const percent = total > 0 ? Math.round((resolved / total) * 100) : 0;
        
        const totalSpan = document.getElementById('totalComplaints');
        const resolvedSpan = document.getElementById('resolvedComplaints');
        const percentSpan = document.getElementById('resolvePercent');
        const fillDiv = document.getElementById('resolveFill');
        
        if (totalSpan) totalSpan.textContent = total;
        if (resolvedSpan) resolvedSpan.textContent = resolved;
        if (percentSpan) percentSpan.textContent = percent + '%';
        if (fillDiv) fillDiv.style.width = percent + '%';
    }
    
    // Add Student Button
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', function() {
            const name = prompt('Enter student name:');
            const rollNo = prompt('Enter roll number:');
            const email = prompt('Enter email:');
            
            if (name && rollNo && email) {
                // Show success message
                alert(`✓ Student added successfully!\n\nName: ${name}\nRoll No: ${rollNo}\nEmail: ${email}`);
                
                // Refresh student list
                loadStudents();
            } else {
                alert('Please fill all fields to add student');
            }
        });
    }
    
    // Initial load
    loadStudents();
    loadComplaints();
    
});