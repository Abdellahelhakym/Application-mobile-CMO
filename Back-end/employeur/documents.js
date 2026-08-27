const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");

const documents = express.Router();

// --- Les deux chemins de stockage ---
const uploadPath = path.resolve(
    __dirname,
    '../../../crm_cmo/documents/photos_employeur'
);

const uploadPathDocument = path.resolve(
    __dirname,
    '../../../crm_cmo/documents/autre_type_entreprise'
);

// Test route
documents.get('/', (req, res) => {
    res.send('Documents employeur V2');
});

/*
|--------------------------------------------------------------------------
| GET IMAGE (Existant)
|--------------------------------------------------------------------------
*/
documents.post('/getImage', auth, (req, res) => {
    const token_id = req.user.token_id;

    if (!token_id) {
        return res.status(400).json({ success: false, message: 'token_id required' });
    }

    db.query(
        `SELECT photo FROM mco_entreprise WHERE token_id = ?`,
        [token_id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false });
            }

            if (!results.length || !results[0].photo) {
                return res.status(404).json({ success: false, message: 'Image not found' });
            }

            res.json({ success: true, image: results[0].photo });
        }
    );
});

/*
|--------------------------------------------------------------------------
| UPDATE IMAGE (Existant)
|--------------------------------------------------------------------------
*/
documents.post(
    '/updateImage',
    multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, uploadPath);
            },
            filename: function (req, file, cb) {
                const ext = path.extname(file.originalname || "").toLowerCase();
                const allowedExt = [".jpg", ".jpeg", ".png"];

                if (!allowedExt.includes(ext)) {
                    return cb(new Error("Only JPG and PNG allowed"));
                }

                const hash = crypto
                    .createHash("sha256")
                    .update(Date.now() + Math.random().toString())
                    .digest("hex");

                const timestamp = Math.floor(Date.now() / 1000);
                const fileName = `photo_${hash}_${timestamp}${ext}`;

                cb(null, fileName);
            }
        })
    }).single('image'),
    (req, res) => {
        try {
            const token_id = req.body.token_id;

            if (!token_id) {
                return res.status(400).json({ success: false, message: 'token_id required' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Image required' });
            }

            const photo = req.file.filename;

            const updatePhoto = () => {
                db.query(
                    `UPDATE mco_entreprise SET photo = ? WHERE token_id = ?`,
                    [photo, token_id],
                    (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ success: false });
                        }
                        res.json({ success: true, image: photo });
                    }
                );
            };

            db.query(
                `SELECT photo FROM mco_entreprise WHERE token_id = ?`,
                [token_id],
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false });
                    }

                    const oldPhoto = results.length > 0 ? results[0].photo : null;

                    if (!oldPhoto) {
                        return updatePhoto();
                    }

                    const oldPath = path.join(uploadPath, oldPhoto);

                    fs.access(oldPath, fs.constants.F_OK, (accessErr) => {
                        if (accessErr) {
                            return updatePhoto();
                        }

                        fs.unlink(oldPath, (unlinkErr) => {
                            if (unlinkErr) console.log(unlinkErr);
                            return updatePhoto();
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

/*
|--------------------------------------------------------------------------
| DELETE IMAGE (Existant)
|--------------------------------------------------------------------------
*/
documents.post('/deleteImage', auth, (req, res) => {
    const token_id = req.user.token_id;

    if (!token_id) {
        return res.status(400).json({ success: false, message: 'token_id required' });
    }

    db.query(
        `UPDATE mco_entreprise SET photo = NULL WHERE token_id = ? AND deleted = 0`,
        [token_id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false });
            }

            return res.json({ success: true, message: 'Photo set to NULL successfully' });
        }
    );
});

/*
|--------------------------------------------------------------------------
| ==================== NOUVELLES ROUTES : DOCUMENTS ====================
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET DOCUMENT
|--------------------------------------------------------------------------
*/

documents.post('/getDocument', auth, (req, res) => {
    const token_id = req.user.token_id;

    // Vérifier le token avant de faire la requête
    if (!token_id) {
        return res.status(400).json({
            success: false,
            message: 'token_id (id_societe) requis'
        });
    }

    // Récupérer l'id de la société
    db.query(
        `SELECT id 
         FROM mco_entreprise 
         WHERE token_id = ? 
           AND deleted = 0`,
        [token_id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Erreur base de données"
                });
            }

            if (!results.length) {
                return res.status(404).json({
                    success: false,
                    message: "Société non trouvée"
                });
            }

            const id = results[0].id;

            // Récupérer les documents de cette société
            const query = `
                SELECT 
                    t.id AS type_document_id,
                    t.titre AS type_document_titre,
                    t.visible AS type_document_visible,
                    t.deleted AS type_document_deleted,
                    t.tri_ordre,
                    d.*
                FROM type_document_entreprise0 t
                LEFT JOIN documents d 
                    ON d.titre = t.id 
                    AND d.id_societe = ? 
                    AND d.deleted = '0'
                WHERE t.deleted = '0'
                  AND t.visible = '0'
                ORDER BY t.tri_ordre ASC
            `;

            db.query(query, [id], (err, results) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur base de données"
                    });
                }

                return res.json({
                    success: true,
                    documents: results
                });
            });
        }
    );
});
/*
|--------------------------------------------------------------------------
| UPDATE / INSERT DOCUMENT
|--------------------------------------------------------------------------
*/

