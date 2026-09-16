const express = require('express');
const db = require('../db');

const dashboard = express.Router();
const auth = require('../middleware/auth');
const { decodeObject, decodeArray } = require('../middleware/encoding');

dashboard.get('/', auth, (req, res) => {
    res.send('Dashboard route v2');
});

dashboard.post('/', auth, (req, res) => {

    const token_id = req.user.token_id;

    console.log('Received dashboard request with token_id');

    // CANDIDAT
    db.query(
        `SELECT 
            nom,
            prenom,
            verifier,
            CONCAT(prenom, ' ', nom) AS pseudo
         FROM cmo_candidats
         WHERE token_id = ? AND deleted = 0`,
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

            const candidat = candidatResults[0];

            const pseudo = candidat.pseudo;

            const verifier = candidat.verifier || 0;

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

                                            const documentsManquants =
                                                (documentsManquantsResults || []).map(
                                                    doc => doc.titre_attestation
                                                );

                                            const dashboardData = {

                                                user: {
                                                    nom: pseudo
                                                },

                                                inscriptionStatus: {
                                                    verification: verifier
                                                },

                                                candidatureStats: {
                                                    sent: sentCount,
                                                    replied: repliedCount,
                                                    favorites: favoritesCount
                                                },

                                                documentsManquants:
                                                    documentsManquants
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


dashboard.post('/pseudo', auth, (req, res) => {
    const token_id = req.user.token_id;

    db.query(
        `SELECT CONCAT(prenom, ' ', nom) AS pseudo
         FROM cmo_candidats
         WHERE token_id = ? AND deleted = 0`,
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: 'Candidat not found'
                });
            }

            const decodedResult = decodeObject(results[0]);

            return res.json({
                pseudo: decodedResult.pseudo
            });
        }
    );
});


dashboard.post('/secteurs', auth, (req, res) => {

    const id = req.user.token_id;

    db.query(
        `
        SELECT COUNT(pp.id) AS postuler, c.id as titre
        FROM postuler AS pp
        JOIN offres_emploi AS o ON pp.id_offre = o.id
        JOIN metiers AS m ON o.id_metiers = m.id
        JOIN categorie_metier AS c ON m.id_cat = c.id
        WHERE pp.deleted = '0' and pp.token_id = ?
        GROUP BY c.id
        `,
        [id],
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
dashboard.post('/categorieMetier', auth, (req, res) => {

    const id = req.user.token_id;

    db.query(
        `
        SELECT * FROM categorie_metier_app
        WHERE deleted = '0'
        `,
        [id],
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


dashboard.post('/telAgent', auth, (req, res) => {
    const token_id = req.user.token_id;

    db.query(
        `SELECT id_agent_digital
         FROM cmo_candidats
         WHERE token_id = ? AND deleted = 0
         LIMIT 1`,
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (results.length === 0) {
                return res.status(200).json(null);
            }

            const id_agent_digital = results[0].id_agent_digital;

            // Aucun agent affecté
            if (!id_agent_digital) {
                return res.status(200).json(null);
            }

            db.query(
                `SELECT *
                 FROM userss
                 WHERE id = ?
                 LIMIT 1`,
                [id_agent_digital],
                (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    // L'agent n'existe pas
                    if (results.length === 0) {
                        return res.status(200).json(null);
                    }

                    return res.status(200).json(results[0]);
                }
            );
        }
    );
});



module.exports = dashboard;