const express = require('express');
const db = require('../db');

const EmployerCandidatures = express.Router();

EmployerCandidatures.get('/', (req, res) => {
    res.send('Employer Candidatures route');
});

EmployerCandidatures.post('/getCandidatures', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'Token ID is required' });
    }

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

            const sql = `
                            SELECT 
                    c.*,
                    f.id_fiche_poste,
                    f.intitule_poste,
                    a.date_aff,
                    a.statut_aff
                FROM cmo_candidats c
                INNER JOIN affectation a 
                    ON a.id_candidat = c.id
                INNER JOIN fiche_poste f 
                    ON f.id_fiche_poste = a.id_fiche_poste
                WHERE c.deleted = 0
                AND c.statut_candidat <> 3
                AND a.deleted = 0
                AND a.statut_aff IN (1,2,3,4)
                AND f.id_societe = ?;
            `;

            db.query(
                sql,
                [idEmployer],
                (err, candidatResults) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                   

                    res.json(candidatResults);
                }
            );
        }
    );

});
EmployerCandidatures.post('/getCandidaturesValide', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'Token ID is required' });
    }

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

            const sql = `
                            SELECT 
                    c.*,
                    f.id_fiche_poste,
                    f.intitule_poste,
                    a.date_aff,
                    a.statut_aff
                FROM cmo_candidats c
                INNER JOIN affectation a 
                    ON a.id_candidat = c.id
                INNER JOIN fiche_poste f 
                    ON f.id_fiche_poste = a.id_fiche_poste
                WHERE c.deleted = 0
                AND c.statut_candidat <> 3
                AND a.deleted = 0
                AND a.statut_aff IN (1,2,3,4)
                AND f.id_societe = ?;
            `;

            db.query(
                sql,
                [idEmployer],
                (err, candidatResults) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                   

                    res.json(candidatResults);
                }
            );
        }
    );

});

module.exports = EmployerCandidatures;
