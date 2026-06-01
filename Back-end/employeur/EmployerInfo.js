const express = require('express');
const db = require('../db');

const EmployerInfo = express.Router();

EmployerInfo.get('/', (req, res) => {
    res.send('Employer Info route');
});

EmployerInfo.post('/getInfo', (req, res) => {

    const { token_id } = req.body;
    console.log('Received employer info request with token_id');
    if (!token_id) {
        return res.status(400).json({ error: 'Token ID is required' });
    }
    db.query(
        'SELECT * FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Employer not found' });
            }
            const employerInfo = results[0];
            res.json(employerInfo);
        }
    );

});

module.exports = EmployerInfo;