const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataPath = path.join(__dirname, 'data');
const complaintsPath = path.join(dataPath, 'complaints.json');

// Ensure data folder exists
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
}

// Ensure complaints file exists
if (!fs.existsSync(complaintsPath)) {
    fs.writeFileSync(complaintsPath, JSON.stringify({ complaints: [] }, null, 2));
}

// ========== LOGIN (Hardcoded for now) ==========
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const users = [
        { id: 1, email: 'student@krmu.com', password: '123456', role: 'student', name: 'Aryan Behl', roll_no: '2501350047' },
        { id: 2, email: 'warden@krmu.com', password: '123456', role: 'warden', name: 'Mr. Sharma', roll_no: null },
        { id: 3, email: 'admin@krmu.com', password: '123456', role: 'admin', name: 'Admin User', roll_no: null }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ success: true, role: user.role, name: user.name, rollNo: user.roll_no || '' });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// ========== SUBMIT COMPLAINT ==========
app.post('/api/complaint', (req, res) => {
    const { studentName, studentRollNo, type, description, priority } = req.body;
    const date = new Date().toISOString().split('T')[0];
    
    // Read existing complaints
    let data = fs.readFileSync(complaintsPath, 'utf8');
    let complaints = JSON.parse(data);
    
    // Add new complaint
    const newComplaint = {
        id: Date.now().toString(),
        studentName,
        studentRollNo,
        type,
        description,
        priority: priority || 'Medium',
        status: 'pending',
        date
    };
    
    complaints.complaints.push(newComplaint);
    
    // Write back to file
    fs.writeFileSync(complaintsPath, JSON.stringify(complaints, null, 2));
    
    console.log('New complaint saved:', newComplaint);
    res.json({ success: true, message: 'Complaint submitted', complaint: newComplaint });
});

// ========== GET ALL COMPLAINTS ==========
app.get('/api/complaints/all', (req, res) => {
    let data = fs.readFileSync(complaintsPath, 'utf8');
    let complaints = JSON.parse(data);
    res.json({ complaints: complaints.complaints });
});

// ========== GET COMPLAINTS BY STUDENT ==========
app.get('/api/complaints/:studentName', (req, res) => {
    const { studentName } = req.params;
    let data = fs.readFileSync(complaintsPath, 'utf8');
    let complaints = JSON.parse(data);
    const studentComplaints = complaints.complaints.filter(c => c.studentName === studentName);
    res.json({ complaints: studentComplaints });
});

// ========== RESOLVE COMPLAINT ==========
app.put('/api/complaint/resolve/:id', (req, res) => {
    const { id } = req.params;
    
    let data = fs.readFileSync(complaintsPath, 'utf8');
    let complaints = JSON.parse(data);
    
    const complaint = complaints.complaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = 'resolved';
        fs.writeFileSync(complaintsPath, JSON.stringify(complaints, null, 2));
        res.json({ success: true, message: 'Complaint resolved' });
    } else {
        res.json({ success: false, message: 'Complaint not found' });
    }
});

// ========== GET ALL STUDENTS ==========
app.get('/api/students', (req, res) => {
    const students = [
        { id: 1, name: 'Aryan Behl', email: 'student@krmu.com', rollNo: '2501350047' }
    ];
    res.json({ students: students });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Complaints file path: ${complaintsPath}`);
});

// ========== ADD STUDENT ==========
app.post('/api/students/add', (req, res) => {
    const { name, rollNo, email, password, course } = req.body;
    
    // Read existing users
    const usersPath = path.join(__dirname, 'data', 'users.json');
    let usersData = { users: [] };
    
    if (fs.existsSync(usersPath)) {
        const data = fs.readFileSync(usersPath, 'utf8');
        usersData = JSON.parse(data);
    }
    
    // Create new student
    const newStudent = {
        id: Date.now().toString(),
        name: name,
        rollNo: rollNo,
        email: email,
        password: password || '123456',
        role: 'student',
        course: course || 'B.Tech CSE'
    };
    
    usersData.users.push(newStudent);
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    
    console.log('New student added:', newStudent);
    res.json({ success: true, message: 'Student added successfully', student: newStudent });
});