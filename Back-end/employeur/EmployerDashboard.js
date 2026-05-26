const express = require('express');
const db = require('../db');

const EmployerDashboard = express.Router();

EmployerDashboard.get('/', (req, res) => {
    res.send('Employer Dashboard route');
});

module.exports = EmployerDashboard;
