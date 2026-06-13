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
                    a.statut_aff,

                    m.id AS metier_id,
                    m.titre AS metier_titre

                FROM cmo_candidats c

                INNER JOIN affectation a 
                    ON a.id_candidat = c.id

                INNER JOIN fiche_poste f 
                    ON f.id_fiche_poste = a.id_fiche_poste

                LEFT JOIN secteurs_candidats sc 
                    ON sc.token_id_cand = c.token_id

                LEFT JOIN metier m 
                    ON m.id = sc.id_metier

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
                            id: row.candidat_id,
                            ...row,
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

                res.json(Object.values(map));
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
                    a.statut_aff,

                    m.id AS metier_id,
                    m.titre AS metier_titre

                FROM cmo_candidats c

                INNER JOIN affectation a 
                    ON a.id_candidat = c.id

                INNER JOIN fiche_poste f 
                    ON f.id_fiche_poste = a.id_fiche_poste

                LEFT JOIN secteurs_candidats sc 
                    ON sc.token_id_cand = c.token_id

                LEFT JOIN metier m 
                    ON m.id = sc.id_metier

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
                            id: row.candidat_id,
                            ...row,
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

                res.json(Object.values(map));
            });
        }
    );
});


EmployerCandidatures.post('/setCandidaturesValide', auth, (req, res) => {
    const { id_candidat } = req.body;
    const token_id = req.user.token_id;

    if (!id_candidat) {
        return res.status(400).json({ error: ' Candidate ID are required' });
    }

    db.query(
        'UPDATE cmo_candidats SET statut_candidat = 3 WHERE id = ? AND deleted = 0',
        [id_candidat],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Candidate not found or already validated' });
            }

            res.json({ message: 'Candidate validated successfully' });
        }
    );
});

module.exports = EmployerCandidatures;
