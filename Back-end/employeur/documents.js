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
documents.get('/', auth, (req, res) => {
    res.send('Documents & Images route');
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
    const token_id = req.user.token_id; // Correspond à $row_edit11['id'] (id_societe)


    if (!token_id) {
        return res.status(400).json({
            success: false,
            message: 'token_id (id_societe) requis'
        });
    }
    

    // On sélectionne toutes les colonnes des deux tables.
    // On utilise des alias (t.* et d.*) pour éviter que les colonnes ayant le même nom (comme 'id') ne s'écrasent.
    const query = `
        SELECT 
            t.id AS type_document_id,
            t.titre AS type_document_titre,
            t.visible AS type_document_visible,
            t.deleted AS type_document_deleted,
            t.tri_ordre,
            d.* -- Récupère absolument toutes les colonnes de la table 'documents' (SELECT * FROM documents)
        FROM type_document_entreprise0 t
        LEFT JOIN documents d 
            ON d.titre = t.id 
            AND d.id_societe = ? 
            AND d.deleted = '0'
        WHERE t.deleted = '0'
          AND t.visible = '0'
        ORDER BY t.tri_ordre ASC
    `;

    db.query(query, [token_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Erreur base de données" });
        }

        // On renvoie exactement le résultat
        return res.json({
            success: true,
            documents: results
        });
    });
});

/*
|--------------------------------------------------------------------------
| UPLOAD DOCUMENT
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
    }).single('document'),

    (req, res) => {
        try {
            const token_id = req.body.token_id; // id_societe
            const id_typeDocument = req.body.id_typeDocument; // ID envoyé par le front

            if (!token_id) {
                return res.status(400).json({ success: false, message: 'token_id required' });
            }

            if (!id_typeDocument) {
                return res.status(400).json({ success: false, message: 'id_typeDocument required' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Document file required' });
            }

            const documentName = req.file.filename;

            // 1. Vérification : On cherche si un document existe déjà avec ce "titre" (qui stocke l'id du type)
            const checkQuery = `
                SELECT id FROM documents 
                WHERE id_societe = ? AND titre = ? AND deleted = 0 
                LIMIT 1
            `;

            db.query(checkQuery, [token_id, id_typeDocument], (err, rows) => {
                if (err) {
                    console.error("Erreur lors de la vérification :", err);
                    return res.status(500).json({ success: false, message: "Database error" });
                }

                if (rows.length > 0) {
                    // 2. Si trouvé -> UPDATE (on met à jour le fichier basé sur la recherche du "titre")
                    const updateQuery = `
                        UPDATE documents 
                        SET document = ? 
                        WHERE id_societe = ? AND titre = ? AND deleted = 0
                    `;
                    
                    db.query(
                        updateQuery, 
                        [documentName, token_id, id_typeDocument], 
                        (errUpdate, resultUpdate) => {
                            if (errUpdate) {
                                console.error("Erreur lors de l'update :", errUpdate);
                                return res.status(500).json({ success: false });
                            }

                            return res.json({
                                success: true,
                                message: 'Document mis à jour avec succès (UPDATE)',
                                document: documentName,
                                action: 'update'
                            });
                        }
                    );

                } else {
                    // 3. Si non trouvé -> INSERT
                    // On insère l'ID reçu à la fois dans "titre" et dans "type_document"
                    const insertQuery = `
                        INSERT INTO documents (titre, document, id_societe, etat, type_document, deleted) 
                        VALUES (?, ?, ?, 1, ?, 0)
                    `;

                    db.query(
                        insertQuery,
                        [id_typeDocument, documentName, token_id, id_typeDocument], // id_typeDocument est passé pour "titre" ET pour "type_document"
                        (errInsert, resultInsert) => {
                            if (errInsert) {
                                console.error("Erreur lors de l'insertion :", errInsert);
                                return res.status(500).json({ success: false });
                            }

                            return res.json({
                                success: true,
                                message: 'Document enregistré avec succès (INSERT)',
                                document: documentName,
                                id: resultInsert.insertId,
                                action: 'insert'
                            });
                        }
                    );
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false });
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

    db.query(
        `UPDATE documents SET deleted = 2 WHERE id_societe = ? AND id = ?`,
        [token_id, id_document],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false });
            }

            return res.json({
                success: true,
                message: 'Documents mis à jour avec succès',
                affectedRows: result.affectedRows
            });
        }
    );
});

module.exports = documents;