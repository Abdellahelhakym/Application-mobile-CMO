const express = require('express');
const db = require('../db');

const subscription = express.Router();

subscription.get('/', (req, res) => {
    res.send('Subscription route');
})
subscription.post('/historique', (req, res) => {
    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'Token ID is required' });
    }

    db.query(
        'SELECT * FROM histo_facturation WHERE token_id = ? AND deleted = 0',
        [token_id],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database error' });
            }

            const historique = results;

            db.query(
                'SELECT id_formule FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
                [token_id],
                (error, results) => {
                    if (error) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    const id_formule = results[0]?.id_formule;

                    let pack;

                    switch (id_formule) {
                        case 1:
                            pack = 'START RECRUT';
                            break;
                        case 2:
                            pack = 'PRO RECRUT';
                            break;
                        case 3:
                            pack = 'FULL RECRUT';
                            break;
                        case 4:
                            pack = 'DEVIS PERSONNALISÉ';
                            break;
                        default:
                            pack = 'Unknown';
                    }

                    res.json({
                        historique,
                        pack
                    });
                }
            );
        }
    );
});



module.exports = subscription;