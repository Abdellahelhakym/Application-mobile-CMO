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
    const data = req.body.data || {};

    // 1. Récupération de l'entreprise
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

            // 2. Formatage des dates
            let mysqlStartDate = null;
            let mysqlEndDate = null;

            if (data.startDate) {
                mysqlStartDate = data.startDate.split('T')[0];
            }

            if (data.endDate) {
                mysqlEndDate = data.endDate.split('T')[0];
            }

            // 3. Calcul de la durée uniquement en jours (ex: "517 jours")
            let calculDuree = '';
            if (data.startDate && data.endDate) {
                const start = new Date(data.startDate);
                const end = new Date(data.endDate);

                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    calculDuree = `${diffDays} jours`;
                }
            } else if (mysqlStartDate) {
                calculDuree = 'Non définie';
            }

            // 4. Détection des permis
            const permisStr = data.drivingLicense || '';
            const permisB = permisStr.includes('B') ? 1 : 0;
            const permisC1 = permisStr.includes('C1') ? 1 : 0;
            const permisC1E = permisStr.includes('C1E') ? 1 : 0;
            const permisCE = permisStr.includes('CE') ? 1 : 0;

            // 5. Adresse IP (reçue dans le body ou via les headers)
            const clientIp = req.body.ip_adresse || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

            // 6. Mappage mis à jour
            const payload = {
                id_societe: idEmployer,
                nom_responsable: responsable,
                adresse: data.address || '',
                ville: '', // Force la ville à vide
                code_postal: '',
                intitule_poste: data.jobTitle || '',
                fonction_essentielle: data.comments || '', // Stocke comments dans fonction_essentielle
                competence_connaiss: '',
                contrat: data.jobType || '',
                duree: calculDuree, // Format "X jours"
                date_besoin: mysqlStartDate,
                date_fin: mysqlEndDate,
                lieu_travail: '',
                lieu_travail2: data.mobility || '',
                nbr_poste: data.positions || 1,
                permis_b: permisB,
                permis_c1: permisC1,
                permis_c1e: permisC1E,
                permis_ce: permisCE,
                commentaire: data.description || '', // Stocke description dans commentaire
                commentaire2: '', // commentaire2 vaut ""
                statut_fiche: 1,
                date_demande: new Date().toISOString().split('T')[0],
                salaire_proposer: data.salary || '',
                logement: data.housing || 'Non',
                permis: data.drivingLicense || '',
                id_user: idEmployer,
                ip_adresse: clientIp,
                deleted: 0
            };

            // 7. Validation des champs obligatoires
            if (!payload.intitule_poste || !payload.contrat) {
                return res.status(400).json({ error: 'Job title and contract type are required' });
            }

            // 8. Récupération de l'ID max
            db.query(
                'SELECT MAX(id) AS max_id FROM fiche_poste',
                (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    const maxIdNumber = Number(results[0]?.max_id || 0);
                    const nextFicheId = `0000-Cmd-${maxIdNumber + 1}`;

                    // 9. Requête d'insertion
                    db.query(
                        `INSERT INTO fiche_poste (
                            id_fiche_poste,
                            id_societe,
                            nom_responsable,
                            adresse,
                            ville,
                            code_postal,
                            intitule_poste,
                            fonction_essentielle,
                            competence_connaiss,
                            contrat,
                            duree,
                            date_besoin,
                            date_fin,
                            lieu_travail,
                            lieu_travail2,
                            nbr_poste,
                            permis_b,
                            permis_c1,
                            permis_c1e,
                            permis_ce,
                            commentaire,
                            commentaire2,
                            statut_fiche,
                            date_demande,
                            salaire_proposer,
                            logement,
                            permis,
                            id_user,
                            ip_adresse,
                            deleted
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            nextFicheId,
                            payload.id_societe,
                            payload.nom_responsable,
                            payload.adresse,
                            payload.ville,
                            payload.code_postal,
                            payload.intitule_poste,
                            payload.fonction_essentielle,
                            payload.competence_connaiss,
                            payload.contrat,
                            payload.duree,
                            payload.date_besoin,
                            payload.date_fin,
                            payload.lieu_travail,
                            payload.lieu_travail2,
                            payload.nbr_poste,
                            payload.permis_b,
                            payload.permis_c1,
                            payload.permis_c1e,
                            payload.permis_ce,
                            payload.commentaire,
                            payload.commentaire2,
                            payload.statut_fiche,
                            payload.date_demande,
                            payload.salaire_proposer,
                            payload.logement,
                            payload.permis,
                            payload.id_user,
                            payload.ip_adresse,
                            payload.deleted
                        ],
                        (insertErr, result) => {
                            if (insertErr) {
                                console.error('Error inserting fiche_poste:', insertErr);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            return res.json({
                                message: 'Offer created successfully',
                                id: result.insertId,
                                id_fiche_poste: nextFicheId
                            });
                        }
                    );
                }
            );
        }
    );
});

module.exports = createOffer;