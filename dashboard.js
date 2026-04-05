// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== SET USER NAME FROM SESSION ==========
    const userName = sessionStorage.getItem('userName') || 'Aryan Behl';
    const userRollNo = sessionStorage.getItem('userRollNo') || '2501350047';
    
    // Update name in multiple places
    const nameElements = document.querySelectorAll('#studentName, #userName, #profileName, #infoName');
    nameElements.forEach(function(el) {
        if (el) el.textContent = userName;
    });
    
    const rollElements = document.querySelectorAll('#userRoll, #profileRoll');
    rollElements.forEach(function(el) {
        if (el) el.textContent = userRollNo;
    });
    
    const emailElement = document.getElementById('infoEmail');
    if (emailElement) {
        emailElement.textContent = userName.toLowerCase().replace(' ', '.') + '@krmangalam.edu.in';
    }
    
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
    
    // ========== LOAD COMPLAINTS FROM BACKEND ==========
    async function loadComplaints() {
        const studentName = sessionStorage.getItem('userName') || 'Aryan Behl';
        const complaintList = document.getElementById('complaintHistoryList');
        
        if (!complaintList) return;
        
        complaintList.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Loading complaints...</div>';
        
        try {
            const response = await fetch(`http://localhost:5000/api/complaints/${encodeURIComponent(studentName)}`);
            const data = await response.json();
            
            if (data.complaints && data.complaints.length > 0) {
                updateComplaintList(data.complaints);
                updateActiveComplaintsCount(data.complaints);
            } else {
                complaintList.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">No complaints found. Raise your first complaint!</div>';
            }
        } catch (error) {
            console.error('Error loading complaints:', error);
            complaintList.innerHTML = '<div style="text-align:center;padding:20px;color:#ef4444;">⚠️ Cannot connect to server. Make sure backend is running.</div>';
        }
    }
    
    function updateComplaintList(complaints) {
        const complaintList = document.getElementById('complaintHistoryList');
        if (!complaintList) return;
        
        complaintList.innerHTML = '';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'complaint-row-header';
        header.style.display = 'grid';
        header.style.gridTemplateColumns = '100px 1fr 100px 100px';
        header.style.gap = '10px';
        header.style.padding = '12px';
        header.style.backgroundColor = '#f0f0f0';
        header.style.fontWeight = 'bold';
        header.style.borderRadius = '10px';
        header.style.marginBottom = '10px';
        header.innerHTML = `
            <div>Type</div>
            <div>Description</div>
            <div>Status</div>
            <div>Date</div>
        `;
        complaintList.appendChild(header);
        
        // Add each complaint
        complaints.forEach(function(complaint) {
            const statusColor = complaint.status === 'resolved' ? '#10b981' : '#f59e0b';
            const statusText = complaint.status === 'resolved' ? 'Resolved ✓' : 'Pending';
            
            const row = document.createElement('div');
            row.className = 'complaint-row';
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '100px 1fr 100px 100px';
            row.style.gap = '10px';
            row.style.padding = '12px';
            row.style.borderBottom = '1px solid #eee';
            row.innerHTML = `
                <div><strong>${complaint.type}</strong></div>
                <div>${complaint.description}</div>
                <div style="color: ${statusColor}; font-weight: 500;">${statusText}</div>
                <div style="color: #888;">${complaint.date}</div>
            `;
            complaintList.appendChild(row);
        });
    }
    
    function updateActiveComplaintsCount(complaints) {
        const activeCount = complaints.filter(function(c) {
            return c.status === 'pending';
        }).length;
        
        const activeSpan = document.getElementById('activeComplaints');
        if (activeSpan) {
            activeSpan.textContent = activeCount;
        }
        
        const badge = document.getElementById('notificationBadge');
        if (badge && activeCount > 0) {
            badge.textContent = activeCount;
        }
    }
    
    // ========== COMPLAINT FORM SUBMIT ==========
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const complaintType = document.getElementById('complaintType').value;
            const complaintDesc = document.getElementById('complaintDesc').value;
            const complaintPriority = document.getElementById('complaintPriority')?.value || 'Medium';
            const submitBtn = document.querySelector('.submit-btn');
            
            if (!complaintType || complaintType === "") {
                alert('Please select complaint type');
                return;
            }
            
            if (!complaintDesc || complaintDesc.trim() === "") {
                alert('Please enter complaint description');
                return;
            }
            
            const studentName = sessionStorage.getItem('userName') || 'Aryan Behl';
            const studentRollNo = sessionStorage.getItem('userRollNo') || '2501350047';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }
            
            try {
                const response = await fetch('http://localhost:5000/api/complaint', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentName: studentName,
                        studentRollNo: studentRollNo,
                        type: complaintType,
                        description: complaintDesc,
                        priority: complaintPriority
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('✓ Complaint submitted successfully!');
                    complaintForm.reset();
                    await loadComplaints();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                console.error('Complaint error:', error);
                alert('❌ Cannot connect to server.\n\nMake sure backend is running:\ncd backend\nnode server.js');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Complaint';
                }
            }
        });
    }
    
    // ========== FOOD RATING STARS ==========
    const starContainers = document.querySelectorAll('.star-rating');
    starContainers.forEach(function(container) {
        const stars = container.querySelectorAll('i');
        stars.forEach(function(star) {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-value');
                const allStars = this.parentElement.querySelectorAll('i');
                for (var i = 0; i < allStars.length; i++) {
                    if (i < rating) {
                        allStars[i].className = 'fas fa-star';
                    } else {
                        allStars[i].className = 'far fa-star';
                    }
                }
            });
        });
    });
    
    // ========== SUBMIT FOOD RATING ==========
    const ratingSubmitBtn = document.querySelector('.rating-submit-btn');
    if (ratingSubmitBtn) {
        ratingSubmitBtn.addEventListener('click', function() {
            alert('Thank you for your rating! Your feedback helps us improve.');
        });
    }
    
    // ========== DOWNLOAD RECEIPT ==========
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('Receipt downloaded successfully!');
        });
    }
    
    // ========== NOTIFICATION CLICK ==========
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            const activeCount = document.getElementById('activeComplaints')?.textContent || '0';
            alert('📢 Notifications\n\nYou have ' + activeCount + ' active complaint(s).');
        });
    }
    
    // ========== LOAD COMPLAINTS ON PAGE LOAD ==========
    loadComplaints();
    
});
