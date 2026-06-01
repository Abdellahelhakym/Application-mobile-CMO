const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const signUp = express.Router();
const db = require('./db');

signUp.get('/candidats', (req, res) => {
    res.send('Signup route');
});

signUp.post('/candidat', async (req, res) => {
    console.log('Received signup request:', req.body);

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

        if (!civilite || !prenom || !nom || !pays || !email || !tel || !password) {
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
                return res.status(500).json({
                    success: false,
                    message: 'Erreur verification email'
                });
            }

            if (checkResults.length > 0) {
                const user = checkResults[0];

                if (user.deleted === 2)
                    return res.status(409).json({ success: false, message: 'Email en attente de verification' });

                if (user.deleted === 0)
                    return res.status(409).json({ success: false, message: 'User existe déjà' });

                if (user.deleted === 3)
                    return res.status(403).json({ success: false, message: 'Compte supprimé' });

                if (user.deleted === 1)
                    return res.status(403).json({ success: false, message: 'Compte désactivé' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const token_id = crypto.randomBytes(32).toString('hex');

            const sqlCandidat = `
                INSERT INTO cmo_candidats
                (civilite, prenom, nom, pays, email, tel, token_id, disponibilite, deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sqlCandidat, [
                civilite,
                prenom,
                nom,
                pays,
                email,
                tel,
                token_id,
                0,
                0
            ], (err, result) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur candidat'
                    });
                }

                const pseudo = `${nom} ${prenom}`;

                const sqlUser = `
                    INSERT INTO users
                    (username, password, date_inscription, token_id, deleted, pseudo, roles)
                    VALUES (?, ?, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i'), ?, ?, ?, ?)
                `;

                db.query(sqlUser, [
                    email,
                    hashedPassword,
                    token_id,
                    2,
                    pseudo,
                    '10_C'
                ], async (err2) => {

                    if (err2) {
                        return res.status(500).json({
                            success: false,
                            message: 'Erreur user'
                        });
                    }

                    console.log('Candidat + User créés avec succès');

                    try{
                        const token_app = token_id; 
                        
                            const response = await fetch("http://conceptmaindoeuvre.com/register_app_mobile.php", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({ token_app })
                                });
                                             if (!response.ok) {
                                                console.error('Erreur API mobile:', response.status);
                                            }

                    }catch(error){
                        console.error('Error during post-signup processing:', error);
                    }

                    return res.status(201).json({
                        success: true,
                        message: 'Candidat + User créé'
                    });
                });
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


signUp.post('/employeur', async (req, res) => {
    console.log('Received signup request:', req.body);

 

    try {
        const {
            raison_social,
            pays_origine,
            responsable,
            prenom_responsable,
            num_tel,
            email,
            password,
   
            id_formule
        } = req.body;

        if (!raison_social || !pays_origine || !responsable || !prenom_responsable || !num_tel || !email || !password || !id_formule) {
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
                return res.status(500).json({
                    success: false,
                    message: 'Erreur verification email'
                });
            }

            if (checkResults.length > 0) {
                const user = checkResults[0];

                if (user.deleted === 2)
                    return res.status(409).json({ success: false, message: 'Email en attente de verification' });

                if (user.deleted === 0)
                    return res.status(409).json({ success: false, message: 'User existe déjà' });

                if (user.deleted === 3)
                    return res.status(403).json({ success: false, message: 'Compte supprimé' });

                if (user.deleted === 1)
                    return res.status(403).json({ success: false, message: 'Compte désactivé' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const token_id = crypto.randomBytes(32).toString('hex');

            const sqlCandidat = `
                INSERT INTO mco_entreprise
                (raison_social, id_formule, pays_origine, responsable, prenom_responsable, num_tel, email, token_id, deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sqlCandidat, [
                raison_social,
                id_formule,
                pays_origine,
                responsable,
                prenom_responsable,
                num_tel,
                email,
                token_id,
                0
            ], (err, result) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur candidat'
                    });
                }

                const pseudo = `${responsable} ${prenom_responsable}`;

                const sqlUser = `
                    INSERT INTO users
                    (username, password, date_inscription, token_id, deleted, pseudo, roles)
                    VALUES (?, ?, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i'), ?, ?, ?, ?)
                `;

                db.query(sqlUser, [
                    email,
                    hashedPassword,
                    token_id,
                    2,
                    pseudo,
                    '10_P'
                ], async (err2) => {

                    if (err2) {
                        return res.status(500).json({
                            success: false,
                            message: 'Erreur user'
                        });
                    }

                    console.log('Entreprise + User créées avec succès');

                    try{
                        const token_app = token_id; 
                        
                            const response = await fetch("http://conceptmaindoeuvre.com/register_app_mobile.php", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({ token_app })
                                });
                                             if (!response.ok) {
                                                console.error('Erreur API mobile:', response.status);
                                            }

                    }catch(error){
                        console.error('Error during post-signup processing:', error);
                    }

                    return res.status(201).json({
                        success: true,
                        message: 'Entreprise + User créée'
                    });
                });
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
       
});

module.exports = signUp;