documents.post(
    '/updateDocument',
    
    multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, uploadPathDocument);
            },

            filename: function (req, file, cb) {
                const ext = path.extname(file.originalname || "").toLowerCase();
                const allowedExt = [".pdf", ".jpg", ".jpeg", ".png", ".docx"];

                if (!allowedExt.includes(ext)) {
                    return cb(new Error("Format de fichier non autorisé"));
                }

                const randomPrefix = Math.floor(Math.random() * 90) + 10;
                const timestamp = Math.floor(Date.now() / 1000);

                const fileName = `${randomPrefix}_${timestamp}${ext}`;

                cb(null, fileName);
            }
        })
    }).single('document'),auth,

    (req, res) => {

        try {

            const token_id = req.user.token_id;
            const id_typeDocument = req.body.id_typeDocument;

            if (!token_id) {
                return res.status(400).json({
                    success: false,
                    message: 'token_id required'
                });
            }

            if (!id_typeDocument) {
                return res.status(400).json({
                    success: false,
                    message: 'id_typeDocument required'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Document file required'
                });
            }

            const documentName = req.file.filename;

            /*
            |--------------------------------------------------------------------------
            | 1. Récupérer l'ID de la société
            |--------------------------------------------------------------------------
            */

            db.query(
                `SELECT id
                 FROM mco_entreprise
                 WHERE token_id = ?
                   AND deleted = 0`,
                [token_id],

                (err, results) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: 'Erreur base de données'
                        });
                    }

                    if (!results.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Société non trouvée'
                        });
                    }

                    // Même ID utilisé dans getDocument
                    const id_societe = results[0].id;

                    /*
                    |--------------------------------------------------------------------------
                    | 2. Vérifier si le document existe
                    |--------------------------------------------------------------------------
                    */

                    const checkQuery = `
                        SELECT id
                        FROM documents
                        WHERE id_societe = ?
                          AND titre = ?
                          AND deleted = 0
                        LIMIT 1
                    `;

                    db.query(
                        checkQuery,
                        [id_societe, id_typeDocument],

                        (err, rows) => {

                            if (err) {
                                console.error(err);

                                return res.status(500).json({
                                    success: false,
                                    message: 'Erreur database'
                                });
                            }

                            /*
                            |--------------------------------------------------------------------------
                            | 3. DOCUMENT EXISTE -> UPDATE
                            |--------------------------------------------------------------------------
                            */

                            if (rows.length > 0) {

                                const updateQuery = `
                                    UPDATE documents
                                    SET document = ?
                                    WHERE id_societe = ?
                                      AND titre = ?
                                      AND deleted = 0
                                `;

                                db.query(
                                    updateQuery,
                                    [
                                        documentName,
                                        id_societe,
                                        id_typeDocument
                                    ],

                                    (errUpdate, resultUpdate) => {

                                        if (errUpdate) {
                                            console.error(errUpdate);

                                            return res.status(500).json({
                                                success: false,
                                                message: 'Erreur lors de la mise à jour'
                                            });
                                        }

                                        return res.json({
                                            success: true,
                                            message: 'Document mis à jour avec succès',
                                            document: documentName,
                                            id_societe: id_societe,
                                            id_typeDocument: id_typeDocument,
                                            action: 'update'
                                        });
                                    }
                                );

                            }

                            /*
                            |--------------------------------------------------------------------------
                            | 4. DOCUMENT N'EXISTE PAS -> INSERT
                            |--------------------------------------------------------------------------
                            */

                            else {

                                const insertQuery = `
                                    INSERT INTO documents
                                    (
                                        titre,
                                        document,
                                        id_societe,
                                        etat,
                                        type_document,
                                        deleted
                                    )
                                    VALUES (?, ?, ?, 1, ?, 0)
                                `;

                                db.query(
                                    insertQuery,
                                    [
                                        id_typeDocument,
                                        documentName,
                                        id_societe,
                                        id_typeDocument
                                    ],

                                    (errInsert, resultInsert) => {

                                        if (errInsert) {
                                            console.error(errInsert);

                                            return res.status(500).json({
                                                success: false,
                                                message: 'Erreur lors de l insertion'
                                            });
                                        }

                                        return res.json({
                                            success: true,
                                            message: 'Document enregistré avec succès',
                                            document: documentName,
                                            id: resultInsert.insertId,
                                            id_societe: id_societe,
                                            id_typeDocument: id_typeDocument,
                                            action: 'insert'
                                        });
                                    }
                                );
                            }
                        }
                    );
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

/*
|--------------------------------------------------------------------------
| DELETE DOCUMENT
|--------------------------------------------------------------------------
*/

documents.post('/deleteDocument', auth, (req, res) => {

    const token_id = req.user.token_id;
    const id_document = req.body.id_document;

    if (!token_id) {
        return res.status(400).json({
            success: false,
            message: 'token_id requis'
        });
    }

    if (!id_document) {
        return res.status(400).json({
            success: false,
            message: 'id_document requis'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 1. Récupérer l'ID de la société avec token_id
    |--------------------------------------------------------------------------
    */

    db.query(
        `SELECT id
         FROM mco_entreprise
         WHERE token_id = ?
           AND deleted = 0`,
        [token_id],

        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: 'Erreur base de données'
                });
            }

            if (!results.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Société non trouvée'
                });
            }

            // Même logique que getDocument
            const id_societe = results[0].id;

            /*
            |--------------------------------------------------------------------------
            | 2. Suppression logique du document
            |--------------------------------------------------------------------------
            */

            db.query(
                `UPDATE documents
                 SET deleted = 2
                 WHERE id_societe = ?
                   AND id = ?
                   AND deleted = 0`,
                [id_societe, id_document],

                (err, result) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: 'Erreur lors de la suppression'
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            message: 'Document non trouvé'
                        });
                    }

                    return res.json({
                        success: true,
                        message: 'Document supprimé avec succès',
                        id_document: id_document,
                        id_societe: id_societe,
                        affectedRows: result.affectedRows
                    });
                }
            );
        }
    );
});
module.exports = documents;