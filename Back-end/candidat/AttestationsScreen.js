const express = require('express');
const db = require('../db');

const AttestationsScreen = express.Router();

AttestationsScreen.get('/', (req, res) => {
    res.send('Attestations route');
}
);


AttestationsScreen.post('/', (req, res) => {

    const { token_id } = req.body;

    console.log('Received attestations request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
    `
    SELECT 
        dm.id,
        dm.token_id_cand,
        dm.etats,

        ta.id AS id_attestation,
        ta.titre,
        ta.titre2,

        ca.id AS id_categorie,
        ca.titre AS categorie

    FROM documents_manquants dm

    INNER JOIN titre_attestation ta
        ON dm.id_attestation = ta.id

    INNER JOIN categorie_attestation ca
        ON ta.id_categorie_attestation = ca.id

    WHERE dm.deleted = 0
    AND ta.deleted = 0
    AND ca.deleted = 0
    AND dm.token_id_cand = ?
    `,
    [token_id],
    (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);
    }
);




});

module.exports = AttestationsScreen;
