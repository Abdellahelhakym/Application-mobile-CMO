const express = require('express');
const db = require('../db');

const CVDatabase = express.Router();

CVDatabase.get('/', (req, res) => {
    res.send('CV Screen route');
});

CVDatabase.post('/candidat', (req, res) => {
    const query = (sql, params = []) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });

    (async () => {
        try {
            console.log('Received CV database request');

            const candidats = await query(
                'SELECT token_id, prenom, nom, niveau_etude, experience FROM cmo_candidats WHERE deleted = 0'
            );

            const secteurs = await query(
                `SELECT
                    sc.token_id_cand,
                    sc.secteur_numero,
                    m.id AS id_metier,
                    m.titre AS metier,
                    sm.id AS id_sous,
                    sm.titre AS sous_categorie,
                    cm.id AS id_categorie,
                    cm.titre AS categorie
                 FROM secteurs_candidats sc
                 LEFT JOIN metier m ON m.id = sc.id_metier AND m.deleted = 0
                 LEFT JOIN sous_categorie_metier sm ON sm.id = m.id_sous AND sm.deleted = 0
                 LEFT JOIN categorie_metier cm ON cm.id = sm.id_categorie AND cm.deleted = 0
                 WHERE sc.deleted = 0`
            );

            const mobilites = await query(
                `SELECT
                    m.token_id_cand,
                    r.id AS id_region,
                    r.titre AS region
                 FROM mobilite_candidats m
                 INNER JOIN regions r ON r.id = m.id_region
                 WHERE m.deleted = 0 AND r.deleted = 0`
            );

            const parcours = await query(
                `SELECT
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
                 WHERE deleted = 0`
            );

            const attestations = await query(
                `SELECT
                    dm.token_id_cand,
                    dm.id,
                    dm.etats,
                    ta.id AS id_attestation,
                    ta.titre,
                    ta.titre2,
                    ca.id AS id_categorie,
                    ca.titre AS categorie
                 FROM documents_manquants dm
                 INNER JOIN titre_attestation ta ON dm.id_attestation = ta.id
                 INNER JOIN categorie_attestation ca ON ta.id_categorie_attestation = ca.id
                 WHERE dm.deleted = 0 AND ta.deleted = 0 AND ca.deleted = 0`
            );

            const groupByToken = (rows, tokenKey) => rows.reduce((acc, row) => {
                const token = row[tokenKey];
                if (!acc[token]) {
                    acc[token] = [];
                }
                acc[token].push(row);
                return acc;
            }, {});

            const secteursByToken = groupByToken(secteurs, 'token_id_cand');
            const mobilitesByToken = groupByToken(mobilites, 'token_id_cand');
            const parcoursByToken = groupByToken(parcours, 'token_id');
            const attestationsByToken = groupByToken(attestations, 'token_id_cand');

            const response = candidats.map((candidat) => ({
                token_id: candidat.token_id,
                prenom: candidat.prenom || null,
                nom: candidat.nom || null,
                secteur_activite: secteursByToken[candidat.token_id] || [],
                mobilite: mobilitesByToken[candidat.token_id] || [],
                niveau_etudes: candidat.niveau_etude || null,
                experience: candidat.experience || null,
                parcours_scolaire: parcoursByToken[candidat.token_id] || [],
                attestation: attestationsByToken[candidat.token_id] || []
            }));

            return res.json(response);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    })();
});

module.exports = CVDatabase;