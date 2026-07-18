const express = require('express');
const db = require('../db');

const myOffers = express.Router();

const auth = require('../middleware/auth');

myOffers.get('/', auth, (req, res) => {
    res.send('My Offers route');
});

myOffers.post('/commandes', auth, (req, res) => {

    const token_id = req.user.token_id;

   
        db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
           const idEmployer = results[0]?.id;
            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
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

                    db.query(sql, [idEmployer], (err, results) => {

                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Internal server error' });
                        }

                        res.json(results);
                    });

        }); 

 
});


myOffers.post('/devis', auth, (req, res) => {
    const token_id = req.user.token_id;

    // 1. Retrieve the company
    db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;

            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            // 2. Get all job IDs linked to the company
            db.query(
                `SELECT id_fiche_poste
                 FROM fiche_poste
                 WHERE id_societe = ? AND deleted = 0`,
                [idEmployer],
                (err, devisResults) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    const fichePosteIds = devisResults.map(row => row.id_fiche_poste);

                    if (fichePosteIds.length === 0) {
                        return res.json([]);
                    }

                    // 3. Get all quotes for those job IDs
                    db.query(
                        `SELECT *
                         FROM devis_fiche
                         WHERE id_fiche_poste IN (?) AND deleted = 0`,
                        [fichePosteIds],
                        (err, fichePosteResults) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            return res.json(fichePosteResults);
                        }
                    );
                }
            );
        }
    );
});


myOffers.post('/AccepterRefuserDevis', auth, (req, res) => {

    const token_id = req.user.token_id;
    const { finaliser, id_fiche_post, id_devis } = req.body;
    
    if (!finaliser || !id_fiche_post || !id_devis) {
        return res.status(400).json({ error: 'Champs manquants' });
    }

    db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            const idEmployer = results[0].id;

            // Mise à jour fiche poste
            db.query(
                'UPDATE fiche_poste SET statut_fiche = ? WHERE id_fiche_poste = ? AND deleted = 0',
                [finaliser, id_fiche_post],
                (err) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    // Historique
                    db.query(
                        `INSERT INTO historiq_statut_fiche
                        (
                            id_fiche_poste,
                            type_user,
                            id_user,
                            id_societe,
                            statut_fiche,
                            date_heure,
                            deleted
                        )
                        VALUES (?, '1', ?, ?, ?, NOW(), 0)`,
                        [id_fiche_post, idEmployer, token_id, finaliser],
                        (err) => {

                            if (err) {
                                console.error(err);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            // Mise à jour devis
                            db.query(
                                'UPDATE devis_fiche SET statut = ? WHERE id = ? AND deleted = 0',
                                [finaliser, id_devis],
                                (err) => {

                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({ error: 'Internal server error' });
                                    }

                                    return res.status(200).json({
                                        success: true,
                                        message: 'Devis accepté avec succès'
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

module.exports = myOffers;