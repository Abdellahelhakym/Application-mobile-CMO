const express = require('express');
const db = require('../db');
const fs = require('fs');
const multer = require("multer");
const path = require('path');

const AttestationsScreen = express.Router();

AttestationsScreen.get('/', (req, res) => {
    res.send('Attestations route');
}
);

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
        });
        
}
);


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
    }).single("fichier"),

    async (req, res) => {

        try {

            const token_id = req.body.token_id;
            const id_attestation = req.body.id_attestation;
            const id_document_manquant = req.body.id_document_manquant;

            if (!token_id) {
                return res.status(400).json({
                    success: false,
                    message: "token_id is required"
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

            // 🔥 1. UPDATE / INSERT cv_candidat
            const updateCV = `
                UPDATE cv_candidat
                SET cvitae = ?, etats = 1
                WHERE deleted = 0
                AND token_id = ?
            `;

            const insertCV = `
                INSERT INTO cv_candidat (token_id, cvitae, etats, deleted)
                VALUES (?, ?, 1, 0)
            `;

            // 🔥 2. UPDATE documents_manquants (marquer comme complété)
            const updateDocManquant = `
                UPDATE documents_manquants
                SET etats = 1
                WHERE deleted = 0
                AND token_id_cand = ?
            `;

            const updateAll = () => {

                db.query(updateCV, [nom_fichier, token_id], (err, updateResult) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false });
                    }

                    if (updateResult.affectedRows === 0) {
                        db.query(insertCV, [token_id, nom_fichier], (insertErr) => {
                            if (insertErr) {
                                console.log(insertErr);
                                return res.status(500).json({ success: false });
                            }

                            db.query(updateDocManquant, [token_id], (err2) => {
                                if (err2) {
                                    console.log(err2);
                                    return res.status(500).json({ success: false });
                                }

                                return res.json({
                                    success: true,
                                    fichier: nom_fichier
                                });
                            });
                        });

                        return;
                    }

                    db.query(updateDocManquant, [token_id], (err2) => {
                        if (err2) {
                            console.log(err2);
                            return res.status(500).json({ success: false });
                        }

                        return res.json({
                            success: true,
                            fichier: nom_fichier
                        });
                    });
                });
            };

            // 🔥 3. check ancien fichier
            db.query(
                `SELECT cvitae FROM cv_candidat WHERE token_id = ? AND deleted = 0`,
                [token_id],
                (err, results) => {

                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false });
                    }

                    const currentFile = results[0] ? results[0].cvitae : null;

                    if (!currentFile) {
                        return updateAll();
                    }

                    const oldPath = path.join(fichierDir, currentFile);

                    fs.access(oldPath, fs.constants.F_OK, (accessErr) => {

                        if (accessErr) {
                            return updateAll();
                        }

                        fs.unlink(oldPath, (unlinkErr) => {

                            if (unlinkErr) {
                                console.log(unlinkErr);
                            }

                            return updateAll();
                        });
                    });
                }
            );

        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false });
        }
    }
);



AttestationsScreen.post('/getAttestations', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({
            success: false,
            message: "token_id required"
        });
    }

    const sql = `
        SELECT id, cvitae, titre
        FROM cv_candidat
        WHERE token_id = ? AND etats = 1
        AND deleted = 0
    `;

    db.query(sql, [token_id], (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false
            });
        }

        if (!results.length) {
            return res.status(404).json({
                success: false,
                message: "No files found"
            });
        }

        res.json({
            success: true,
            files: results
        });
    });
});

AttestationsScreen.post('/deleteAttestation', (req, res) => {

    const { token_id , id_attestation } = req.body;
    console.log('Received deleteAttestation request with token_id and id_attestation');
    if (!token_id || !id_attestation) {
        return res.status(400).json({
            success: false,
            message: "token_id and id_attestation required"
        });
    }

    db.query(
        `UPDATE cv_candidat SET etats = 0  WHERE token_id = ? AND id = ? AND deleted = 0`,
        [token_id, id_attestation],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }

            db.query(
                `UPDATE documents_manquants SET etats = 0 WHERE token_id_cand = ? AND id_attestation = ? AND deleted = 0`,
                [token_id, id_attestation],
                (err2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({
                            success: false,
                            message: "Internal server error"
                        });
                    }

                    return res.json({
                        success: true,
                        message: "File deleted successfully"
                    });
                }
            );
        }
    );

});


module.exports = AttestationsScreen;
