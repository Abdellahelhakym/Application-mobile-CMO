const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const auth = require('./middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  res.send('Delete Account route');
});

router.post('/candidat', auth, (req, res) => {
    const token_id = req.user.token_id;

    db.query(
        'UPDATE users SET deleted = 3 WHERE token_id = ? AND roles = "10_C"',
        [token_id],
        (err, result) => {
            if (err) {
                console.error('Error deleting account:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting account'
                });
            }

            db.query(
                'UPDATE cmo_candidats SET deleted = 3 WHERE token_id = ?',
                [token_id],
                (err, result) => {
                    if (err) {
                        console.error('Error deleting account:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error deleting account'
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Account deleted successfully'
                    });
                }
            );
        }
    );
});
router.post('/employeur', auth, (req, res) => {
    const token_id = req.user.token_id;

    db.query(
        'UPDATE users SET deleted = 3 WHERE token_id = ? AND roles = "10_P"',
        [token_id],
        (err, result) => {
            if (err) {
                console.error('Error deleting account:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting account'
                });
            }

            db.query(
                'UPDATE mco_entreprise SET deleted = 3 WHERE token_id = ?',
                [token_id],
                (err, result) => {
                    if (err) {
                        console.error('Error deleting account:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error deleting account'
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Account deleted successfully'
                    });
                }
            );
        }
    );
});

module.exports = router;