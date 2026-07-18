const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");

const AttestationsScreen = express.Router();

// --- Chemin de stockage vers le dossier partagé du CRM ---
const uploadPathAttestation = path.resolve(
    __dirname,
    '../../../crm_cmo/documents/attestations'
);

/*
|--------------------------------------------------------------------------
| GET / (Test)
|--------------------------------------------------------------------------
*/
AttestationsScreen.get('/', auth, (req, res) => {
    res.send('Attestations route');
});


/*
|--------------------------------------------------------------------------
| POST /categorie
|--------------------------------------------------------------------------
*/
AttestationsScreen.post('/categorie', auth, (req, res) => {
    db.query(
        `SELECT * FROM categorie_attestation WHERE deleted = 0`,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json(results);
        }
    );
});

/*
|--------------------------------------------------------------------------
| POST /
|--------------------------------------------------------------------------
*/
AttestationsScreen.post('/', auth, (req, res) => {
    const token_id = req.user.token_id;

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    db.query(
        `
        SELECT 
            dm.id,
            dm.token_id_cand,
            dm.etats,
            ta.id AS id_attestation,
            ta.titre,
            ta.titre2,
            ca.id AS id_categorie,
            ca.titre AS categorie
        FROM documents_manquants dm
        INNER JOIN titre_attestation ta ON dm.id_attestation = ta.id
        INNER JOIN categorie_attestation ca ON ta.id_categorie_attestation = ca.id
        WHERE dm.deleted = 0
          AND ta.deleted = 0
          AND ca.deleted = 0
          AND dm.token_id_cand = ?
        `,
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json(results);
        }
    );
});

