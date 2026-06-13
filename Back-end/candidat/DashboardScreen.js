const express = require('express');
const db = require('../db');

const dashboard = express.Router();
const auth = require('../middleware/auth');

dashboard.get('/', auth, (req, res) => {
    res.send('Dashboard route');
});

dashboard.post('/', auth, (req, res) => {

const token_id = req.user.token_id;

    console.log('Received dashboard request with token_id');

    
    // USER
    db.query(
        'SELECT pseudo FROM users WHERE token_id = ? AND deleted = 0',
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

            // CANDIDAT
            db.query(
                'SELECT verifier FROM cmo_candidats WHERE token_id = ? AND deleted = 0',
                [token_id],
                (err, candidatResults) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    const verifier =
                        candidatResults.length > 0
                            ? candidatResults[0].verifier
                            : 0;

                    // TOTAL CANDIDATURES
                    db.query(
                        'SELECT COUNT(*) AS total FROM postuler WHERE token_id = ? AND deleted = 0',
                        [token_id],
                        (err, sentResults) => {

                            if (err) {
                                console.error(err);
                                return res.status(500).json({
                                    error: 'Internal server error'
                                });
                            }

                            const sentCount = sentResults[0].total;

                            // CANDIDATURES REPONDUES
                            db.query(
                                'SELECT COUNT(*) AS total FROM postuler WHERE statut = 1 AND token_id = ? AND deleted = 0',
                                [token_id],
                                (err, repliedResults) => {

                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({
                                            error: 'Internal server error'
                                        });
                                    }

                                    const repliedCount = repliedResults[0].total;

                                    // FAVORIS
                                    db.query(
                                        'SELECT COUNT(*) AS total FROM favoris_offres WHERE token_id = ? AND deleted = 0',
                                        [token_id],
                                        (err, favoritesResults) => {

                                            if (err) {
                                                console.error(err);
                                                return res.status(500).json({
                                                    error: 'Internal server error'
                                                });
                                            }

                                            const favoritesCount = favoritesResults[0].total;

                                            // DOCUMENTS MANQUANTS
                                            db.query(
                                                    'SELECT titre_attestation FROM documents_manquants WHERE token_id_cand = ? AND deleted = 0',
                                                    [token_id],
                                                    (err, documentsManquantsResults) => {

                                                        if (err) {
                                                            console.error(err);
                                                            return res.status(500).json({
                                                                error: 'Internal server error'
                                                            });
                                                        }

                                                        const documentsManquants = (documentsManquantsResults || []).map(
                                                            doc => doc.titre_attestation
                                                        );
                                                        

                                                        const dashboardData = {

                                                            user: {
                                                                nom: pseudo,
                                                            },

                                                            inscriptionStatus: {
                                                                verification: verifier,
                                                            },

                                                            candidatureStats: {
                                                                sent: sentCount,
                                                                replied: repliedCount,
                                                                favorites: favoritesCount,
                                                            },

                                                            

                                                            documentsManquants: documentsManquants
                                                        };

                                                        return res.json(dashboardData);

                                                    }
                                                );

                                }
                            );

                        }
                    );

                }
            );

        }
    );
        });
});


dashboard.post('/secteurs', auth, (req, res) => {

   const token_id = req.user.token_id;

    console.log('Received secteurs request with token_id:');


    db.query(
        `
        SELECT 
            c.id AS id_categorie,
            c.titre AS categorie,
            COUNT(p.id) AS total_candidatures

        FROM postuler p

        INNER JOIN offres_emploi o 
            ON p.id_offre = o.id

        INNER JOIN metier m 
            ON o.id_metiers = m.id

        INNER JOIN sous_categorie_metier sc 
            ON m.id_sous = sc.id

        INNER JOIN categorie_metier c 
            ON sc.id_categorie = c.id

        WHERE p.token_id = ?
        AND p.deleted = 0
        AND o.deleted = 0
        AND m.deleted = 0
        AND sc.deleted = 0
        AND c.deleted = 0

        GROUP BY c.id, c.titre
        ORDER BY total_candidatures DESC
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
module.exports = dashboard;