const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { decodeObject } = require('../middleware/encoding');

const profile = express.Router();

profile.get('/', (req, res) => {
    res.send('Profile route');
});

profile.post('/data', auth, (req, res) => {
    const token_id = req.user.token_id;

    db.query(
        `SELECT 
            CONCAT(c.prenom, ' ', c.nom) AS pseudo,
            c.email,
            c.tel,
            c.pays
         FROM cmo_candidats c
         WHERE c.token_id = ? AND c.deleted = 0`,
        [token_id],
        (err, results) => {
            if (err) {
                console.error('Erreur SELECT Profile data :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Candidat not found' });
            }

            // Décodage des caractères spéciaux dans l'objet résultat (pseudo, pays, etc.)
            const decodedData = decodeObject(results[0]);

            return res.json({
                pseudo: decodedData.pseudo,
                email: decodedData.email,
                tel: decodedData.tel,
                pays: decodedData.pays
            });
        }
    );
});

profile.get('/pays_autoriser', (req, res) => {
    db.query('SELECT * FROM pays_autoriser WHERE deleted = 0', (err, results) => {
        if (err) {
            console.error('Erreur SELECT pays_autoriser :', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const fixedResults = results.map(item => decodeObject(item));
        return res.json(fixedResults);
    });
});

module.exports = profile;