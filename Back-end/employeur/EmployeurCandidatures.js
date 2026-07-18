const express = require('express');
const db = require('../db');

const EmployerCandidatures = express.Router();
const auth = require('../middleware/auth');

EmployerCandidatures.get('/', auth, (req, res) => {
    res.send('Employer Candidatures route');
});

EmployerCandidatures.post('/getCandidatures', auth, (req, res) => {
    const token_id = req.user.token_id;

    db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;

            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            const sql = `
                SELECT
                    c.id AS candidat_id,
                    c.*,
                    f.id_fiche_poste,
                    f.intitule_poste,
                    a.date_aff,
                    a.id AS id_aff,
                    a.statut_aff,
                    m.id AS metier_id,
                    m.titre AS metier_titre
                FROM cmo_candidats c
                INNER JOIN affectation a ON a.id_candidat = c.id
                INNER JOIN fiche_poste f ON f.id_fiche_poste = a.id_fiche_poste
                LEFT JOIN secteurs_candidats sc ON sc.token_id_cand = c.token_id
                LEFT JOIN metier m ON m.id = sc.id_metier
                WHERE c.deleted = 0
                  AND c.statut_candidat <> 3
                  AND c.etat_affect = 1
                  AND a.deleted = 0
                  AND a.statut_aff IN (1,2,3,4)
                  AND f.id_societe = ?;
            `;

            db.query(sql, [idEmployer], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const map = {};

                rows.forEach(row => {
                    if (!map[row.candidat_id]) {
                        map[row.candidat_id] = {
                            ...row,
                            id: row.candidat_id,
                            metiers: []
                        };
                    }

                    if (row.metier_id) {
                        const exists = map[row.candidat_id].metiers.find(
                            m => m.id === row.metier_id
                        );

                        if (!exists) {
                            map[row.candidat_id].metiers.push({
                                id: row.metier_id,
                                titre: row.metier_titre
                            });
                        }
                    }
                });

                const tokenIds = Object.values(map).map(c => c.token_id);

                if (tokenIds.length === 0) {
                    return res.json([]);
                }

                // 1. Récupération des Mobilités
                db.query(
                    `
                    SELECT
                        m.token_id_cand,
                        r.id AS id_region,
                        r.titre AS region
                    FROM mobilite_candidats m
                    INNER JOIN regions r ON r.id = m.id_region
                    WHERE m.deleted = 0
                      AND r.deleted = 0
                      AND m.token_id_cand IN (?);
                    `,
                    [tokenIds],
                    (err, mobilitesResults) => {
                        if (err) {
                            return res.status(500).json({ error: 'Internal server error' });
                        }

                        const mobilitesByCandidate = {};
                        mobilitesResults.forEach(mob => {
                            if (!mobilitesByCandidate[mob.token_id_cand]) {
                                mobilitesByCandidate[mob.token_id_cand] = [];
                            }
                            mobilitesByCandidate[mob.token_id_cand].push({
                                id_region: mob.id_region,
                                region: mob.region
                            });
                        });

                        Object.values(map).forEach(cand => {
                            cand.mobilites = mobilitesByCandidate[cand.token_id] || [];
                        });

                        // 2. AJOUT : Récupération du Parcours Scolaire (Expérience)
                        db.query(
                            `
                            SELECT
                                token_id,
                                id,
                                ecole,
                                diplome,
                                mois_debut,
                                annee_debut,
                                mois_obtention,
                                annee_obtention,
                                description
                            FROM expenreicenformations_scolaire
                            WHERE deleted = 0
                              AND token_id IN (?);
                            `,
                            [tokenIds],
                            (err, parcoursResults) => {
                                if (err) {
                                    return res.status(500).json({ error: 'Internal server error' });
                                }

                                const parcoursByCandidate = {};
                                parcoursResults.forEach(p => {
                                    if (!parcoursByCandidate[p.token_id]) {
                                        parcoursByCandidate[p.token_id] = [];
                                    }
                                    parcoursByCandidate[p.token_id].push({
                                        id: p.id,
                                        ecole: p.ecole,
                                        diplome: p.diplome,
                                        mois_debut: p.mois_debut,
                                        annee_debut: p.annee_debut,
                                        mois_obtention: p.mois_obtention,
                                        annee_obtention: p.annee_obtention,
                                        description: p.description
                                    });
                                });

                                Object.values(map).forEach(cand => {
                                    cand.parcours_scolaire = parcoursByCandidate[cand.token_id] || [];
                                });

                                // 3. Récupération des Documents Manquants
                                db.query(
                                    `
                                    SELECT token_id_cand, titre_attestation
                                    FROM documents_manquants
                                    WHERE deleted = 0
                                      AND token_id_cand IN (?);
                                    `,
                                    [tokenIds],
                                    (err, documentsManquantsResults) => {
                                        if (err) {
                                            return res.status(500).json({ error: 'Internal server error' });
                                        }

                                        const docsByCandidate = {};
                                        documentsManquantsResults.forEach(doc => {
                                            if (!docsByCandidate[doc.token_id_cand]) {
                                                docsByCandidate[doc.token_id_cand] = [];
                                            }
                                            docsByCandidate[doc.token_id_cand].push(doc.titre_attestation);
                                        });

                                        Object.values(map).forEach(cand => {
                                            cand.documents_manquants = docsByCandidate[cand.token_id] || [];
                                        });

                                        return res.json(Object.values(map));
                                    }
                                );
                            }
                        );
                    }
                );
            });
        }
    );
});

