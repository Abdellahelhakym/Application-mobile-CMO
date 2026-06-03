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
                    a.statut_aff,

                    sc.id AS secteur_candidat_id,
                    sc.secteur_numero,

                    m.id AS metier_id,
                    m.titre AS metier_titre,

                    scm.id AS sous_categorie_id,
                    scm.titre AS sous_categorie_titre,

                    cm.id AS categorie_id,
                    cm.titre AS categorie_titre

                FROM cmo_candidats c

                INNER JOIN affectation a 
                    ON a.id_candidat = c.id

                INNER JOIN fiche_poste f 
                    ON f.id_fiche_poste = a.id_fiche_poste

                LEFT JOIN secteurs_candidats sc 
                    ON sc.token_id_cand = c.token_id

                LEFT JOIN metier m 
                    ON m.id = sc.id_metier

                LEFT JOIN sous_categorie_metier scm 
                    ON scm.id = m.id_sous

                LEFT JOIN categorie_metier cm 
                    ON cm.id = scm.id_categorie

                WHERE c.deleted = 0
                AND c.statut_candidat <> 3
                AND a.deleted = 0
                AND a.statut_aff IN (1,2,3,4)
                AND f.id_societe = ?;
            `;

            db.query(sql, [idEmployer], (err, rows) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const map = {};

                rows.forEach(row => {

                    // init candidat
                    if (!map[row.id]) {
                        map[row.id] = {
                            ...row,
                            secteurs: []
                        };
                    }

                    // ajouter secteur uniquement si existe
                    if (row.secteur_candidat_id) {

                        const exists = map[row.id].secteurs.find(
                            s => s.id === row.secteur_candidat_id
                        );

                        if (!exists) {
                            map[row.id].secteurs.push({
                                id: row.secteur_candidat_id,
                                secteur_numero: row.secteur_numero,
                                metier: {
                                    id: row.metier_id,
                                    titre: row.metier_titre
                                },
                                sous_categorie: {
                                    id: row.sous_categorie_id,
                                    titre: row.sous_categorie_titre
                                },
                                categorie: {
                                    id: row.categorie_id,
                                    titre: row.categorie_titre
                                }
                            });
                        }
                    }
                });

                res.json(Object.values(map));
            });
        }
    );
});

module.exports = EmployerCandidatures;
