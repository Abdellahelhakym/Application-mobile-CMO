const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");

const documents = express.Router();

const uploadPath = path.resolve(
    __dirname,
    '../../../crm_cmo/documents/photos_employeur'
);

// Test route
documents.get('/', auth, (req, res) => {
    res.send('Documents route');
});

/*
|--------------------------------------------------------------------------
| GET IMAGE
|--------------------------------------------------------------------------
*/

documents.post('/getImage', auth, (req, res) => {

    const token_id = req.user.token_id;

    if (!token_id) {
        return res.status(400).json({
            success: false,
            message: 'token_id required'
        });
    }

    db.query(
        `
        SELECT photo
        FROM mco_entreprise
        WHERE token_id = ?
        `,
        [token_id],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false
                });
            }

            if (!results.length || !results[0].photo) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found'
                });
            }

            res.json({
                success: true,
                image: results[0].photo
            });
        }
    );
});

/*
|--------------------------------------------------------------------------
| UPDATE IMAGE
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
                return res.status(400).json({
                    success: false,
                    message: 'token_id required'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Image required'
                });
            }

            const photo = req.file.filename;

            const updatePhoto = () => {

                db.query(
                    `
                    UPDATE mco_entreprise
                    SET photo = ?
                    WHERE token_id = ?
                    `,
                    [photo, token_id],
                    (err) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false
                            });
                        }

                        res.json({
                            success: true,
                            image: photo
                        });
                    }
                );
            };

            db.query(
                `
                SELECT photo
                FROM mco_entreprise
                WHERE token_id = ?
                `,
                [token_id],
                (err, results) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            success: false
                        });
                    }

                    const oldPhoto =
                        results.length > 0
                            ? results[0].photo
                            : null;

                    if (!oldPhoto) {
                        return updatePhoto();
                    }

                    const oldPath =
                        path.join(uploadPath, oldPhoto);

                    fs.access(
                        oldPath,
                        fs.constants.F_OK,
                        (accessErr) => {

                            if (accessErr) {
                                return updatePhoto();
                            }

                            fs.unlink(oldPath, (unlinkErr) => {

                                if (unlinkErr) {
                                    console.log(unlinkErr);
                                }

                                return updatePhoto();
                            });
                        }
                    );
                }
            );

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false
            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| DELETE IMAGE
|--------------------------------------------------------------------------
*/

documents.post('/deleteImage', auth, (req, res) => {

    const token_id = req.user.token_id;

    if (!token_id) {
        return res.status(400).json({
            success: false,
            message: 'token_id required'
        });
    }

    db.query(
        `
        SELECT photo
        FROM mco_entreprise
        WHERE token_id = ?
        `,
        [token_id],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false
                });
            }

            const oldPhoto =
                results.length > 0
                    ? results[0].photo
                    : null;

            const removeFromDatabase = () => {

                db.query(
                    `
                    UPDATE mco_entreprise
                    SET photo = NULL
                    WHERE token_id = ?
                    `,
                    [token_id],
                    (err) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false
                            });
                        }

                        res.json({
                            success: true,
                            message: 'Photo deleted successfully'
                        });
                    }
                );
            };

            if (!oldPhoto) {
                return removeFromDatabase();
            }

            const oldPath =
                path.join(uploadPath, oldPhoto);

            fs.access(
                oldPath,
                fs.constants.F_OK,
                (accessErr) => {

                    if (accessErr) {
                        return removeFromDatabase();
                    }

                    fs.unlink(oldPath, (unlinkErr) => {

                        if (unlinkErr) {
                            console.log(unlinkErr);
                        }

                        return removeFromDatabase();
                    });
                }
            );
        }
    );
});

module.exports = documents;