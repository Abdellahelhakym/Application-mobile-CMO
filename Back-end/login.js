const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const router = express.Router();
const auth = require('./middleware/auth');

router.get('/candidat', auth, (req, res) => {
  res.send('Login route');
});

// ROUTE CANDIDAT
router.post('/candidat', (req, res) => {
    try {
        console.log('Received login request with body:', req.body); 

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Identifiant et mot de passe obligatoires'
            });
        }

        db.query(
                        `SELECT *
                FROM users
                WHERE username = ?
                AND roles = '10_C'
                AND deleted = 0`,
            [email],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur serveur'
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Identifiant ou mot de passe incorrect.'
                    });
                }

                try {
                    const user = results[0];

                    // Remplacement du préfixe PHP $2y$ par $2b$ pour la compatibilité Node.js
                    const compatibleHash = user.password.replace('$2y$', '$2b$');

                    const isMatch = await bcrypt.compare(password, compatibleHash);

                    if (isMatch && user.roles == '10_C' && user.deleted == 0) {
                        console.log('User authenticated successfully:' );
                        return res.status(200).json({
                            success: true,
                            message: 'Connexion réussie',
                            token_id: user.token_id,
                        });
                    }

                    console.log('Authentication failed for user:');
                    return res.status(401).json({
                        success: false,
                        message: 'Identifiant ou mot de passe incorrect.'
                    });
                } catch (error) {
                    console.error('Login processing error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur serveur'
                    });
                }
            }
        );
    } catch (error) {
        console.error('Login route error:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// ROUTE EMPLOYEUR
router.post('/employeur', (req, res) => {
    try {
        console.log('Received login request with body:', req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Identifiant et mot de passe obligatoires.'
            });
        }

        db.query(
            `SELECT *
             FROM users
             WHERE username = ?
               AND roles = '10_P'
               AND deleted = 0`,
            [email],
            async (err, results) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur serveur'
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Identifiant ou mot de passe incorrect.'
                    });
                }

                try {
                    const user = results[0];

                    // Remplacement du préfixe PHP $2y$ par $2b$ pour la compatibilité Node.js
                    const compatibleHash = user.password.replace('$2y$', '$2b$');

                    const isMatch = await bcrypt.compare(password, compatibleHash);

                    if (!isMatch || user.roles != '10_P' || user.deleted != 0) {
                        return res.status(401).json({
                            success: false,
                            message: 'Identifiant ou mot de passe incorrect.'
                        });
                    }

                    db.query(
                        'SELECT raison_social FROM mco_entreprise WHERE token_id = ?',
                        [user.token_id],
                        (err, entrepriseResults) => {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: 'Erreur serveur'
                                });
                            }

                            const raison_social =
                                entrepriseResults.length > 0
                                    ? entrepriseResults[0].raison_social
                                    : null;

                            console.log('User authenticated successfully:', user.pseudo);

                            return res.status(200).json({
                                success: true,
                                message: 'Connexion réussie',
                                token_id: user.token_id,
                                pseudo: user.pseudo,
                                raison_social: raison_social
                            });
                        }
                    );

                } catch (error) {
                    console.error(error);

                    return res.status(500).json({
                        success: false,
                        message: 'Erreur serveur'
                    });
                }
            }
        );

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

module.exports = router;