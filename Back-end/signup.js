const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const signUp = express.Router();
const db = require('./db');



signUp.get('/candidats', (req, res) => {
    res.send('Signup route');
});


signUp.post('/candidat', async (req, res) => {
    console.log('Received signup request with body:', req.body); // Log the request body for debugging

    try {

        const {
            civilite,
            prenom,
            nom,
            pays,
            email,
            tel,
            password
        } = req.body;

        // Vérification
        if (
            !civilite ||
            !prenom ||
            !nom ||
            !pays ||
            !email ||
            !tel ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont obligatoires'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Token candidat
        const token_id = crypto.randomBytes(32).toString('hex');

        // 1 INSERT candidat
        const sqlCandidat = `
            INSERT INTO cmo_candidats
            (
                civilite,
                prenom,
                nom,
                pays,
                email,
                tel,
                token_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sqlCandidat,
            [
                civilite,
                prenom,
                nom,
                pays,
                email,
                tel,
                token_id
            ],
            (err, result) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur candidat'
                    });
                }

                const candidatId = result.insertId;

                // pseudo = nom prenom
                const pseudo = `${nom} ${prenom}`;

              

                // 2 INSERT user
                const sqlUser = `
                    INSERT INTO users
                    (
                        username,
                        password,
                        date_inscription,
                        token_id,
                        deleted,
                        pseudo,
                        roles
                    )
                    VALUES (?, ?, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i'), ?, ?, ?, ?)
                `;

                db.query(
                    sqlUser,
                    [
                        email,
                        hashedPassword,
                        token_id,
                        2, // deleted = 2 au début
                        pseudo,
                        '10_C'
                    ],
                    (err2, result2) => {

                        if (err2) {
                            console.error(err2);

                            return res.status(500).json({
                                success: false,
                                message: 'Erreur user'
                            });
                        }

                        console.log('Candidat et User créés avec succès');

                        res.status(201).json({
                            success: true,
                            message: 'Candidat + User créé',
                            
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Erreur interne'
        });

    }

});

module.exports = signUp;