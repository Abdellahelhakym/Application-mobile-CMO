const express = require('express');
const db = require('../db');

const CandidatureScreen = express.Router();
const auth = require('../middleware/auth');

CandidatureScreen.get('/', auth, (req, res) => {
    try {
        res.send('Candidature Screen route');
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


CandidatureScreen.post('/', auth, (req, res) => {
    try {
        const token_id = req.user.token_id;

        console.log('Received candidature request with token_id:');

        if (!token_id) {
            return res.status(400).json({
                error: 'token_id is required'
            });
        }

        db.query(
            'SELECT id_offre FROM postuler WHERE token_id = ? AND deleted = 0',
            [token_id],
            (err, results) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Internal server error'
                    });
                }

                if (results.length === 0) {
                    return res.json([]);
                }

                // Récupérer les IDs des offres
                const offerIds = results.map(item => item.id_offre);

                const query = `
                    SELECT 
                        o.id,
                        o.titre,
                        o.type_contrat,
                        o.duree,
                        o.lieu,
                        o.descr,
                        o.date,

                        c.titre AS categorie

                    FROM offres_emploi o

                    INNER JOIN metier m 
                        ON o.id_metiers = m.id

                    INNER JOIN sous_categorie_metier sc 
                        ON m.id_sous = sc.id

                    INNER JOIN categorie_metier c 
                        ON sc.id_categorie = c.id

                    WHERE o.id IN (?)
                    AND o.deleted = 0
                `;

                db.query(query, [offerIds], (err, offers) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    return res.json(offers);
                });
            }
        );

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});






CandidatureScreen.post('/ajouterFavoris', auth, (req, res) => {

    const {  id_offre, titre_offre } = req.body;
      const token_id = req.user.token_id;

    if (!id_offre) {
        return res.status(400).json({
            error: 'token_id and id_offre are required'
        });
    }

    db.query(
        'SELECT id, deleted FROM favoris_offres WHERE token_id = ? AND id_offre = ?',
        [token_id, id_offre],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // ❌ n'existe pas → INSERT
            if (results.length === 0) {

                db.query(
                    `INSERT INTO favoris_offres 
                    (token_id, id_offre, titre_offre, date, heure, adresse_ip, deleted)
                    VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, 0)`,

                    [
                        token_id,
                        id_offre,
                        titre_offre || '',
                        req.ip
                    ],

                    (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Internal server error' });
                        }

                        return res.status(201).json({
                            message: 'Added to favorites',
                            status: 0
                        });
                    }
                );

                return;
            }

            
            const current = results[0].deleted;

            const newStatus = current === 0 ? 1 : 0;

            db.query(
                'UPDATE favoris_offres SET deleted = ? WHERE token_id = ? AND id_offre = ?',
                [newStatus, token_id, id_offre],
                (err) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    return res.json({
                        message: newStatus === 1
                            ? 'Removed from favorites'
                            : 'Restored in favorites',
                        status: newStatus
                    });
                }
            );
        }
    );
});


CandidatureScreen.post('/isFavorite', auth, (req, res) => {
   
    const { id_offre } = req.body;
          const token_id = req.user.token_id;
     if ( !id_offre) {
        return res.status(400).json({
            error: ' id_offre are required'
        });
    }

        db.query(
            'SELECT deleted FROM favoris_offres WHERE token_id = ? AND id_offre = ?',
            [token_id, id_offre],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if (results.length === 0) {
                    return res.json({ isFavorite: false });
                }

                return res.json({ isFavorite: results[0].deleted === 0 });
            }
        );


});

module.exports = CandidatureScreen;