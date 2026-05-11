const express = require('express');
const db = require('../db');
const dashboard = express.Router();

dashboard.get('/', (req, res) => {
    res.send('Dashboard route');
});

dashboard.post('/', (req, res) => {
    try {
        const { token_id } = req.body;
        console.log('Received dashboard request with token_id');

        if (!token_id) {
            return res.status(400).json({
                error: 'token_id is required'
            });
        }

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

                        if (candidatResults.length === 0) {
                            return res.status(404).json({
                                error: 'Candidat not found'
                            });
                        }

                        const verifier = candidatResults[0].verifier;

                        const dashboardData = {

                            user: {
                                nom: pseudo,
                                verification: verifier,
                            },

                            inscriptionStatus: {
                                informations: 1,
                                attestations: 1,
                                competences: 0,
                            },

                            candidatureStats: {
                                sent: 2,
                                replied: 0,
                                favorites: 1,
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
                                { name: "certificat_travail" },
                            ],
                        };

                        res.json(dashboardData);
                    }
                );
            }
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = dashboard;