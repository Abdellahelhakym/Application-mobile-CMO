const express = require('express');
const db = require('../db');

const MessagerieEmp = express.Router();
const auth = require('../middleware/auth');

MessagerieEmp.get('/', auth, (req, res) => {
    res.send('Messagerie employer route');
});

MessagerieEmp.post('/getMessages', auth, (req, res) => {

    const token_id = req.user.token_id;

    db.query(
        `SELECT *
         FROM messagerie
         WHERE id_user = ?
         AND type_message = 'Employeur'
         AND deleted = 0 
         ORDER BY id DESC`,
        [token_id],
        (err, messages) => {

            if (err) {
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (!messages.length) {
                return res.json([]);
            }

            return res.json(messages);
        }
    );
});

MessagerieEmp.post('/getSousMessages', auth, (req, res) => {

    const token_id = req.user.token_id;
    const id_msg = req.body.id_msg;

    db.query(
        `SELECT *
         FROM histo_messagerie
         WHERE id_user = ?
         AND id_msg = ? AND deleted = 0` ,
        [token_id, id_msg],
        (err, messages) => {

            if (err) {
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (!messages.length) {
                return res.json([]);
            }

            return res.json(messages);
        }
    );
});

MessagerieEmp.post('/CreateMessage', auth, (req, res) => {

    const token_id = req.user.token_id;
    const { message, sujet } = req.body;
  

    if (!message || !sujet) {
        return res.status(400).json({
            error: 'Champs manquants'
        });
    }

    db.query(
        `INSERT INTO messagerie
        (id_user, type_message, sujet, description, date_sujet, heure_sujet, statut, id_retour, deleted)
        VALUES (?, 'Employeur', ?, ?, CURDATE(), CURTIME(), 10, 10, 0)`,
        [token_id, sujet, message],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.sqlMessage
                });
            }

            const idM = result.insertId;

            db.query(
                `INSERT INTO histo_messagerie
                (type_msg, id_msg, id_user, message, statut, date_msg, heure_msg, id_retour, deleted)
                VALUES ('Employeur', ?, ?, ?, 10, CURDATE(), CURTIME(), 10, 0)`,
                [idM, token_id, message],
                (err2) => {

                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({
                            error: 'Internal server error',
                            details: err2.sqlMessage
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        id_message: idM
                    });
                }
            );
        }
    );
});

MessagerieEmp.post('/SendMessage', auth, (req, res) => {

    const token_id = req.user.token_id;
    const { message, id_msg } = req.body;

    if (!message || !id_msg) {
        return res.status(400).json({
            error: 'Champs manquants'
        });
    }

    db.query(
        `INSERT INTO histo_messagerie
        (type_msg, id_msg, id_user, message, statut, date_msg, heure_msg, id_retour, deleted)
        VALUES ('Employeur', ?, ?, ?, 3, CURDATE(), CURTIME(), 10, 0)`,
        [id_msg, token_id, message],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.sqlMessage
                });
            }

            db.query(
                `UPDATE messagerie
                 SET statut = 3
                 WHERE id = ? AND id_user = ? AND deleted = 0`,
                [id_msg, token_id],
                (err2) => {

                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({
                            error: 'Internal server error',
                            details: err2.sqlMessage
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        id_message: id_msg
                    });
                }
            );
        }
    );
});


MessagerieEmp.post('/ClotureMessage', auth, (req, res) => {

    const token_id = req.user.token_id;
    const id_msg = req.body.id_msg ;

    if (!id_msg) {
        return res.status(400).json({
            error: 'Champs manquants'
        });
    }

    db.query(
        `update messagerie set statut = 4 where id = ? and id_user = ? and deleted = 0`,
        [id_msg, token_id],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error',
                    details: err.sqlMessage
                });
            }


            db.query(
                `update histo_messagerie set statut = 4 where id_msg = ? and id_user = ? and deleted = 0`,
                [id_msg, token_id],
                (err2) => {

                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({
                            error: 'Internal server error',
                            details: err2.sqlMessage
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        id_message: id_msg
                    });
                }
            );
        }
    );
});

MessagerieEmp.post('/Notification', auth, (req, res) => {

    const token_id = req.user.token_id;

    const sql = `
        SELECT 
            COUNT(*) AS nombre_msg,
            GROUP_CONCAT(id_msg) AS ids_msg,
            GROUP_CONCAT(message SEPARATOR '|||') AS messages
        FROM histo_messagerie
        WHERE deleted = 0
          AND statut = 2
          AND id_user = ?
          AND id_msg IN (
              SELECT id
              FROM messagerie
              WHERE statut = 2 AND type_message = 'Employeur'
                AND deleted = 0
                AND id_user = ?
          )
    `;

    db.query(sql, [token_id, token_id], (err, rows) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: 'Erreur serveur'
            });
        }

        return res.json({
            success: true,
            nombre_msg: rows[0].nombre_msg,
            ids_msg: rows[0].ids_msg ? rows[0].ids_msg.split(',').map(Number) : [],
            messages: rows[0].messages ? rows[0].messages.split('|||') : []
        });
    });

});

module.exports = MessagerieEmp;