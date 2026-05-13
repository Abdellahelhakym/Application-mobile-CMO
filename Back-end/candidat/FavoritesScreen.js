const express = require('express');
const db = require('../db');

const favorites = express.Router();

favorites.get('/', (req, res) => {
    res.send('Favorites route');
});

favorites.post('/', (req, res) => {

    const { token_id } = req.body;

    console.log('Received favorites request with token_id:', token_id);

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

            // Extraire les IDs
            const offerIds = results.map(item => item.id_offre);

            db.query(
                'SELECT * FROM offre_emplois WHERE id IN (?)',
                [offerIds],
                (err, offers) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    return res.json(offers);
                }
            );
        }
    );
});

module.exports = favorites;