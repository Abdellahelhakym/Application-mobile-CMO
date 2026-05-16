const express = require('express');
const db = require('../db');

const CVScreen = express.Router();

CVScreen.get('/', (req, res) => {
    res.send('CV Screen route');
});

//---------------------------------affichage---------------------------------
CVScreen.post('/Informations', (req, res) => {
    const { token_id } = req.body;

    console.log('Received CV Informations request with token_id');

    db.query('SELECT photo , civilite , prenom , nom , email , tel , code_postal , ville , pays , num_secur_social FROM cmo_candidats WHERE token_id = ? and deleted = 0', [token_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);
    });

});

CVScreen.post('/ToutMobilite', (req, res) => {
    const { token_id } = req.body;

    console.log('Received CV ToutMobilite request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }
    db.query(
        ` SELECT * FROM regions WHERE deleted = 0`, 
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            return res.json(results);



        });

});


CVScreen.post('/Mobilite', (req, res) => {

    const { token_id } = req.body;

    console.log('Received CV Mobilite request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `
        SELECT 
            r.id AS id_region,
            r.titre AS region

        FROM mobilite_candidats m

        INNER JOIN regions r
            ON m.id_region = r.id

        WHERE m.token_id_cand = ?
        AND m.deleted = 0
        AND r.deleted = 0
        `,
        [token_id],
        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            const mobilite = results.map(item => ({
                id_region: item.id_region,
                region: item.region
            }));

            db.query(
                `
                SELECT 
                    niveau_etude,
                    experience,
                    contrat_prefere1,
                    contrat_prefere2,
                  
                    disponibilite,
                    date_disponibilite

                FROM cmo_candidats

                WHERE token_id = ?
                AND deleted = 0
                `,
                [token_id],
                (err, experienceResults) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    const experienceData = experienceResults[0] || {};

                    return res.json({
                        mobilite,
                        niveau_etude: experienceData.niveau_etude || null,
                        experience: experienceData.experience || null,
                        contrat_prefere1: experienceData.contrat_prefere1 || null,
                        contrat_prefere2: experienceData.contrat_prefere2 || null,
     
                        disponibilite: experienceData.disponibilite || null,
                        date_disponibilite: experienceData.date_disponibilite || null
                    });
                }
            );
        }
    );
});



CVScreen.post('/Permis', (req, res) => {
    const { token_id } = req.body;

    console.log('Received CV Informations request with token_id');

    db.query('SELECT * from permis WHERE token_id_cand = ?', [token_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);
    });

});

CVScreen.post('/Langues', (req, res) => {
    const { token_id } = req.body;

    console.log('Received CV Informations request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query('SELECT * from langues WHERE token_id_cand = ?', [token_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);
    });

});


CVScreen.post('/Langues', (req, res) => {
    const { token_id } = req.body;

    console.log('Received CV Informations request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query('SELECT * from langues WHERE token_id_cand = ?', [token_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);

    });

});





//---------------------------------modification---------------------------------
CVScreen.post('/updateInformations', (req, res) => {
    const { token_id, civilite, prenom, nom, email, tel, code_postal, ville, pays, num_secur_social } = req.body;
    console.log('Received CV updateInformations request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query('UPDATE cmo_candidats SET civilite = ?, prenom = ?, nom = ?, email = ?, tel = ?, code_postal = ?, ville = ?, pays = ?, num_secur_social = ? WHERE token_id = ? and deleted = 0', [civilite, prenom, nom, email, tel, code_postal, ville, pays, num_secur_social, token_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }

        return res.json(results);
    });

});

CVScreen.post('/updateMobilite', (req, res) => {

    const { token_id, mobilite, niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite } = req.body;
    console.log('Received CV updateMobilite request with token_id' , mobilite, niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite);
   

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `
        UPDATE mobilite_candidats SET id_region = ?
        WHERE token_id_cand = ?
        AND deleted = 0
        `,
        [mobilite, token_id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
        });

    db.query(
        `UPDATE cmo_candidats SET niveau_etude = ?, experience = ?, contrat_prefere1 = ?, contrat_prefere2 = ?, disponibilite = ?, date_disponibilite = ? WHERE token_id = ? AND deleted = 0`,
        [niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite, token_id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
        });

    return res.json({
        message: 'Mobilite and experience updated successfully'
    });
});

CVScreen.post('/updatePermis', (req, res) => {
    const {token_id, perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier   } = req.body;
  
    console.log('Received CV updatePermis request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `UPDATE permis SET perm_am = ?, perm_a1 = ?, perm_a2 = ?, perm_a = ?, perm_b1 = ?, perm_b = ?, perm_c1 = ?, perm_c = ?, perm_d1 = ?, perm_d = ?, perm_be = ?, perm_c1e = ?, perm_ce = ?, perm_d1e = ?, perm_de = ?, perm_cotier = ?, perm_fluvial = ?, perm_grandes_eaux = ?, perm_hauturier = ? WHERE token_id_cand = ? `,
        [perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier, token_id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            return res.json({
                message: 'Permis updated successfully'
            });
        }
    );

});

module.exports = CVScreen;
