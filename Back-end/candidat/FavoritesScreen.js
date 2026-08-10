
const express = require('express');
const db = require('../db');

const favorites = express.Router();
const auth = require('../middleware/auth');


// ======================================================
// TEST ROUTE
// ======================================================

favorites.get('/', auth, (req, res) => {
    res.send('Favorites route v2');
});


// ======================================================
// RÉCUPÉRER LES OFFRES FAVORITES
// ======================================================

favorites.post('/', auth, (req, res) => {

    const token_id = req.user.token_id;

    console.log(
        'Received favorites request with token_id:',
        token_id
    );

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    const query = `
        SELECT
            o.id,
            o.titre,
            o.type_contrat,
            o.duree,
            o.sous_descr,
            o.lieu,

            m.titre AS metier_titre,
            m.icone AS metier_icone,

            r.titre AS region_titre

        FROM favoris_offres f

        INNER JOIN offres_emploi o
            ON o.id = f.id_offre
            AND o.deleted = '0'

        LEFT JOIN metiers m
            ON m.id = o.id_metiers
            AND m.deleted = '0'

        LEFT JOIN regions r
            ON r.id = o.lieu
            AND r.deleted = '0'

        WHERE f.token_id = ?
        AND f.deleted = '0'

        ORDER BY f.id DESC
    `;

    db.query(query, [token_id], (err, results) => {

        if (err) {
            console.error('Erreur SQL favorites:', err);

            return res.status(500).json({
                error: 'Internal server error'
            });
        }

       

        return res.json(results);
    });
});


module.exports = favorites;

