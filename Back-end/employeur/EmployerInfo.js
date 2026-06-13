const express = require('express');
const db = require('../db');

const EmployerInfo = express.Router();

const auth = require('../middleware/auth');


EmployerInfo.get('/', auth, (req, res) => {
    res.send('Employer Info route');
});

EmployerInfo.post('/getInfo', auth, (req, res) => {

   const token_id = req.user.token_id;
    console.log('Received employer info request with token_id');
   

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

EmployerInfo.post('/updateInfo', auth, (req, res) => {
    // 1. On récupère token_id et l'objet data depuis le body
    const { data } = req.body;
 const token_id = req.user.token_id;
    if ( !data) {
        return res.status(400).json({ error: ' Data are required' });
    }

    // 2. On extrait les colonnes directement depuis l'objet data
    const {
        raison_social,
        prenom_responsable,
        responsable,
        siren,
        siret,
        num_tel,
        num_tel2,
        adresse,
        code_postal,
        ville,
        pays_origine
    } = data;

    // 3. Ta requête SQL UPDATE
    const sqlQuery = `
        UPDATE mco_entreprise 
        SET 
            raison_social = ?, 
            prenom_responsable = ?, 
            responsable = ?, 
            siren = ?, 
            siret = ?, 
            num_tel = ?, 
            num_tel2 = ?, 
            adresse = ?, 
            code_postal = ?, 
            ville = ?, 
            pays_origine = ?
        WHERE token_id = ? AND deleted = 0
    `;

    // 4. Les paramètres envoyés dans le bon ordre
    const queryParams = [
        raison_social,
        prenom_responsable,
        responsable,
        siren,
        siret,
        num_tel,
        num_tel2,
        adresse,
        code_postal,
        ville,
        pays_origine,
        token_id // Utilisé pour le WHERE
    ];

    db.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            console.error("Erreur d'update mco_entreprise :", err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Employer not found' });
        }
        
        res.json({ message: 'Employer info updated successfully' });
    });
});

module.exports = EmployerInfo;