const express = require('express');
const db = require('../db');

const createOffer = express.Router();

createOffer.get('/', (req, res) => {
    res.send('Create Offer route');
});

createOffer.post('/commande', (req, res) => {
    console.log('Received create offer request with body:', req.body);
    const token_id = req.body.token_id;
    
    const pseudo = req.body.psaudo ;
    const data = req.body.data || {};

    if (!token_id) {
        return res.status(400).json({ error: 'Token ID is required' });
    }

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
            
                    const payload = {
                        token_id,
                        pseudo,
                        intitule_poste: data.jobTitle,
                        contrat: data.jobType,
                        duree: data.startDate && data.endDate ? `${data.startDate} - ${data.endDate}` : data.startDate || data.endDate || null,
                        date_besoin: data.startDate,
                        date_fin: data.endDate,
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
                                payload.pseudo,
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

        });


});


module.exports = createOffer;
