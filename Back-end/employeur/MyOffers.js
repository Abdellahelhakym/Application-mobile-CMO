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

   

    // 1. Recherche de l'entreprise/user via le token
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

            // 2. Requête des devis avec gestion stricte de la collation textuelle
            db.query(
    `SELECT d.*, s.titre AS statut_titre
     FROM devis_fiche d
     INNER JOIN fiche_poste f 
        ON REPLACE(d.id_fiche_poste, '0000-', '000-') COLLATE utf8mb4_general_ci = f.id_fiche_poste COLLATE utf8mb4_general_ci
     LEFT JOIN statut_fiche_poste s ON s.id = f.statut_fiche
     WHERE d.deleted = '0'
       AND f.id_societe = ?`,
    [idEmployer],
    (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json(results);
    }
);
        }
    );
});


module.exports = myOffers;