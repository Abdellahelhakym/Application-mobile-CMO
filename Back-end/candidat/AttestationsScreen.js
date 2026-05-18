const express = require('express');
const db = require('../db');
const fs = require('fs');
const multer = require("multer");
const path = require('path');

const AttestationsScreen = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, "../fils/Document"));
        },
        filename: function (req, file, cb) {
            const ext = (path.extname(file.originalname || "") || ".pdf").toLowerCase();
            const nom_fichier =
                Date.now() +
                "_" +
                Math.floor(Math.random() * 1000000) +
                ext;
            cb(null, nom_fichier);
        }
    })
});

const removeFileIfExists = (dirPath, filename, done) => {
    if (!filename) {
        return done();
    }

    const filePath = path.join(dirPath, filename);

    fs.access(filePath, fs.constants.F_OK, (accessErr) => {
        if (accessErr) {
            return done();
        }

        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.log(unlinkErr);
            }

            return done();
        });
    });
};

AttestationsScreen.get('/', (req, res) => {
    res.send('Attestations route');
});

AttestationsScreen.post('/categorie', (req, res) => {
    const { token_id } = req.body;

    console.log('Received categories request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `SELECT * from categorie_attestation where deleted = 0`,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            return res.json(results);
        }
    );
});

AttestationsScreen.post('/', (req, res) => {

    const { token_id } = req.body;

    console.log('Received attestations request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
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

        INNER JOIN titre_attestation ta
            ON dm.id_attestation = ta.id

        INNER JOIN categorie_attestation ca
            ON ta.id_categorie_attestation = ca.id

        WHERE dm.deleted = 0
        AND ta.deleted = 0
        AND ca.deleted = 0
        AND dm.token_id_cand = ?
        `,
        [token_id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            return res.json(results);
        }
    );
});

AttestationsScreen.post(
    '/updateAttestations',

    multer({
        storage: multer.diskStorage({

            destination: function (req, file, cb) {

                const uploadPath = path.join(__dirname, "../fils/Document");

                // create folder if not exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                cb(null, uploadPath);
            },

            filename: function (req, file, cb) {

                const ext = (path.extname(file.originalname || "") || ".pdf").toLowerCase();

                const nom_fichier =
                    Date.now() +
                    "_" +
                    Math.floor(Math.random() * 1000000) +
                    ext;

                cb(null, nom_fichier);
            }
        }),

        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB
        }

    }).single("fichier"),

    async (req, res) => {

        try {

            const token_id = req.body.token_id;
            const id_attestation = req.body.id_attestation;

            // ================= VALIDATION =================

            if (!token_id) {
                return res.status(400).json({
                    success: false,
                    message: "token_id is required"
                });
            }

            if (!id_attestation) {
                return res.status(400).json({
                    success: false,
                    message: "id_attestation is required"
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "fichier is required"
                });
            }

            const nom_fichier = req.file.filename;
            const fichierDir = path.join(__dirname, "../fils/Document");

            // ================= GET TITRE =================

            const attestationSql = `
                SELECT titre
                FROM titre_attestation
                WHERE id = ?
                AND deleted = 0
            `;

            db.query(attestationSql, [id_attestation], (attErr, attRows) => {

                if (attErr) {

                    console.log(attErr);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (!attRows.length) {

                    return res.status(404).json({
                        success: false,
                        message: "Attestation not found"
                    });
                }

                const titre = attRows[0].titre;

                // ================= CHECK EXISTING FILE =================

                const findCvSql = `
                    SELECT id, cvitae
                    FROM cv_candidat
                    WHERE token_id = ?
                    AND titre = ?
                    AND deleted = 0
                `;

                db.query(findCvSql, [token_id, titre], (findErr, cvRows) => {

                    if (findErr) {

                        console.log(findErr);

                        return res.status(500).json({
                            success: false,
                            message: "Database error"
                        });
                    }

                    // ================= UPDATE DOCUMENTS MANQUANTS =================

                    const updateDocManquant = `
                        UPDATE documents_manquants
                        SET etats = 1
                        WHERE deleted = 0
                        AND token_id_cand = ?
                        AND id_attestation = ?
                    `;

                    // =========================================================
                    // INSERT NEW
                    // =========================================================

                    if (!cvRows.length) {

                        const insertCV = `
                            INSERT INTO cv_candidat (
                                token_id,
                                titre,
                                cvitae,
                                etats,
                                deleted,
                                created_at
                            )
                            VALUES (?, ?, ?, 1, 0, NOW())
                        `;

                        db.query(
                            insertCV,
                            [token_id, titre, nom_fichier],
                            (insertErr, insertResult) => {

                                if (insertErr) {

                                    console.log(insertErr);

                                    return res.status(500).json({
                                        success: false,
                                        message: "Insert error"
                                    });
                                }

                                db.query(
                                    updateDocManquant,
                                    [token_id, id_attestation],
                                    (err2) => {

                                        if (err2) {

                                            console.log(err2);

                                            return res.status(500).json({
                                                success: false,
                                                message: "Update error"
                                            });
                                        }

                                        return res.json({
                                            success: true,
                                            message: "Attestation inserted successfully",
                                            fichier: nom_fichier,
                                            cv_id: insertResult.insertId
                                        });
                                    }
                                );
                            }
                        );

                        return;
                    }

                    // =========================================================
                    // UPDATE EXISTING
                    // =========================================================

                    const existing = cvRows[0];

                    const updateCV = `
                        UPDATE cv_candidat
                        SET 
                            cvitae = ?,
                            etats = 1
                        WHERE id = ?
                        AND token_id = ?
                        AND deleted = 0
                    `;

                    db.query(
                        updateCV,
                        [nom_fichier, existing.id, token_id],
                        (updateErr) => {

                            if (updateErr) {

                                console.log(updateErr);

                                return res.status(500).json({
                                    success: false,
                                    message: "Update error"
                                });
                            }

                            db.query(
                                updateDocManquant,
                                [token_id, id_attestation],
                                (err2) => {

                                    if (err2) {

                                        console.log(err2);

                                        return res.status(500).json({
                                            success: false,
                                            message: "Document update error"
                                        });
                                    }

                                    // ================= DELETE OLD FILE =================

                                    if (existing.cvitae) {

                                        const oldPath = path.join(
                                            fichierDir,
                                            existing.cvitae
                                        );

                                        fs.access(oldPath, fs.constants.F_OK, (accessErr) => {

                                            if (!accessErr) {

                                                fs.unlink(oldPath, (unlinkErr) => {

                                                    if (unlinkErr) {
                                                        console.log(unlinkErr);
                                                    }
                                                });
                                            }
                                        });
                                    }

                                    return res.json({
                                        success: true,
                                        message: "Attestation updated successfully",
                                        fichier: nom_fichier,
                                        cv_id: existing.id
                                    });
                                }
                            );
                        }
                    );
                });
            });

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
);
AttestationsScreen.post('/getAttestations', (req, res) => {

    const { token_id } = req.body;

    // ================= VALIDATION =================

    if (!token_id) {

        return res.status(400).json({
            success: false,
            message: "token_id required"
        });
    }

    // ================= GET FILES =================

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

        INNER JOIN titre_attestation ta
            ON cv.titre = ta.titre

        INNER JOIN categorie_attestation ca
            ON ta.id_categorie_attestation = ca.id

        WHERE cv.token_id = ?
        AND cv.etats = 1
        AND cv.deleted = 0

        ORDER BY cv.id DESC
    `;

    db.query(sql, [token_id], (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (!results.length) {

            return res.status(404).json({
                success: false,
                message: "No attestations found"
            });
        }

        return res.json({
            success: true,
            files: results
        });
    });
});
AttestationsScreen.post('/deleteAttestation', (req, res) => {

    const { token_id, id_attestation } = req.body;

    if (!token_id || !id_attestation) {
        return res.status(400).json({
            success: false,
            message: "token_id and id_attestation required"
        });
    }

    const fichierDir = path.join(__dirname, "../fils/Document");

    // 1️⃣ get titre
    const getTitreSql = `
        SELECT titre
        FROM titre_attestation
        WHERE id = ?
        AND deleted = 0
    `;

    db.query(getTitreSql, [id_attestation], (err, rows) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ success: false });
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Attestation not found"
            });
        }

        const titre = rows[0].titre;

        // 2️⃣ find cv
        const findSql = `
            SELECT id, cvitae
            FROM cv_candidat
            WHERE token_id = ?
            AND titre = ?
            AND deleted = 0
        `;

        db.query(findSql, [token_id, titre], (err2, cvRows) => {

            if (err2) {
                console.log(err2);
                return res.status(500).json({ success: false });
            }

            if (!cvRows.length) {
                return res.status(404).json({
                    success: false,
                    message: "File not found"
                });
            }

            const cv = cvRows[0];

            // 3️⃣ soft delete
            const updateSql = `
                UPDATE cv_candidat
                SET etats = 0, cvitae = NULL
                WHERE id = ?
                AND token_id = ?
                AND deleted = 0
            `;

            db.query(updateSql, [cv.id, token_id], (err3) => {

                if (err3) {
                    console.log(err3);
                    return res.status(500).json({ success: false });
                }

                // 4️⃣ update documents_manquants
                const updateDoc = `
                    UPDATE documents_manquants
                    SET etats = 0
                    WHERE token_id_cand = ?
                    AND id_attestation = ?
                    AND deleted = 0
                `;

                db.query(updateDoc, [token_id, id_attestation], (err4) => {

                    if (err4) {
                        console.log(err4);
                        return res.status(500).json({ success: false });
                    }

                    // 5️⃣ delete file
                    const filePath = path.join(fichierDir, cv.cvitae || "");

                    fs.access(filePath, fs.constants.F_OK, (exists) => {

                        if (!exists) {
                            fs.unlink(filePath, () => {});
                        }

                        return res.json({
                            success: true,
                            message: "Deleted successfully"
                        });
                    });
                });
            });
        });
    });
});

module.exports = AttestationsScreen;
