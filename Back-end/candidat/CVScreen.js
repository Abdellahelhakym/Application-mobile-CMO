const express = require('express');
const db = require('../db');

const CVScreen = express.Router();

CVScreen.get('/', (req, res) => {
    res.send('CV Screen route');
});

//---------------------------------Informations---------------------------------
CVScreen.post('/Informations', (req, res) => {
    const { token_id } = req.body;

    console.log('Received CV Informations request with token_id');

    db.query('SELECT * FROM cmo_candidats WHERE token_id = ? and deleted = 0', [token_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);
    });

});



module.exports = CVScreen;
