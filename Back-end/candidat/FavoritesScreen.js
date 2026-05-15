const express = require('express');
const db = require('../db');

const favorites = express.Router();

favorites.get('/', (req, res) => {
    res.send('Favorites route');
});

favorites.post('/', (req, res) => {

    const { token_id } = req.body;

    console.log('Received favorites request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        'SELECT id_offre FROM favoris_offres WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (results.length === 0) {
                return res.json([]);
            }

            const offerIds = results.map(item => item.id_offre);

            const query = `
                SELECT 
                    o.id,
                    o.titre,
                    o.type_contrat,
                    o.duree,
                    o.lieu,
                    o.descr,
                    o.date,

                    c.titre AS categorie

                FROM offres_emploi o

                INNER JOIN metier m 
                    ON o.id_metiers = m.id

                INNER JOIN sous_categorie_metier sc 
                    ON m.id_sous = sc.id

                INNER JOIN categorie_metier c 
                    ON sc.id_categorie = c.id

                WHERE o.id IN (?)
                AND o.deleted = 0
            `;

            db.query(query, [offerIds], (err, offers) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Internal server error'
                    });
                }
                console.log('Favorites offers retrieved successfully' , offers);

                return res.json(offers);
            });
        }
    );
});

module.exports = favorites;