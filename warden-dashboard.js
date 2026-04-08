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
            if (tabId === 'complaints') loadComplaints();
        });
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('Logout?')) { sessionStorage.clear(); window.location.href = 'index.html'; }
    });
    
    // Load Complaints
    async function loadComplaints() {
        try {
            const response = await fetch('https://hostel-backend-aw3h.onrender.com/api/complaints/all');
            const data = await res.json();
            if (data.complaints) {
                displayComplaints(data.complaints);
                updateStats(data.complaints);
            }
        } catch (err) {
            document.getElementById('complaintsList').innerHTML = '<div style="padding:20px;text-align:center;color:red;">Backend not running. Run: node server.js</div>';
        }
    }
    
    function displayComplaints(complaints) {
        const container = document.getElementById('complaintsList');
        if (complaints.length === 0) {
            container.innerHTML = '<div style="padding:20px;text-align:center;">No complaints</div>';
            return;
        }
        
        let html = '<div style="display:grid;grid-template-columns:120px 100px 100px 1fr 100px 100px 80px;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;"><div>Student</div><div>Room</div><div>Type</div><div>Description</div><div>Date</div><div>Status</div><div>Action</div></div>';
        
        complaints.forEach(c => {
            const isPending = c.status === 'pending';
            html += `<div style="display:grid;grid-template-columns:120px 100px 100px 1fr 100px 100px 80px;gap:10px;padding:12px;border-bottom:1px solid #eee;" data-id="${c.id}">
                <div>${c.studentName}</div>
                <div>${c.studentRollNo || 'N/A'}</div>
                <div>${c.type}</div>
                <div>${c.description.substring(0, 50)}</div>
                <div>${c.date}</div>
                <div><span style="background:${isPending ? '#f59e0b20' : '#10b98120'};color:${isPending ? '#f59e0b' : '#10b981'};padding:4px 8px;border-radius:20px;">${isPending ? 'Pending' : 'Resolved'}</span></div>
                <div>${isPending ? `<button class="resolve-btn" data-id="${c.id}" style="background:#10b981;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Resolve</button>` : '-'}</div>
            </div>`;
        });
        
        container.innerHTML = html;
        
        // Add resolve event listeners
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                if (!confirm('Resolve this complaint?')) return;
                try {
                    const res = await fetch(`https://hostel-backend-aw3h.onrender.com/${id}`, { method: 'PUT' });
                    const data = await res.json();
                    if (data.success) { alert('Resolved!'); loadComplaints(); }
                    else alert('Error');
                } catch(err) { alert('Server error'); }
            });
        });
    }
    
    function updateStats(complaints) {
        const pending = complaints.filter(c => c.status === 'pending').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('resolvedCount').textContent = resolved;
        document.getElementById('pendingBadge').textContent = pending;
        
        // Recent list
        const recentContainer = document.getElementById('recentList');
        const pendingList = complaints.filter(c => c.status === 'pending').slice(0, 5);
        if (pendingList.length === 0) recentContainer.innerHTML = '<div style="padding:20px;text-align:center;">No pending complaints</div>';
        else {
            let html = '';
            pendingList.forEach(c => {
                html += `<div style="padding:10px;border-bottom:1px solid #eee;"><strong>${c.studentName}</strong> - ${c.type}<br><small>${c.description.substring(0, 80)}</small><br><button class="resolve-recent" data-id="${c.id}" style="margin-top:5px;background:#10b981;color:white;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;">Resolve</button></div>`;
            });
            recentContainer.innerHTML = html;
            document.querySelectorAll('.resolve-recent').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const id = this.getAttribute('data-id');
                    if (!confirm('Resolve?')) return;
                    await fetch(`http://localhost:5000/api/complaint/resolve/${id}`, { method: 'PUT' });
                    loadComplaints();
                });
            });
        }
    }
    
    // Load Students
    async function loadStudents() {
        try {
            const res = await fetch('http://localhost:5000/api/students');
            const data = await res.json();
            if (data.students) {
                document.getElementById('totalStudents').textContent = data.students.length;
                let html = '<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr;gap:10px;padding:12px;background:#f0f0f0;font-weight:bold;"><div>Roll No</div><div>Name</div><div>Email</div><div>Course</div></div>';
                data.students.forEach(s => {
                    html += `<div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr;gap:10px;padding:12px;border-bottom:1px solid #eee;"><div>${s.rollNo || 'N/A'}</div><div>${s.name}</div><div>${s.email}</div><div>B.Tech CSE</div></div>`;
                });
                document.getElementById('studentsList').innerHTML = html;
            }
        } catch(err) { console.error(err); }
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            const rows = document.querySelectorAll('#complaintsList > div:not(:first-child)');
            rows.forEach(row => {
                const statusSpan = row.querySelector('span');
                if (filter === 'all') row.style.display = 'grid';
                else if (filter === 'pending' && statusSpan && statusSpan.innerText === 'Pending') row.style.display = 'grid';
                else if (filter === 'resolved' && statusSpan && statusSpan.innerText === 'Resolved') row.style.display = 'grid';
                else row.style.display = 'none';
            });
        });
    });
    
    loadComplaints();
    loadStudents();
});