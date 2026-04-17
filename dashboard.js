// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Backend URL
    const BACKEND_URL = 'https://hostel-backend-aw3h.onrender.com';
    
    // Get student name from session
    const studentName = sessionStorage.getItem('userName') || 'Aryan Behl';
    const studentRollNo = sessionStorage.getItem('userRollNo') || '2501350047';
    
    // Update name in UI
    const nameElements = document.querySelectorAll('#studentName, #userName, #profileName, #infoName');
    nameElements.forEach(function(el) {
        if (el) el.textContent = studentName;
    });
    
    const rollElements = document.querySelectorAll('#userRoll, #profileRoll');
    rollElements.forEach(function(el) {
        if (el) el.textContent = studentRollNo;
    });
    
    // ========== TAB SWITCHING ==========
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            navItems.forEach(function(nav) {
                nav.classList.remove('active');
            });
            this.classList.add('active');
            
            const tabId = this.getAttribute('data-tab');
            tabPanes.forEach(function(pane) {
                pane.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'complaint') {
                loadComplaints();
            }
        });
    });
    
    // ========== LOGOUT ==========
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
    
    // ========== LOAD COMPLAINTS ==========
    async function loadComplaints() {
        const complaintList = document.getElementById('complaintHistoryList');
        if (!complaintList) return;
        
        complaintList.innerHTML = '<div style="text-align:center;padding:20px;">Loading complaints...</div>';
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/complaints/${encodeURIComponent(studentName)}`);
            const data = await response.json();
            
            if (data.complaints && data.complaints.length > 0) {
                displayComplaints(data.complaints);
            } else {
                complaintList.innerHTML = '<div style="text-align:center;padding:20px;">No complaints found</div>';
            }
        } catch (error) {
            console.error('Error:', error);
            complaintList.innerHTML = '<div style="text-align:center;padding:20px;color:red;">Cannot connect to server</div>';
        }
    }
    
    function displayComplaints(complaints) {
        const complaintList = document.getElementById('complaintHistoryList');
        if (!complaintList) return;
        
        complaintList.innerHTML = '';
        
        complaints.forEach(function(complaint) {
            const row = document.createElement('div');
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '100px 1fr 100px 100px';
            row.style.gap = '10px';
            row.style.padding = '10px';
            row.style.borderBottom = '1px solid #eee';
            row.innerHTML = `
                <div><strong>${complaint.type}</strong></div>
                <div>${complaint.description}</div>
                <div style="color: ${complaint.status === 'resolved' ? 'green' : 'orange'}">${complaint.status === 'resolved' ? 'Resolved' : 'Pending'}</div>
                <div>${complaint.date}</div>
            `;
            complaintList.appendChild(row);
        });
    }
    
    // ========== SUBMIT COMPLAINT ==========
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const complaintType = document.getElementById('complaintType').value;
            const complaintDesc = document.getElementById('complaintDesc').value;
            const submitBtn = document.querySelector('.submit-btn, .btn-submit');
            
            if (!complaintType || complaintType === "") {
                alert('Please select complaint type');
                return;
            }
            
            if (!complaintDesc || complaintDesc.trim() === "") {
                alert('Please enter description');
                return;
            }
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Submitting...';
            }
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/complaint`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentName: studentName,
                        studentRollNo: studentRollNo,
                        type: complaintType,
                        description: complaintDesc,
                        priority: 'Medium'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Complaint submitted!');
                    complaintForm.reset();
                    loadComplaints();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Cannot connect to backend. Check console.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Submit Complaint';
                }
            }
        });
    }
    
    // Load complaints on page load
    loadComplaints();
    
});