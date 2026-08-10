const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    res.send('Attestations route V4');
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
| POST / (Liste des documents requis pour le candidat)
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
| POST /updateAttestations (Upload / Insertion / Remplacement)
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
    }).single("document"),auth,

    async (req, res) => {
        let tempFilePath = null;

        try {
            const token_id = req.user?.token_id || req.body.token_id;
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

            // 1. Récupérer le titre lié à l'attestation
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
                return res.status(404).json({ success: false, message: "Attestation non trouvée" });
            }

            const titre = attRows[0].titre;
            const timestamp = Math.floor(Date.now() / 1000);
            const nom_fichier = `${titre.replace(/\s+/g, '_').toLowerCase()}_${timestamp}${originalExt}`;
            const finalFilePath = path.join(uploadPathAttestation, nom_fichier);

            // 2. Renommer le fichier physiquement
            await new Promise((resolve, reject) => {
                fs.rename(tempFilePath, finalFilePath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            tempFilePath = null;

            // 3. Rechercher si une attestation existe déjà
            const findAttestationSql = `
                SELECT id, nom_fichier FROM attestations 
                WHERE token_id_cand = ? AND titre = ? AND deleted = 0
            `;

            const existingRows = await new Promise((resolve, reject) => {
                db.query(findAttestationSql, [token_id, titre], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const updateDocManquant = `
                UPDATE documents_manquants SET etats = 1 
                WHERE deleted = 0 AND token_id_cand = ? AND id_attestation = ?
            `;

            // CAS 1 : NOUVELLE ATTESTATION (INSERT)
            if (!existingRows.length) {
                const insertAttestation = `
                    INSERT INTO attestations (token_id_cand, titre, nom_fichier, etats, deleted)
                    VALUES (?, ?, ?, 1, 0)
                `;

                const insertResult = await new Promise((resolve, reject) => {
                    db.query(insertAttestation, [token_id, titre, nom_fichier], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                // Mettre à jour l'état dans documents_manquants
                await new Promise((resolve, reject) => {
                    db.query(updateDocManquant, [token_id, id_attestation], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                return res.json({
                    success: true,
                    message: "Attestation insérée avec succès",
                    nom_fichier: nom_fichier,
                    id: insertResult.insertId
                });
            }

            // CAS 2 : MISE À JOUR (UPDATE)
            const existing = existingRows[0];
            const updateAttestation = `
                UPDATE attestations SET nom_fichier = ?, etats = 1 
                WHERE id = ? AND token_id_cand = ? AND deleted = 0
            `;

            await new Promise((resolve, reject) => {
                db.query(updateAttestation, [nom_fichier, existing.id, token_id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Mettre à jour l'état dans documents_manquants
            await new Promise((resolve, reject) => {
                db.query(updateDocManquant, [token_id, id_attestation], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Supprimer l'ancien fichier sur le disque s'il existe
            if (existing.nom_fichier) {
                const oldPath = path.join(uploadPathAttestation, existing.nom_fichier);
                fs.unlink(oldPath, (err) => {
                    if (err) console.log('Ancien fichier introuvable sur le disque');
                });
            }

            return res.json({
                success: true,
                message: "Attestation mise à jour avec succès",
                nom_fichier: nom_fichier,
                id: existing.id
            });

        } catch (error) {
            console.error('Erreur updateAttestations:', error);

            if (tempFilePath) {
                fs.unlink(tempFilePath, () => {});
            }

            return res.status(500).json({ success: false, message: "Erreur serveur" });
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
        return res.status(400).json({
            success: false,
            message: 'token_id required'
        });
    }

    const sql = `
        SELECT
            a.*,
            ta.id AS id_attestation,
            ta.titre AS titre_attestation,
            ta.titre2,
            ca.id AS id_categorie,
            ca.titre AS categorie
        FROM attestations a

        LEFT JOIN titre_attestation ta
            ON CONVERT(a.titre USING utf8mb4) COLLATE utf8mb4_unicode_ci
             = CONVERT(ta.titre USING utf8mb4) COLLATE utf8mb4_unicode_ci
            AND ta.deleted = '0'

        LEFT JOIN categorie_attestation ca
            ON ca.id = ta.id_categorie_attestation
            AND ca.deleted = '0'

        WHERE a.token_id_cand = ?
          AND a.deleted = '0'

        ORDER BY a.id DESC
    `;

    db.query(sql, [token_id], (err, results) => {
        if (err) {
            console.error('Erreur SQL getAttestations:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        return res.json({
            success: true,
            attestations: results
        });
    });
});

/*
|--------------------------------------------------------------------------
| POST /deleteAttestation (Suppression logique)
|--------------------------------------------------------------------------
*/
AttestationsScreen.post('/deleteAttestation', auth, (req, res) => {
    const token_id = req.user.token_id;
    const { id_attestation } = req.body;

    if (!token_id || !id_attestation) {
        return res.status(400).json({
            success: false,
            message: "token_id et id_attestation requis"
        });
    }

    // 1. Récupérer le titre correspondant à l'attestation
    db.query(
        `SELECT titre FROM titre_attestation WHERE id = ? AND deleted = 0`,
        [id_attestation],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (!result.length) {
                return res.status(404).json({ success: false, message: "Attestation non trouvée" });
            }

            const titre = result[0].titre;

            // 2. Passer `deleted` à 1 dans la table `attestations`
            db.query(
                `UPDATE attestations
                 SET deleted = 1
                 WHERE titre = ? AND token_id_cand = ? AND deleted = 0`,
                [titre, token_id],
                (err2, result2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({ success: false, message: "Database error" });
                    }

                    if (result2.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Aucune attestation correspondante à supprimer"
                        });
                    }

                    // 3. Remettre l'état à 0 dans documents_manquants pour exiger à nouveau le document
                    db.query(
                        `UPDATE documents_manquants 
                         SET etats = 0 
                         WHERE token_id_cand = ? AND id_attestation = ? AND deleted = 0`,
                        [token_id, id_attestation],
                        (err3) => {
                            if (err3) console.error("Erreur mise à jour documents_manquants:", err3);
                        }
                    );

                    return res.json({
                        success: true,
                        message: "Attestation supprimée (soft delete)"
                    });
                }
            );
        }
    );
});

module.exports = AttestationsScreen;