EmployerCandidatures.post('/getCandidaturesValide', auth, (req, res) => {
  const token_id = req.user.token_id;

    db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;

            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            const sql = `
                SELECT
                    c.id AS candidat_id,
                    c.*,
                    f.id_fiche_poste,
                    f.intitule_poste,
                    a.date_aff,
                    a.id AS id_aff,
                    a.statut_aff,
                    m.id AS metier_id,
                    m.titre AS metier_titre
                FROM cmo_candidats c
                INNER JOIN affectation a ON a.id_candidat = c.id
                INNER JOIN fiche_poste f ON f.id_fiche_poste = a.id_fiche_poste
                LEFT JOIN secteurs_candidats sc ON sc.token_id_cand = c.token_id
                LEFT JOIN metier m ON m.id = sc.id_metier
                WHERE c.deleted = 0
                  AND c.statut_candidat = 3
                  AND c.etat_affect = 1
                  AND a.deleted = 0
                  AND a.statut_aff IN (1,2,3,4)
                  AND f.id_societe = ?;
            `;

            db.query(sql, [idEmployer], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const map = {};

                rows.forEach(row => {
                    if (!map[row.candidat_id]) {
                        map[row.candidat_id] = {
                            ...row,
                            id: row.candidat_id,
                            metiers: []
                        };
                    }

                    if (row.metier_id) {
                        const exists = map[row.candidat_id].metiers.find(
                            m => m.id === row.metier_id
                        );

                        if (!exists) {
                            map[row.candidat_id].metiers.push({
                                id: row.metier_id,
                                titre: row.metier_titre
                            });
                        }
                    }
                });

                const tokenIds = Object.values(map).map(c => c.token_id);

                if (tokenIds.length === 0) {
                    return res.json([]);
                }

                // 1. Récupération des Mobilités
                db.query(
                    `
                    SELECT
                        m.token_id_cand,
                        r.id AS id_region,
                        r.titre AS region
                    FROM mobilite_candidats m
                    INNER JOIN regions r ON r.id = m.id_region
                    WHERE m.deleted = 0
                      AND r.deleted = 0
                      AND m.token_id_cand IN (?);
                    `,
                    [tokenIds],
                    (err, mobilitesResults) => {
                        if (err) {
                            return res.status(500).json({ error: 'Internal server error' });
                        }

                        const mobilitesByCandidate = {};
                        mobilitesResults.forEach(mob => {
                            if (!mobilitesByCandidate[mob.token_id_cand]) {
                                mobilitesByCandidate[mob.token_id_cand] = [];
                            }
                            mobilitesByCandidate[mob.token_id_cand].push({
                                id_region: mob.id_region,
                                region: mob.region
                            });
                        });

                        Object.values(map).forEach(cand => {
                            cand.mobilites = mobilitesByCandidate[cand.token_id] || [];
                        });

                        // 2. AJOUT : Récupération du Parcours Scolaire (Expérience)
                        db.query(
                            `
                            SELECT
                                token_id,
                                id,
                                ecole,
                                diplome,
                                mois_debut,
                                annee_debut,
                                mois_obtention,
                                annee_obtention,
                                description
                            FROM expenreicenformations_scolaire
                            WHERE deleted = 0
                              AND token_id IN (?);
                            `,
                            [tokenIds],
                            (err, parcoursResults) => {
                                if (err) {
                                    return res.status(500).json({ error: 'Internal server error' });
                                }

                                const parcoursByCandidate = {};
                                parcoursResults.forEach(p => {
                                    if (!parcoursByCandidate[p.token_id]) {
                                        parcoursByCandidate[p.token_id] = [];
                                    }
                                    parcoursByCandidate[p.token_id].push({
                                        id: p.id,
                                        ecole: p.ecole,
                                        diplome: p.diplome,
                                        mois_debut: p.mois_debut,
                                        annee_debut: p.annee_debut,
                                        mois_obtention: p.mois_obtention,
                                        annee_obtention: p.annee_obtention,
                                        description: p.description
                                    });
                                });

                                Object.values(map).forEach(cand => {
                                    cand.parcours_scolaire = parcoursByCandidate[cand.token_id] || [];
                                });

                                // 3. Récupération des Documents Manquants
                                db.query(
                                    `
                                    SELECT token_id_cand, titre_attestation
                                    FROM documents_manquants
                                    WHERE deleted = 0
                                      AND token_id_cand IN (?);
                                    `,
                                    [tokenIds],
                                    (err, documentsManquantsResults) => {
                                        if (err) {
                                            return res.status(500).json({ error: 'Internal server error' });
                                        }

                                        const docsByCandidate = {};
                                        documentsManquantsResults.forEach(doc => {
                                            if (!docsByCandidate[doc.token_id_cand]) {
                                                docsByCandidate[doc.token_id_cand] = [];
                                            }
                                            docsByCandidate[doc.token_id_cand].push(doc.titre_attestation);
                                        });

                                        Object.values(map).forEach(cand => {
                                            cand.documents_manquants = docsByCandidate[cand.token_id] || [];
                                        });

                                        return res.json(Object.values(map));
                                    }
                                );
                            }
                        );
                    }
                );
            });
        }
    );
});