/*
|--------------------------------------------------------------------------
| POST /updateAttestations (Upload / Remplacement de fichier)
|--------------------------------------------------------------------------
*/
AttestationsScreen.post(
    '/updateAttestations',
   
    multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                if (!fs.existsSync(uploadPathAttestation)) {
                    fs.mkdirSync(uploadPathAttestation, { recursive: true });
                }
                cb(null, uploadPathAttestation);
            },
            filename: function (req, file, cb) {
                const ext = path.extname(file.originalname || "").toLowerCase();
                const allowedExt = [".pdf", ".jpg", ".jpeg", ".png"];

                if (!allowedExt.includes(ext)) {
                    return cb(new Error("Format de fichier non autorisé"));
                }

                const timestamp = Math.floor(Date.now() / 1000);
                const randomStr = Math.random().toString(36).substring(2, 8);
                const fileName = `temp_${timestamp}_${randomStr}${ext}`;

                cb(null, fileName);
            }
        }),
        limits: { fileSize: 10 * 1024 * 1024 }
    }).single("document"),

    async (req, res) => {
        let tempFilePath = null;

        try {
            const token_id = req.body.token_id;
            const id_attestation = req.body.id_attestation;

            if (!token_id) {
                return res.status(400).json({ success: false, message: "token_id is required" });
            }
            if (!id_attestation) {
                return res.status(400).json({ success: false, message: "id_attestation is required" });
            }
            if (!req.file) {
                return res.status(400).json({ success: false, message: "fichier is required" });
            }

            tempFilePath = req.file.path;
            const originalExt = path.extname(req.file.originalname).toLowerCase();

            // 1. Récupérer le titre
            const attestationSql = `
                SELECT titre FROM titre_attestation WHERE id = ? AND deleted = 0
            `;

            const attRows = await new Promise((resolve, reject) => {
                db.query(attestationSql, [id_attestation], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!attRows.length) {
                await new Promise((resolve) => {
                    fs.unlink(tempFilePath, () => resolve());
                });
                return res.status(404).json({ success: false, message: "Attestation not found" });
            }

            const titre = attRows[0].titre;
            const timestamp = Math.floor(Date.now() / 1000);
            const nom_fichier = `${titre.replace(/\s+/g, '_').toLowerCase()}_${timestamp}${originalExt}`;
            const finalFilePath = path.join(uploadPathAttestation, nom_fichier);

            // 2. Renommer le fichier
            await new Promise((resolve, reject) => {
                fs.rename(tempFilePath, finalFilePath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            tempFilePath = null;

            // 3. Vérifier si un fichier existe déjà
            const findCvSql = `
                SELECT id, cvitae FROM cv_candidat 
                WHERE token_id = ? AND titre = ? AND deleted = 0
            `;

            const cvRows = await new Promise((resolve, reject) => {
                db.query(findCvSql, [token_id, titre], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const updateDocManquant = `
                UPDATE documents_manquants SET etats = 1 
                WHERE deleted = 0 AND token_id_cand = ? AND id_attestation = ?
            `;

            // CAS 1 : INSERTION
            if (!cvRows.length) {
                const insertCV = `
                    INSERT INTO cv_candidat (token_id, titre, cvitae, etats, deleted, created_at)
                    VALUES (?, ?, ?, 1, 0, NOW())
                `;

                const insertResult = await new Promise((resolve, reject) => {
                    db.query(insertCV, [token_id, titre, nom_fichier], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(updateDocManquant, [token_id, id_attestation], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                return res.json({
                    success: true,
                    message: "Attestation inserted successfully",
                    fichier: nom_fichier,
                    cv_id: insertResult.insertId
                });
            }

            // CAS 2 : UPDATE
            const existing = cvRows[0];
            const updateCV = `
                UPDATE cv_candidat SET cvitae = ?, etats = 1 
                WHERE id = ? AND token_id = ? AND deleted = 0
            `;

            await new Promise((resolve, reject) => {
                db.query(updateCV, [nom_fichier, existing.id, token_id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            await new Promise((resolve, reject) => {
                db.query(updateDocManquant, [token_id, id_attestation], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Supprimer l'ancien fichier
            if (existing.cvitae) {
                const oldPath = path.join(uploadPathAttestation, existing.cvitae);
                fs.unlink(oldPath, (err) => {
                    if (err) console.log('Ancien fichier introuvable');
                });
            }

            return res.json({
                success: true,
                message: "Attestation updated successfully",
                fichier: nom_fichier,
                cv_id: existing.id
            });

        } catch (error) {
            console.error('Erreur:', error);

            if (tempFilePath) {
                fs.unlink(tempFilePath, () => {});
            }

            return res.status(500).json({ success: false, message: "Server error" });
        }
    }
);

/*
|--------------------------------------------------------------------------
| POST /getAttestations
|--------------------------------------------------------------------------
*/
AttestationsScreen.post('/getAttestations', auth, (req, res) => {
    const token_id = req.user.token_id;

    if (!token_id) {
        return res.status(400).json({ success: false, message: "token_id required" });
    }

    const sql = `
        SELECT 
            cv.id,
            cv.cvitae,
            cv.created_at,
            ta.id AS id_attestation,
            ta.titre,
            ta.titre2,
            ca.id AS id_categorie,
            ca.titre AS categorie
        FROM cv_candidat cv
        INNER JOIN titre_attestation ta ON cv.titre = ta.titre
        INNER JOIN categorie_attestation ca ON ta.id_categorie_attestation = ca.id
        WHERE cv.token_id = ?
          AND cv.etats = 1
          AND cv.deleted = 0
        ORDER BY cv.id DESC
    `;

    db.query(sql, [token_id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (!results.length) {
            return res.status(404).json({ success: false, message: "No attestations found" });
        }

        return res.json({ success: true, files: results });
    });
});

/*
|--------------------------------------------------------------------------
| POST /deleteAttestation
|--------------------------------------------------------------------------
*/

AttestationsScreen.post('/deleteAttestation', auth, (req, res) => {
    const token_id = req.user.token_id;
    const { id_attestation } = req.body;

    console.log('Received deleteAttestation request with id_attestation:', id_attestation);

    if (!token_id || !id_attestation) {
        return res.status(400).json({
            success: false,
            message: "token_id and id_attestation required"
        });
    }

    db.query(
        `SELECT titre FROM titre_attestation WHERE id = ? AND deleted = 0`,
        [id_attestation],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (!result.length) {
                return res.status(404).json({ success: false, message: "Attestation not found" });
            }

            const titre = result[0].titre;

            db.query(
                `UPDATE cv_candidat
                 SET deleted = 2
                 WHERE titre = ? AND token_id = ? AND deleted = 0`,
                [titre, token_id],
                (err2, result2) => {
                    if (err2) {
                        console.log(err2);
                        return res.status(500).json({ success: false });
                    }

                    if (result2.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "No matching CV found to delete"
                        });
                    }

                    return res.json({
                        success: true,
                        message: "Attestation deleted (soft delete)"
                    });
                }
            );
        }
    );
});

module.exports = AttestationsScreen;