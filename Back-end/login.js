const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const router = express.Router();

router.get('/candidat', (req, res) => {
  res.send('Login route');
});



router.post('/candidat', (req, res) => {
    console.log('Received login request with body:', req.body); 

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email et mot de passe obligatoires'
        });
    }

    db.query(
        'SELECT * FROM users WHERE username = ?',
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
                    message: 'Utilisateur non trouvé'
                });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log('Password does not match for user:');
                return res.status(401).json({
                    success: false,
                    message: 'Mot de passe incorrect'
                });
            }

            console.log('User authenticated successfully:');
            return res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                token_id: user.token_id
            });
        }
    );
});

module.exports = router;