EmployerCandidatures.post('/setCandidaturesValide', auth, (req, res) => {

    const { id_candidat, id_aff, id_fiche_post, tokenid_cand } = req.body;


    if (!id_candidat || !id_aff || !id_fiche_post || !tokenid_cand) {
        return res.status(400).json({
            error: 'Champs manquants'
        });
    }

    db.query(
        'UPDATE affectation SET statut_aff = 3 WHERE id = ? AND deleted = 0',
        [id_aff],
        (err) => {

            if (err) {
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            db.query(
                'UPDATE cmo_candidats SET statut_candidat = 3, etat_affect = 1, date_validation = NOW() WHERE id = ? AND deleted = 0',
                [id_candidat],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            error: 'Candidate not found'
                        });
                    }

                    db.query(
                        `INSERT INTO histo_statut_candidat
                        (
                            tokenid_cand,
                            id_fiche_poste,
                            type_user,
                            id_user,
                            ip_adresse,
                            date_valid,
                            heure_valid,
                            id_statut_candidat,
                            statut_candidat,
                            commentaire,
                            deleted
                        )
                        VALUES (?, ?, 'Employeur', ?, ?, CURDATE(), CURTIME(), 3, 'Validé', '', 0)`,
                        [
                            tokenid_cand,
                            id_fiche_post,
                            req.user.id,
                            req.ip
                        ],
                        (err) => {

                            if (err) {
                                return res.status(500).json({
                                    error: 'Internal server error'
                                });
                            }

                            return res.status(200).json({
                                success: true,
                                message: 'Candidature validée avec succès'
                            });
                        }
                    );
                }
            );
        }
    );
});


EmployerCandidatures.post('/setCandidatNonValide', auth, (req, res) => {

    const { id_candidat, id_aff, id_fiche_post, tokenid_cand } = req.body;

    if (!id_candidat || !id_aff || !id_fiche_post || !tokenid_cand) {
        return res.status(400).json({
            error: 'Champs manquants'
        });
    }


    // 1. Mise à jour de l'affectation
    db.query(
        'UPDATE affectation SET statut_aff = 4, deleted = 1 WHERE id = ?',
        [id_aff],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // 2. Mise à jour du statut du candidat
            db.query(
                'UPDATE cmo_candidats SET statut_candidat = 1, etat_affect = 0, date_validation = NOW() WHERE id = ? AND deleted = 0',
                [id_candidat],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Candidate not found' });
                    }

                    // 3. Insertion dans l'historique général
                    db.query(
                        `INSERT INTO histo_statut_candidat
                        (
                            tokenid_cand,
                            id_fiche_poste,
                            type_user,
                            id_user,
                            ip_adresse,
                            date_valid,
                            heure_valid,
                            id_statut_candidat,
                            statut_candidat,
                            commentaire,
                            deleted
                        )
                        VALUES (?, ?, 'Employeur', ?, ?, CURDATE(), CURTIME(), 4, 'Refusé', '', 0)`,
                        [
                            tokenid_cand,
                            id_fiche_post,
                            req.user.id,
                            req.ip
                        ],
                        (err) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            // 4. Ajout de la requête issue de ton image (archivage des refus)
                            const sqlArchiv = `
                                INSERT INTO candidat_refus_archiv 
                                (
                                    tokenid_cand, id_fiche_poste, id_user, ip_adresse, 
                                    date_valid, heure_valid, commentaire, deleted
                                ) 
                                VALUES (?, ?, ?, ?, CURDATE(), CURTIME(), 'Refus', '0')
                            `;

                            db.query(
                                sqlArchiv,
                                [
                                    tokenid_cand,
                                    id_fiche_post,
                                    req.user.id,
                                    req.ip
                                ],
                                (err) => {
                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({ error: 'Internal server error' });
                                    }

                                    // Retour final de la route en cas de succès complet
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Candidature refusée et archivée avec succès'
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





module.exports = EmployerCandidatures;
