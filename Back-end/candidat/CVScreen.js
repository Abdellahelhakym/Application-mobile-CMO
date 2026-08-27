const express = require('express');
const db = require('../db');
const fs = require('fs');

const auth = require('../middleware/auth');
const { decodeObject, encodeObject, encodeForLegacyWeb } = require('../middleware/encoding');
const CVScreen = express.Router();

CVScreen.get('/', auth, (req, res) => {
    res.send('CV Screen route');
});

//---------------------------------AFFICHAGE---------------------------------

CVScreen.post('/Informations', auth, (req, res) => {
    const token_id = req.user.token_id;

    console.log('Received CV Informations request with token_id:', token_id);

    db.query(
        'SELECT photo, civilite, prenom, nom, email, tel, tel2, adresse, code_postal, ville, pays, num_secur_social FROM cmo_candidats WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {
            if (err) {
                console.error('Erreur SELECT Informations :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const fixedResults = results.map(item => decodeObject(item));
            return res.json(fixedResults);
        }
    );
});

CVScreen.post('/ToutMobilite', (req, res) => {
    console.log('Received CV ToutMobilite request');
   
    db.query(
        'SELECT * FROM regions WHERE deleted = 0', 
        (err, results) => {
            if (err) {
                console.error('Erreur SELECT ToutMobilite :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const fixedResults = results.map(item => decodeObject(item));
            return res.json(fixedResults);
        }
    );
});

CVScreen.post('/Mobilite', auth, (req, res) => {
    const token_id = req.user.token_id;

    console.log('Received CV Mobilite request with token_id:', token_id);

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
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
                console.error('Erreur SELECT Mobilite regions :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const mobilite = results.map(item => decodeObject({
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
                        console.error('Erreur SELECT Mobilite cmo_candidats :', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    const rawExperienceData = experienceResults[0] || {};
                    const experienceData = decodeObject(rawExperienceData);

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

CVScreen.post('/Permis', auth, (req, res) => {
    const token_id = req.user.token_id;

    console.log('Received CV Permis request with token_id:', token_id);

    db.query('SELECT * FROM permis WHERE token_id_cand = ?', [token_id], (err, results) => {
        if (err) {
            console.error('Erreur SELECT Permis :', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const fixedResults = results.map(item => decodeObject(item));
        return res.json(fixedResults);
    });
});

CVScreen.post('/Langues', auth, (req, res) => {
    const token_id = req.user.token_id;

    console.log('Received CV Langues request with token_id:', token_id);

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    db.query('SELECT * FROM langues WHERE token_id_cand = ?', [token_id], (err, results) => {
        if (err) {
            console.error('Erreur SELECT Langues :', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const fixedResults = results.map(item => decodeObject(item));
        return res.json(fixedResults);
    });
});

CVScreen.get('/Secteur', (req, res) => {
    console.log('Received CV Secteur request');

    db.query(
        'SELECT * FROM categorie_metier WHERE deleted = 0',
        (err, results) => {
            if (err) {
                console.error('Erreur SELECT categorie_metier :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const secteurs = results.map(item => decodeObject({
                id_categorie: item.id,
                titre: item.titre
            }));

            db.query(
                'SELECT * FROM sous_categorie_metier WHERE deleted = 0',
                (err, sousResults) => {
                    if (err) {
                        console.error('Erreur SELECT sous_categorie_metier :', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    const sousCategories = sousResults.map(item => decodeObject({
                        id_sous: item.id,
                        id_categorie: item.id_categorie,
                        titre: item.titre
                    }));

                    db.query(
                        'SELECT * FROM metier WHERE deleted = 0',
                        (err, metierResults) => {
                            if (err) {
                                console.error('Erreur SELECT metier :', err);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            const metiers = metierResults.map(item => decodeObject({
                                id_metier: item.id,
                                id_sous: item.id_sous,
                                titre: item.titre
                            }));

                            return res.json({
                                secteurs,
                                sousCategories,
                                metiers
                            });
                        }
                    );
                }
            );
        }
    );
});

CVScreen.post('/Secteur', auth, (req, res) => {
    const token_id = req.user.token_id;

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    db.query(
        'SELECT * FROM secteurs_candidats WHERE token_id_cand = ? AND deleted = 0',
        [token_id],
        (err, results) => {
            if (err) {
                console.error('Erreur SELECT secteurs_candidats :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const fixedResults = results.map(item => decodeObject(item));
            res.json(fixedResults);
        }
    );
});

CVScreen.post('/experiences', auth, (req, res) => {
    const token_id = req.user.token_id;

    console.log('Received CV experiences request with token_id:', token_id);

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    db.query(
        `SELECT 
            id,
            DATE_FORMAT(date1, '%Y-%m-%d') AS date1,
            DATE_FORMAT(date2, '%Y-%m-%d') AS date2,
            titre,
            societe,
            ville_pays,
            pays,
            description
        FROM experiences
        WHERE token_id = ? 
          AND deleted = 0`,
        [token_id],
        (err, results) => {
            if (err) {
                console.error('Erreur SELECT experiences :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const fixedResults = results.map(item => decodeObject(item));

            res.json(fixedResults);
        }
    );
});


CVScreen.post('/formation', auth, (req, res) => {
    const token_id = req.user.token_id;

    console.log('Received CV formation request with token_id:', token_id);

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    db.query(
        'SELECT id, ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description FROM expenreicenformations_scolaire WHERE token_id = ? AND deleted = 0', 
        [token_id],
        (err, results) => {
            if (err) {
                console.error('Erreur SELECT expenreicenformations_scolaire :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const fixedResults = results.map(item => decodeObject(item));
            res.json(fixedResults);
        }
    );
});

//---------------------------------MODIFICATION & AJOUT---------------------------------

CVScreen.post('/updateInformations', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { civilite, prenom, nom, email, tel, tel2, adresse, code_postal, ville, pays, num_secur_social } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV updateInformations request with token_id:', token_id);

    const updateSql = `
        UPDATE cmo_candidats
        SET civilite = ?, prenom = ?, nom = ?, email = ?, tel = ?, tel2 = ?, adresse = ?, code_postal = ?, ville = ?, pays = ?, num_secur_social = ?
        WHERE token_id = ?
        AND deleted = 0
    `;

    const insertSql = `
        INSERT INTO cmo_candidats
        (token_id, civilite, prenom, nom, email, tel, tel2, adresse, code_postal, ville, pays, num_secur_social, deleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    db.query(updateSql, [civilite, prenom, nom, email, tel, tel2, adresse, code_postal, ville, pays, num_secur_social, token_id], (err, results) => {
        if (err) {
            console.error('Erreur UPDATE cmo_candidats :', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const finish = () => {
            const pseudoMobile = `${req.body.prenom || ''} ${req.body.nom || ''}`.trim();
            const pseudoDb = encodeForLegacyWeb(pseudoMobile);

            db.query('UPDATE users SET pseudo = ? WHERE token_id = ?', [pseudoDb, token_id], (updateUserErr) => {
                if (updateUserErr) {
                    console.error('Erreur UPDATE users pseudo :', updateUserErr);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                return res.json({ success: true, message: 'Informations updated successfully' });
            });
        };

        if (results.affectedRows > 0) {
            return finish();
        }

        db.query(
            insertSql,
            [token_id, civilite, prenom, nom, email, tel, tel2, adresse, code_postal, ville, pays, num_secur_social],
            (insertErr) => {
                if (insertErr) {
                    console.error('Erreur INSERT cmo_candidats :', insertErr);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                return finish();
            }
        );
    });
});

CVScreen.post('/updateMobilite', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { mobilite, niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV updateMobilite request with token_id:', token_id);

    const updateMobiliteSql = `
        UPDATE mobilite_candidats SET id_region = ?
        WHERE token_id_cand = ?
        AND deleted = 0
    `;

    const insertMobiliteSql = `
        INSERT INTO mobilite_candidats (token_id_cand, id_region, deleted)
        VALUES (?, ?, 0)
    `;

    const updateCmoSql = `
        UPDATE cmo_candidats
        SET niveau_etude = ?, experience = ?, contrat_prefere1 = ?, contrat_prefere2 = ?, disponibilite = ?, date_disponibilite = ?
        WHERE token_id = ?
        AND deleted = 0
    `;

    const insertCmoSql = `
        INSERT INTO cmo_candidats
        (token_id, niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite, deleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `;

    db.query(updateMobiliteSql, [mobilite, token_id], (err, mobiliteResult) => {
        if (err) {
            console.error('Erreur UPDATE mobilite_candidats :', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const upsertCmo = () => {
            db.query(
                updateCmoSql,
                [niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite, token_id],
                (cmoErr, cmoResult) => {
                    if (cmoErr) {
                        console.error('Erreur UPDATE cmo_candidats (mobilité) :', cmoErr);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    if (cmoResult.affectedRows > 0) {
                        return res.json({ message: 'Mobilite and experience updated successfully' });
                    }

                    db.query(
                        insertCmoSql,
                        [token_id, niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite],
                        (insertCmoErr) => {
                            if (insertCmoErr) {
                                console.error('Erreur INSERT cmo_candidats (mobilité) :', insertCmoErr);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            return res.json({ message: 'Mobilite and experience updated successfully' });
                        }
                    );
                }
            );
        };

        if (mobiliteResult.affectedRows > 0) {
            return upsertCmo();
        }

        db.query(insertMobiliteSql, [token_id, mobilite], (insertErr) => {
            if (insertErr) {
                console.error('Erreur INSERT mobilite_candidats :', insertErr);
                return res.status(500).json({ error: 'Internal server error' });
            }

            return upsertCmo();
        });
    });
});

CVScreen.post('/updatePermis', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV updatePermis request with token_id:', token_id);

    const updateSql = `
        UPDATE permis SET perm_am = ?, perm_a1 = ?, perm_a2 = ?, perm_a = ?, perm_b1 = ?, perm_b = ?, perm_c1 = ?, perm_c = ?, perm_d1 = ?, perm_d = ?, perm_be = ?, perm_c1e = ?, perm_ce = ?, perm_d1e = ?, perm_de = ?, perm_cotier = ?, perm_fluvial = ?, perm_grandes_eaux = ?, perm_hauturier = ?
        WHERE token_id_cand = ?
    `;

    const insertSql = `
        INSERT INTO permis (
            token_id_cand, perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        updateSql,
        [perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier, token_id],
        (err, result) => {
            if (err) {
                console.error('Erreur UPDATE permis :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows > 0) {
                return res.json({ message: 'Permis updated successfully' });
            }

            db.query(
                insertSql,
                [token_id, perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier],
                (insertErr) => {
                    if (insertErr) {
                        console.error('Erreur INSERT permis :', insertErr);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    return res.json({ message: 'Permis updated successfully' });
                }
            );
        }
    );
});

CVScreen.post('/updateLangues', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { lang_fr, lang_en, lang_es, lang_de, lang_it, lang_ch, lang_po, lang_da, lang_ru, lang_ar, lang_ne, lang_por, lang_no, lang_fi } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV updateLangues request with token_id:', token_id);

    const updateSql = `
        UPDATE langues SET lang_fr = ?, lang_en = ?, lang_es = ?, lang_de = ?, lang_it = ?, lang_ch = ?, lang_po = ?, lang_da = ?, lang_ru = ?, lang_ar = ?, lang_ne = ?, lang_por = ?, lang_no = ?, lang_fi = ?
        WHERE token_id_cand = ?
        AND deleted = 0
    `;

    const insertSql = `
        INSERT INTO langues (
            token_id_cand, lang_fr, lang_en, lang_es, lang_de, lang_it, lang_ch, lang_po, lang_da, lang_ru, lang_ar, lang_ne, lang_por, lang_no, lang_fi, deleted
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    db.query(
        updateSql,
        [lang_fr, lang_en, lang_es, lang_de, lang_it, lang_ch, lang_po, lang_da, lang_ru, lang_ar, lang_ne, lang_por, lang_no, lang_fi, token_id],
        (err, result) => {
            if (err) {
                console.error('Erreur UPDATE langues :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows > 0) {
                return res.json({ message: 'Langues updated successfully' });
            }

            db.query(
                insertSql,
                [token_id, lang_fr, lang_en, lang_es, lang_de, lang_it, lang_ch, lang_po, lang_da, lang_ru, lang_ar, lang_ne, lang_por, lang_no, lang_fi],
                (insertErr) => {
                    if (insertErr) {
                        console.error('Erreur INSERT langues :', insertErr);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    return res.json({ message: 'Langues updated successfully' });
                }
            );
        }
    );
});

CVScreen.post('/updateSecteur', auth, (req, res) => {
    const { secteur } = req.body;
    const token_id = req.user.token_id;

    console.log('Received CV updateSecteur request');

    if (!Array.isArray(secteur)) {
        return res.status(400).json({ error: 'secteur must be an array' });
    }

    let completed = 0;

    secteur.forEach((item) => {
        const { secteur_numero, id_metier } = item;

        db.query(
            `SELECT * 
             FROM secteurs_candidats
             WHERE token_id_cand = ?
             AND secteur_numero = ?`,
            [token_id, secteur_numero],
            (err, result) => {
                if (err) {
                    console.error('Erreur SELECT secteurs_candidats :', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (result.length === 0) {
                    if (id_metier === null) {
                        completed++;
                        if (completed === secteur.length) {
                            return res.json({ message: 'Secteurs updated successfully' });
                        }
                        return;
                    }

                    db.query(
                        `INSERT INTO secteurs_candidats
                        (token_id_cand, secteur_numero, id_metier, deleted)
                        VALUES (?, ?, ?, 0)`,
                        [token_id, secteur_numero, id_metier],
                        (err) => {
                            if (err) {
                                console.error('Erreur INSERT secteurs_candidats :', err);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            completed++;
                            if (completed === secteur.length) {
                                return res.json({ message: 'Secteurs updated successfully' });
                            }
                        }
                    );
                    return;
                }

                if (id_metier === null) {
                    db.query(
                        `UPDATE secteurs_candidats
                         SET deleted = 1
                         WHERE token_id_cand = ?
                         AND secteur_numero = ?`,
                        [token_id, secteur_numero],
                        (err) => {
                            if (err) {
                                console.error('Erreur UPDATE secteurs_candidats (deleted=1) :', err);
                                return res.status(500).json({ error: 'Internal server error' });
                            }

                            completed++;
                            if (completed === secteur.length) {
                                return res.json({ message: 'Secteurs updated successfully' });
                            }
                        }
                    );
                    return;
                }

                db.query(
                    `UPDATE secteurs_candidats
                     SET id_metier = ?,
                         deleted = 0
                     WHERE token_id_cand = ?
                     AND secteur_numero = ?`,
                    [id_metier, token_id, secteur_numero],
                    (err) => {
                        if (err) {
                            console.error('Erreur UPDATE secteurs_candidats :', err);
                            return res.status(500).json({ error: 'Internal server error' });
                        }

                        completed++;
                        if (completed === secteur.length) {
                            return res.json({ message: 'Secteurs updated successfully' });
                        }
                    }
                );
            }
        );
    });
});

CVScreen.post('/deleteExperiences', auth, (req, res) => {
    const { id_experiences } = req.body;
    const token_id = req.user.token_id;

    console.log('Received CV deleteExperiences request with token_id and id_experiences');

    db.query(
        `UPDATE experiences 
         SET deleted = 1 
         WHERE token_id = ? 
         AND id = ?`,
        [token_id, id_experiences],
        (err, result) => {
            if (err) {
                console.error('Erreur UPDATE experiences (delete) :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            return res.json({
                message: 'Experiences deleted successfully',
                affectedRows: result.affectedRows
            });
        }
    );
});

CVScreen.post('/updateExperiences', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { id, date1, date2, titre, societe, ville_pays, pays, description } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV updateExperiences request with token_id:', token_id);

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    db.query(
        `UPDATE experiences SET date1 = ?, date2 = ?, titre = ?, societe = ?, ville_pays = ?, pays = ?, description = ?
         WHERE token_id = ? AND id = ? AND deleted = 0`,
        [date1, date2, titre, societe, ville_pays, pays, description, token_id, id],
        (err) => {
            if (err) {
                console.error('Erreur UPDATE experiences :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json({ message: 'Experience updated successfully' });
        }
    );
});

CVScreen.post('/addExperience', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { date1, date2, titre, societe, ville_pays, pays, description } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV addExperience request with token_id:', token_id);

    db.query(
        `INSERT INTO experiences (token_id, date1, date2, titre, societe, ville_pays, pays, description, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [token_id, date1, date2, titre, societe, ville_pays, pays, description],
        (err) => {
            if (err) {
                console.error('Erreur INSERT experiences :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json({ message: 'Experience added successfully' });
        }
    );
});

//----------------------FORMATION----------------------

CVScreen.post('/deleteFormation', auth, (req, res) => {
    const { id_formation } = req.body;
    const token_id = req.user.token_id;

    console.log('Received CV deleteFormation request with token_id and id_formation');

    db.query(
        `UPDATE expenreicenformations_scolaire 
         SET deleted = 1 
         WHERE token_id = ? 
         AND id = ?`,
        [token_id, id_formation],
        (err, result) => {
            if (err) {
                console.error('Erreur UPDATE expenreicenformations_scolaire (delete) :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            return res.json({
                message: 'Formations deleted successfully',
                affectedRows: result.affectedRows
            });
        }
    );
});

CVScreen.post('/updateFormation', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { id, ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV updateFormation request with token_id:', token_id);

    db.query(
        `UPDATE expenreicenformations_scolaire SET ecole = ?, diplome = ?, mois_debut = ?, annee_debut = ?, mois_obtention = ?, annee_obtention = ?, description = ?
         WHERE token_id = ? AND id = ? AND deleted = 0`,
        [ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description, token_id, id],
        (err) => {
            if (err) {
                console.error('Erreur UPDATE expenreicenformations_scolaire :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json({ message: 'Formation updated successfully' });
        }
    );
});

CVScreen.post('/addFormation', auth, (req, res) => {
    const encodedBody = encodeObject(req.body);
    const { ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description } = encodedBody;
    const token_id = req.user.token_id;

    console.log('Received CV addFormation request with token_id:', token_id);

    db.query(
        `INSERT INTO expenreicenformations_scolaire (token_id, ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [token_id, ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description],
        (err) => {
            if (err) {
                console.error('Erreur INSERT expenreicenformations_scolaire :', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json({ message: 'Formation added successfully' });
        }
    );
});

module.exports = CVScreen;