const express = require('express');
const db = require('../db');

const createOffer = express.Router();
const auth = require('../middleware/auth');
createOffer.get('/', auth, (req, res) => {
    res.send('Create Offer route');
});

createOffer.post('/commande', auth, (req, res) => {
    console.log('Received create offer request with body:', req.body);
    const token_id = req.user.token_id;
    
    // Les dates arrivent sous forme d'objets ou chaînes ISO du type "2026-07-06T13:22:00.000Z"
    const data = req.body.data || {};

    db.query(
        'SELECT id, responsable FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            const idEmployer = results[0]?.id;
            const responsable = results[0]?.responsable;
            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            // 📅 1. Formatage des dates pour MySQL (YYYY-MM-DD)
            let mysqlStartDate = null;
            let mysqlEndDate = null;

            if (data.startDate) {
                mysqlStartDate = new Date(data.startDate).toISOString().split('T')[0];
            }
            if (data.endDate) {
                mysqlEndDate = new Date(data.endDate).toISOString().split('T')[0];
            }

            // ⏱️ 2. Calcul automatique et propre de la durée
            let calculDuree = null;
            if (data.startDate && data.endDate) {
                const start = new Date(data.startDate);
                const end = new Date(data.endDate);
                
                // Différence en jours
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 30) {
                    const months = Math.round(diffDays / 30);
                    calculDuree = `${months} mois`;
                } else {
                    calculDuree = `${diffDays} jours`;
                }
            } else if (mysqlStartDate) {
                calculDuree = "Non définie";
            }

            const payload = {
                token_id,
                responsable,
                intitule_poste: data.jobTitle,
                contrat: data.jobType,
                duree: calculDuree,
                date_besoin: mysqlStartDate,
                date_fin: mysqlEndDate,
                lieu_travail: data.address,
                nbr_poste: data.positions,
                salaire_proposer: data.salary,
                logement: data.housing,
                permis: data.drivingLicense,
                commentaire: data.comments,
                commentaire2: data.description,
            };

            if (!payload.intitule_poste || !payload.contrat || !payload.lieu_travail) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            db.query('SELECT MAX(id) AS max_id FROM fiche_poste', (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const maxIdNumber = Number(results[0]?.max_id || 0);
                const nextFicheId = `000-Cmd-${maxIdNumber + 1}`;

                db.query(
                    'INSERT INTO fiche_poste (id_societe, id_fiche_poste, intitule_poste, nom_responsable, contrat, duree, date_besoin, date_fin, lieu_travail, nbr_poste, salaire_proposer, logement, permis, commentaire, commentaire2 , statut_fiche, deleted , id_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ? )',
                    [
                        idEmployer,
                        nextFicheId,
                        payload.intitule_poste,
                        payload.responsable,
                        payload.contrat,
                        payload.duree,
                        payload.date_besoin,
                        payload.date_fin,
                        payload.lieu_travail,
                        payload.nbr_poste,
                        payload.salaire_proposer,
                        payload.logement,
                        payload.permis,
                        payload.commentaire,
                        payload.commentaire2,
                        1,
                        0, // deleted
                        idEmployer
                    ],
                    (insertErr, result) => {
                        if (insertErr) {
                            console.error(insertErr);
                            return res.status(500).json({ error: 'Internal server error' });
                        }
                        res.json({ message: 'Offer created successfully', id: result.insertId });
                    }
                );
            });
        }
    );
});


module.exports = createOffer;
