
const express = require('express');
const db = require('../db');

const CandidatureScreen = express.Router();
const auth = require('../middleware/auth');


// ======================================================
// TEST ROUTE
// ======================================================

CandidatureScreen.get('/', auth, (req, res) => {
    res.send('Candidature Screen route V2');
});


// ======================================================
// RÉCUPÉRER LES CANDIDATURES
// ======================================================

CandidatureScreen.post('/', auth, (req, res) => {

    const token_id = req.user.token_id;

    console.log(
        'Received candidature request with token_id:',
        token_id
    );

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    const query = `
        SELECT
            o.id,
            o.titre,
            o.type_contrat,
            o.duree,
            o.sous_descr,
            o.lieu,

            m.titre AS metier_titre,
            m.icone AS metier_icone,

            r.titre AS region_titre,

            p.date AS date_postulation,

            f.id AS favori_id

        FROM postuler p

        INNER JOIN offres_emploi o
            ON o.id = p.id_offre
            AND o.deleted = '0'

        LEFT JOIN metiers m
            ON m.id = o.id_metiers
            AND m.deleted = '0'

        LEFT JOIN regions r
            ON r.id = o.lieu
            AND r.deleted = '0'

        LEFT JOIN favoris_offres f
            ON f.token_id = p.token_id
            AND f.id_offre = o.id
            AND f.deleted = '0'

        WHERE p.token_id = ?
        AND p.deleted = '0'

        ORDER BY p.id DESC
    `;

    // UNE SEULE requête
    db.query(query, [token_id], (err, results) => {

        if (err) {
            console.error('Erreur SQL candidatures:', err);

            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);
    });
});



// ======================================================
// AJOUTER AUX FAVORIS
// ======================================================

CandidatureScreen.post('/ajouterFavoris', auth, (req, res) => {

    

    const { id_offre } = req.body;
    const token_id = req.user.token_id;


    if (!token_id || !id_offre) {
        return res.status(400).json({
            error: 'token_id and id_offre are required'
        });
    }

    db.query(
        `INSERT INTO favoris_offres
        (
            token_id,
            id_offre,
            date,
            heure,
            adresse_ip,
            deleted
        )
        VALUES (?, ?, CURDATE(), CURTIME(), ?, '0')`,
        [
            token_id,
            id_offre,
            req.ip
        ],
        (err, result) => {

            if (err) {
                console.error('Erreur INSERT favoris:', err);

                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Offre ajoutée aux favoris',
                id: result.insertId
            });
        }
    );
});


// ======================================================
// SUPPRIMER DES FAVORIS
// ======================================================

CandidatureScreen.post('/removeFavorite', auth, (req, res) => {

    const { id_offre } = req.body;
    const token_id = req.user.token_id;


    if (!token_id || !id_offre) {
        return res.status(400).json({
            error: 'token_id and id_offre are required'
        });
    }

    db.query(
        `UPDATE favoris_offres
         SET deleted = '1'
         WHERE deleted = '0'
         AND token_id = ?
         AND id_offre = ?`,
        [
            token_id,
            id_offre
        ],
        (err, result) => {

            if (err) {
                console.error('Erreur UPDATE favoris:', err);

                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            return res.json({
                success: true,
                message: 'Offre supprimée des favoris',
                affectedRows: result.affectedRows
            });
        }
    );
});



// ======================================================
// VÉRIFIER SI UNE OFFRE EST FAVORITE
// ======================================================

CandidatureScreen.post('/isFavorite', auth, (req, res) => {

    const { id_offre } = req.body;
    const token_id = req.user.token_id;

    if (!token_id || !id_offre) {
        return res.status(400).json({
            error: 'token_id and id_offre are required'
        });
    }

    db.query(
        `SELECT deleted
         FROM favoris_offres
         WHERE token_id = ?
         AND id_offre = ?`,
        [
            token_id,
            id_offre
        ],
        (err, results) => {

            if (err) {
                console.error('Erreur SELECT isFavorite:', err);

                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            // Aucun favori trouvé
            if (results.length === 0) {
                return res.json({
                    isFavorite: false
                });
            }

            // Favori trouvé
            return res.json({
                isFavorite: Number(results[0].deleted) === 0
            });
        }
    );
});


module.exports = CandidatureScreen;

