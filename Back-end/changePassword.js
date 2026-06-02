const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const passwordRouter = express.Router();

passwordRouter.get('/candidat', (req, res) => {
  res.send('password change route');
});

passwordRouter.post('/candidat', async (req, res) => {
    const { token_id , currentPassword, newPassword } = req.body;
    console.log('Received password change request with body:');

    if (!token_id || !currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Token ID, mot de passe actuel et nouveau mot de passe sont obligatoires'
        });
    }

    db.query(
        'SELECT * FROM users WHERE token_id = ? and roles = "10_C" and deleted = 0',
        [token_id],
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

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Mot de passe actuel incorrect'
                });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            db.query(
                'UPDATE users SET password = ? WHERE token_id = ?',
                [hashedPassword, token_id],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Erreur serveur'
                        });
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'Mot de passe mis à jour avec succès'
                    });
                }
            );
        }
    );

});
passwordRouter.post('/employeur', async (req, res) => {
    const { token_id , currentPassword, newPassword } = req.body;
    console.log('Received password change request with body:');

    if (!token_id || !currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Token ID, mot de passe actuel et nouveau mot de passe sont obligatoires'
        });
    }

    db.query(
        'SELECT * FROM users WHERE token_id = ? and roles = "10_P" and deleted = 0',
        [token_id],
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

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Mot de passe actuel incorrect'
                });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            db.query(
                'UPDATE users SET password = ? WHERE token_id = ?',
                [hashedPassword, token_id],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Erreur serveur'
                        });
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'Mot de passe mis à jour avec succès'
                    });
                }
            );
        }
    );

});

passwordRouter.post('/candidat/forget', async (req, res) => {
    const { email } = req.body;


    console.log('Received password reset request with body:', email);

    const response = await fetch("http://192.168.1.19:3000/test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });


    res.json({
        success: true,
        message: 'Password reset request received'
    });
});


passwordRouter.get('/test', (req, res) => {
    res.send('password change test nooooooooooooooooooow');
});


module.exports = passwordRouter;