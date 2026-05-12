const express = require('express');
const db = require('../db');

const dashboard = express.Router();

dashboard.get('/', (req, res) => {
    res.send('Dashboard route');
});

dashboard.post('/', (req, res) => {

    const { token_id } = req.body;

    console.log('Received dashboard request with token_id');

    // Vérification token
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    // USER
    db.query(
        'SELECT pseudo FROM users WHERE token_id = ?',
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
                'SELECT verifier FROM cmo_candidats WHERE token_id = ?',
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
                        'SELECT COUNT(*) AS total FROM postuler WHERE token_id = ?',
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
                                'SELECT COUNT(*) AS total FROM postuler WHERE statut = 1 AND token_id = ?',
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
                                        'SELECT COUNT(*) AS total FROM favoris_offres WHERE token_id = ?',
                                        [token_id],
                                        (err, favoritesResults) => {

                                            if (err) {
                                                console.error(err);
                                                return res.status(500).json({
                                                    error: 'Internal server error'
                                                });
                                            }

                                            const favoritesCount = favoritesResults[0].total;

                                            // DATA FINAL
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

                                                sectors: [
                                                    { name: "Agriculture" },
                                                    { name: "Transport" },
                                                    { name: "BTP" },
                                                    { name: "Santé" },
                                                ],

                                                documents: [
                                                    { name: "cni" },
                                                    { name: "passeport" },
                                                    { name: "carte_securite_sociale" },
                                                    { name: "titre_sejour" },
                                                    { name: "permis_conduire" },
                                                    { name: "hello_test" },
                                                    { name: "certificat_travail" },
                                                ],
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

module.exports = dashboard;