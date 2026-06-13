const db = require('../db');

module.exports = (req, res, next) => {

    const token_id =
        req.body?.token_id ||
        req.headers['token-id'];

    if (!token_id) {
        return res.status(401).json({
            error: "tu n'a pas le droit"
        });
    }

    db.query(
        'SELECT * FROM users WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {

            if (err) {
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Token invalide' });
            }

            req.user = results[0]; // utilisateur connecté
            next();
        }
    );
};