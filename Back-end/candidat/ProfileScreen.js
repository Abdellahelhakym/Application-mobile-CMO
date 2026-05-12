const express = require('express');
const db = require('../db');
const profile = express.Router();

profile.get('/', (req, res) => {
    res.send('Profile route');
    
});

profile.post('/', (req, res) => {

    const { token_id } = req.body;

    db.query(
        'SELECT  pseudo  FROM users WHERE token_id = ?',
        [token_id],
        (err, userResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            if (userResults.length === 0) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            const pseudo = userResults[0].pseudo;
            
            db.query(
                'SELECT email , tel , pays FROM cmo_candidats WHERE token_id = ?',
                [token_id],

                (err, candidatResults) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }
                    if (candidatResults.length === 0) {
                        return res.status(404).json({
                            error: 'Candidat not found'
                        });
                    }
                    const { email, tel, pays } = candidatResults[0];
                    res.json({ pseudo, email, tel, pays });
                }
            );
        }
    );
});

module.exports = profile;