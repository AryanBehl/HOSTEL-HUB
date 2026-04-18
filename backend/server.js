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
const usersPath = path.join(dataPath, 'users.json');
const complaintsPath = path.join(dataPath, 'complaints.json');

// Ensure data folder exists
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
}

// Ensure users file exists
if (!fs.existsSync(usersPath)) {
    const defaultUsers = {
        users: [
            { id: "1", email: "student@krmu.com", password: "123456", role: "student", name: "Aryan Behl", rollNo: "2501350047" },
            { id: "2", email: "warden@krmu.com", password: "123456", role: "warden", name: "Mr. Sharma", rollNo: null },
            { id: "3", email: "admin@krmu.com", password: "123456", role: "admin", name: "Admin User", rollNo: null }
        ]
    };
    fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2));
}

// Ensure complaints file exists
if (!fs.existsSync(complaintsPath)) {
    fs.writeFileSync(complaintsPath, JSON.stringify({ complaints: [] }, null, 2));
}

// ========== LOGIN ==========
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const data = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(data).users;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ success: true, role: user.role, name: user.name, rollNo: user.rollNo || '' });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// ========== GET ALL STUDENTS ==========
app.get('/api/students', (req, res) => {
    const data = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(data).users;
    const students = users.filter(u => u.role === 'student');
    res.json({ students: students });
});

// ========== ADD STUDENT ==========
app.post('/api/students/add', (req, res) => {
    const { name, rollNo, email } = req.body;
    
    const data = fs.readFileSync(usersPath, 'utf8');
    const usersData = JSON.parse(data);
    
    const newStudent = {
        id: Date.now().toString(),
        name: name,
        rollNo: rollNo,
        email: email,
        password: "123456",
        role: "student"
    };
    
    usersData.users.push(newStudent);
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    
    res.json({ success: true, message: "Student added", student: newStudent });
});

// ========== DELETE STUDENT ==========
app.delete('/api/students/delete/:id', (req, res) => {
    const { id } = req.params;
    const data = fs.readFileSync(usersPath, 'utf8');
    const usersData = JSON.parse(data);
    usersData.users = usersData.users.filter(u => u.id !== id);
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    res.json({ success: true, message: "Student deleted" });
});

// ========== SUBMIT COMPLAINT ==========
app.post('/api/complaint', (req, res) => {
    const { studentName, studentRollNo, type, description, priority } = req.body;
    const date = new Date().toISOString().split('T')[0];
    
    const data = fs.readFileSync(complaintsPath, 'utf8');
    const complaints = JSON.parse(data);
    
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
    fs.writeFileSync(complaintsPath, JSON.stringify(complaints, null, 2));
    
    res.json({ success: true, message: 'Complaint submitted', complaint: newComplaint });
});

// ========== GET ALL COMPLAINTS ==========
app.get('/api/complaints/all', (req, res) => {
    const data = fs.readFileSync(complaintsPath, 'utf8');
    const complaints = JSON.parse(data);
    res.json({ complaints: complaints.complaints });
});

// ========== GET COMPLAINTS BY STUDENT ==========
app.get('/api/complaints/:studentName', (req, res) => {
    const { studentName } = req.params;
    const data = fs.readFileSync(complaintsPath, 'utf8');
    const complaints = JSON.parse(data);
    const studentComplaints = complaints.complaints.filter(c => c.studentName === studentName);
    res.json({ complaints: studentComplaints });
});

// ========== RESOLVE COMPLAINT ==========
app.put('/api/complaint/resolve/:id', (req, res) => {
    const { id } = req.params;
    const data = fs.readFileSync(complaintsPath, 'utf8');
    const complaints = JSON.parse(data);
    const complaint = complaints.complaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = 'resolved';
        fs.writeFileSync(complaintsPath, JSON.stringify(complaints, null, 2));
        res.json({ success: true, message: 'Complaint resolved' });
    } else {
        res.json({ success: false, message: 'Complaint not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});