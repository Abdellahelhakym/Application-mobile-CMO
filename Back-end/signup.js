const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const signUp = express.Router();
const db = require('./db');


//il doit changer le url pour le lien d'activation dans l'email selon son ip et port de son serveur backend
const url = "http://192.168.1.64:3000/";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ytabdellah540@gmail.com',
        pass: 'xpzh iyvc wzuo wxrs'
    }
});

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

                const sqlCheckUser = `
                        SELECT id, deleted
                        FROM users
                        WHERE username = ?
                        LIMIT 1
                `;

        db.query(sqlCheckUser, [email], async (checkErr, checkResults) => {

            if (checkErr) {
                console.error(checkErr);
                return res.status(500).json({
                    success: false,
                    message: 'Erreur verification email'
                });
            }

            if (checkResults.length > 0) {
                if (checkResults[0].deleted === 2) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email deja en attente de verification'
                    });
                }

                if (checkResults[0].deleted === 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'User deja un compte'
                    });
                }
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
                    token_id,
                    disponibilite,
                    deleted
                )
                VALUES (?, ?, ?, ?, ?, ?, ?,?, ?)
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
                    token_id,
                    0, // disponibilite par defaut = 0
                    0
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
                            2, // deleted = 2 au debut
                            pseudo,
                            '10_C'
                        ],
                        async (err2, result2) => {

                            if (err2) {
                                console.error(err2);

                                return res.status(500).json({
                                    success: false,
                                    message: 'Erreur user'
                                });
                            }

                            console.log('Candidat et User créés avec succès');
                            try {
                                const link = `${url}signup/verify-email?token=${token_id}`;
                                const fullName = `${prenom} ${nom}`;
                                const html = `
                                    <div style="background:#f4f7ff;padding:24px 0;font-family:Arial, sans-serif;">
                                        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
                                            <div style="background:#132f70;padding:18px 24px;">
                                                <img src="cid:logo" alt="CMO" style="height:36px;display:block;" />
                                            </div>
                                            <div style="padding:28px 28px 12px 28px;text-align:center;">
                                                <h2 style="margin:0 0 8px 0;color:#132f70;">Bonjour ${fullName}</h2>
                                                <p style="margin:0;color:#2a2a2a;font-size:15px;">Felicitations, votre compte a bien ete cree.</p>
                                            </div>
                                            <div style="text-align:center;padding:8px 28px 24px 28px;">
                                                <img src="cid:cmo_mobile" alt="CMO" style="max-width:100%;height:auto;" />
                                            </div>
                                            <div style="text-align:center;padding:0 28px 26px 28px;">
                                                <a href="${link}" style="display:inline-block;background:#132f70;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;">Activer mon compte</a>
                                            </div>
                                            <div style="background:#f1f5ff;padding:16px 24px;text-align:center;">
                                                <p style="margin:0;color:#2a2a2a;font-size:13px;">Identifiant : ${email}</p>
                                                <p style="margin:6px 0 0 0;color:#2a2a2a;font-size:13px;">Mot de passe : celui que vous avez saisi lors de l'inscription</p>
                                            </div>
                                        </div>
                                    </div>
                                `;

                                await transporter.sendMail({
                                    from: 'ytabdellah540@gmail.com',
                                    to: email,
                                    subject: 'Bienvenue sur MyCMO',
                                    html,
                                    attachments: [
                                        {
                                            filename: 'logo.png',
                                            path: path.join(__dirname, 'img', 'logo.png'),
                                            cid: 'logo'
                                        },
                                        {
                                            filename: 'cmo_mobile.png',
                                            path: path.join(__dirname, 'img', 'cmo_mobile.png'),
                                            cid: 'cmo_mobile'
                                        }
                                    ]
                                });
                            } catch (emailErr) {
                                console.error("Email error:", emailErr);
                            }

                            res.status(201).json({
                                success: true,
                                message: 'Candidat + User créé',
                                
                            });

                        }
                    );

                }
            );
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Erreur interne'
        });

    }

});

signUp.get('/verify-email', (req, res) => {

    const { token } = req.query;

    const sql = `
        UPDATE users
        SET deleted = 0
        WHERE token_id = ?
    `;

    db.query(sql, [token], (err, result) => {

        if (err) return res.status(500).send("Erreur serveur");

        if (result.affectedRows === 0)
            return res.status(400).send("Token invalide");

        const sqlCandidat = `
            UPDATE cmo_candidats
            SET deleted = 0
            WHERE token_id = ?
        `;

        db.query(sqlCandidat, [token], (err2) => {

            if (err2) return res.status(500).send("Erreur serveur");

            res.send("Compte CMO activé 🎉");
        });
    });
});

module.exports = signUp;