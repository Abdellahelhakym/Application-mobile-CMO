const express = require('express');
const db = require('../db');

const myOffers = express.Router();

myOffers.get('/', (req, res) => {
    res.send('My Offers route');
});

myOffers.post('/commandes', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'Token ID is required' });
    }

    const sql = `
        SELECT
            f.*,
            s.titre AS statut_titre,
            m.titre AS metier,
            sc.titre AS sous_categorie,
            c.titre AS categorie
        FROM fiche_poste f
        LEFT JOIN statut_fiche_poste s ON s.id = f.statut_fiche
        LEFT JOIN metier m ON m.titre = f.intitule_poste
        LEFT JOIN sous_categorie_metier sc ON sc.id = m.id_sous
        LEFT JOIN categorie_metier c ON c.id = sc.id_categorie
        WHERE f.deleted = 0
        AND f.id_societe = ?
        AND f.statut_fiche IN (1,2,3)
    `;

    db.query(sql, [token_id], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json(results);
    });
});

myOffers.post('/devis', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'Token ID is required' });
    }

        db.query(
            `SELECT d.*, s.titre AS statut_titre
             FROM devis_fiche d
             INNER JOIN fiche_poste f
                 ON d.id_fiche_poste COLLATE utf8mb4_general_ci = f.id_fiche_poste COLLATE utf8mb4_general_ci
             LEFT JOIN statut_fiche_poste s ON s.id = f.statut_fiche
             WHERE d.deleted = '0'
                 AND f.id_societe = ?`,
            [token_id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.json(results);
            }
        );


});


module.exports = myOffers;