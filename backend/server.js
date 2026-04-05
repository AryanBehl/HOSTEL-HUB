const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Data file paths
const dataPath = path.join(__dirname, 'data');
const usersPath = path.join(dataPath, 'users.json');
const complaintsPath = path.join(dataPath, 'complaints.json');

// ========== LOGIN API ==========
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    // Check if users file exists
    if (!fs.existsSync(usersPath)) {
        return res.json({ success: false, message: 'No users found. Please contact admin.' });
    }
    
    // Read users from JSON file
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData).users;
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('Login successful:', user.name);
        res.json({ 
            success: true, 
            role: user.role, 
            name: user.name,
            rollNo: user.rollNo || '',
            message: 'Login successful! Redirecting...'
        });
    } else {
        console.log('Login failed: Invalid credentials');
        res.json({ success: false, message: 'Invalid email or password. Try: student@krmu.com / 123456' });
    }
});

// ========== SUBMIT COMPLAINT API ==========
app.post('/api/complaint', (req, res) => {
    const { studentName, studentRollNo, type, description, priority } = req.body;
    
    console.log('New complaint from:', studentName);
    
    // Read existing complaints
    let complaints = { complaints: [] };
    if (fs.existsSync(complaintsPath)) {
        const data = fs.readFileSync(complaintsPath, 'utf8');
        complaints = JSON.parse(data);
    }
    
    // Create new complaint
    const newComplaint = {
        id: Date.now().toString(),
        studentName: studentName,
        studentRollNo: studentRollNo || '',
        type: type,
        description: description,
        priority: priority || 'Medium',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString()
    };
    
    // Add to complaints array
    complaints.complaints.push(newComplaint);
    
    // Save back to file
    fs.writeFileSync(complaintsPath, JSON.stringify(complaints, null, 2));
    
    console.log('Complaint saved. Total complaints:', complaints.complaints.length);
    
    res.json({ 
        success: true, 
        message: 'Complaint submitted successfully!',
        complaint: newComplaint
    });
});

// ========== GET COMPLAINTS FOR A STUDENT ==========
app.get('/api/complaints/:studentName', (req, res) => {
    const { studentName } = req.params;
    
    if (!fs.existsSync(complaintsPath)) {
        return res.json({ complaints: [] });
    }
    
    const data = fs.readFileSync(complaintsPath, 'utf8');
    const complaints = JSON.parse(data);
    
    const studentComplaints = complaints.complaints.filter(c => c.studentName === studentName);
    
    res.json({ complaints: studentComplaints });
});

// ========== GET ALL COMPLAINTS (For Warden/Admin) ==========
app.get('/api/complaints/all', (req, res) => {
    if (!fs.existsSync(complaintsPath)) {
        return res.json({ complaints: [] });
    }
    
    const data = fs.readFileSync(complaintsPath, 'utf8');
    const complaints = JSON.parse(data);
    
    res.json({ complaints: complaints.complaints });
});

// ========== RESOLVE COMPLAINT (For Warden/Admin) ==========
app.put('/api/complaint/resolve/:id', (req, res) => {
    const { id } = req.params;
    
    if (!fs.existsSync(complaintsPath)) {
        return res.json({ success: false, message: 'No complaints found' });
    }
    
    const data = fs.readFileSync(complaintsPath, 'utf8');
    const complaints = JSON.parse(data);
    
    const complaintIndex = complaints.complaints.findIndex(c => c.id === id);
    
    if (complaintIndex !== -1) {
        complaints.complaints[complaintIndex].status = 'resolved';
        fs.writeFileSync(complaintsPath, JSON.stringify(complaints, null, 2));
        res.json({ success: true, message: 'Complaint resolved!' });
    } else {
        res.json({ success: false, message: 'Complaint not found' });
    }
});

// ========== GET ALL STUDENTS (For Admin) ==========
app.get('/api/students', (req, res) => {
    if (!fs.existsSync(usersPath)) {
        return res.json({ students: [] });
    }
    
    const data = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(data);
    
    const students = users.users.filter(u => u.role === 'student');
    
    res.json({ students: students });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('🚀 BACKEND SERVER STARTED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Data folder: ${dataPath}`);
    console.log('========================================');
    console.log('');
    console.log('📌 API Endpoints:');
    console.log(`   POST /api/login - Login user`);
    console.log(`   POST /api/complaint - Submit complaint`);
    console.log(`   GET  /api/complaints/:studentName - Get student complaints`);
    console.log(`   GET  /api/complaints/all - Get all complaints`);
    console.log(`   PUT  /api/complaint/resolve/:id - Resolve complaint`);
    console.log(`   GET  /api/students - Get all students`);
    console.log('========================================');
});