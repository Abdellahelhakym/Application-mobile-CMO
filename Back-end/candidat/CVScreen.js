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



CVScreen.get('/Secteur', (req, res) => {
  

    console.log('Received CV Secteur request with ');

   
    db.query(
        `SELECT * FROM categorie_metier WHERE deleted = 0`,
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            const secteurs = results.map(item => ({
                id_categorie: item.id,
                titre: item.titre
            }));

            db.query(
                `SELECT * FROM sous_categorie_metier WHERE deleted = 0`,
                (err, sousResults) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    const sousCategories = sousResults.map(item => ({
                        id_sous: item.id,
                        id_categorie: item.id_categorie,
                        titre: item.titre
                    }));

                    db.query(
                        `SELECT * FROM metier WHERE deleted = 0`,
                        (err, metierResults) => {

                            if (err) {
                                console.error(err);
                                return res.status(500).json({
                                    error: 'Internal server error'
                                });
                            }

                            const metiers = metierResults.map(item => ({
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


CVScreen.post('/Secteur', (req, res) => {

    const { token_id } = req.body;

    if(!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
         });
    }

    db.query(
        ` SELECT * from secteurs_candidats WHERE token_id_cand = ? AND deleted = 0`,
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            res.json(results);

        });
        

});

CVScreen.post('/experiences', (req, res) => {
    const { token_id } = req.body;
    console.log('Received CV experiences request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `SELECT id, date1, date2, titre, societe, ville_pays , pays , description  FROM experiences WHERE token_id = ? AND deleted = 0`,
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            res.json(results);
        }
    );

});


CVScreen.post('/formation', (req, res) => {

     const { token_id } = req.body;
    console.log('Received CV experiences request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }
  
    db.query(
        ` SELECT id , ecole , diplome ,mois_debut , annee_debut , mois_obtention , annee_obtention ,description FROM expenreicenformations_scolaire WHERE token_id = ? AND deleted = 0`, 
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            res.json(results);
        }
    );

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

CVScreen.post('/updateLangues', (req, res) => {
  
    const { token_id, lang_fr , lang_en ,  lang_es , lang_de , lang_it , lang_ch , lang_po , lang_da , lang_ru , lang_ar , lang_ne , lang_por , lang_no , lang_fi } = req.body;
    console.log('Received CV updateLangues request with token_id');
    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }


    db.query(
        `UPDATE langues SET lang_fr = ?, lang_en = ?, lang_es = ?, lang_de = ?, lang_it = ?, lang_ch = ?, lang_po = ?, lang_da = ?, lang_ru = ?, lang_ar = ?, lang_ne = ?, lang_por = ?, lang_no = ?, lang_fi = ? WHERE token_id_cand = ?`,
        [lang_fr, lang_en, lang_es, lang_de, lang_it, lang_ch, lang_po, lang_da, lang_ru, lang_ar, lang_ne, lang_por, lang_no, lang_fi, token_id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            return res.json({
                message: 'Langues updated successfully'
            });
        }
    );

});

CVScreen.post('/updateSecteur', (req, res) => {

    /*
    secteur = [
        {
            secteur_numero: 1,
            id_metier: 5
        },
        {
            secteur_numero: 2,
            id_metier: 10
        },
        {
            secteur_numero: 3,
            id_metier: null
        }
    ]
    */

    const { token_id, secteur } = req.body;

    console.log('Received CV updateSecteur request');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    if (!Array.isArray(secteur)) {
        return res.status(400).json({
            error: 'secteur must be an array'
        });
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
                    console.error(err);

                    return res.status(500).json({
                        error: 'Internal server error'
                    });
                }

                /*
                    CASE 1:
                    LINE DOES NOT EXIST
                */
                if (result.length === 0) {

                    /*
                        IF id_metier IS NULL
                        NO NEED TO CREATE
                    */
                    if (id_metier === null) {

                        completed++;

                        if (completed === secteur.length) {
                            return res.json({
                                message: 'Secteurs updated successfully'
                            });
                        }

                        return;
                    }

                    /*
                        CREATE NEW ROW
                    */
                    db.query(
                        `INSERT INTO secteurs_candidats
                        (token_id_cand, secteur_numero, id_metier, deleted)
                        VALUES (?, ?, ?, 0)`,

                        [token_id, secteur_numero, id_metier],

                        (err) => {

                            if (err) {
                                console.error(err);

                                return res.status(500).json({
                                    error: 'Internal server error'
                                });
                            }

                            completed++;

                            if (completed === secteur.length) {
                                return res.json({
                                    message: 'Secteurs updated successfully'
                                });
                            }
                        }
                    );

                    return;
                }

                /*
                    CASE 2:
                    id_metier = null
                    => deleted = 1
                */
                if (id_metier === null) {

                    db.query(
                        `UPDATE secteurs_candidats
                         SET deleted = 1
                         WHERE token_id_cand = ?
                         AND secteur_numero = ?`,

                        [token_id, secteur_numero],

                        (err) => {

                            if (err) {
                                console.error(err);

                                return res.status(500).json({
                                    error: 'Internal server error'
                                });
                            }

                            completed++;

                            if (completed === secteur.length) {
                                return res.json({
                                    message: 'Secteurs updated successfully'
                                });
                            }
                        }
                    );

                    return;
                }

                /*
                    CASE 3:
                    UPDATE EXISTING ROW
                    + deleted = 0
                */
                db.query(
                    `UPDATE secteurs_candidats
                     SET id_metier = ?,
                         deleted = 0
                     WHERE token_id_cand = ?
                     AND secteur_numero = ?`,

                    [id_metier, token_id, secteur_numero],

                    (err) => {

                        if (err) {
                            console.error(err);

                            return res.status(500).json({
                                error: 'Internal server error'
                            });
                        }

                        completed++;

                        if (completed === secteur.length) {
                            return res.json({
                                message: 'Secteurs updated successfully'
                            });
                        }
                    }
                );
            }
        );
    });
});

CVScreen.post('/deleteExperiences', (req, res) => {

    const { token_id, id_experiences } = req.body;
    console.log('Received CV deleteExperiences request with token_id and id_experiences');
    

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    

    db.query(
        `UPDATE experiences 
         SET deleted = 1 
         WHERE token_id = ? 
         AND id = ? `,

        [token_id, id_experiences],

        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            return res.json({
                message: 'Experiences deleted successfully',
                affectedRows: result.affectedRows
            });
        }
    );
});

CVScreen.post('/updateExperiences', (req, res) => {
    const { token_id,id , date1, date2, titre, societe, ville_pays, pays, description } = req.body;
    console.log('Received CV updateExperiences request with token_id');
 

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `UPDATE experiences SET date1 = ?, date2 = ?, titre = ?, societe = ?, ville_pays = ?, pays = ?, description = ?
         WHERE token_id = ? AND id = ? AND deleted = 0`,
        [date1, date2, titre, societe, ville_pays, pays, description, token_id, id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            return res.json({
                message: 'Experience updated successfully'
            });
        }
    );
});

CVScreen.post('/addExperience', (req, res) => {
    const { token_id, date1, date2, titre, societe, ville_pays, pays, description } = req.body;
    console.log('Received CV addExperience request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `INSERT INTO experiences (token_id, date1, date2, titre, societe, ville_pays, pays, description, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [token_id, date1, date2, titre, societe, ville_pays, pays, description],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            return res.json({
                message: 'Experience added successfully'
            });
        }
    );
});

//----------------------formation

CVScreen.post('/deleteFormation', (req, res) => {

    const { token_id, id_formation } = req.body;
    console.log('Received CV deleteFormation request with token_id and id_formation');
    

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

    

    db.query(
        `UPDATE expenreicenformations_scolaire 
         SET deleted = 1 
         WHERE token_id = ? 
         AND id = ? `,

        [token_id, id_formation],

        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            return res.json({
                message: 'Formations deleted successfully',
                affectedRows: result.affectedRows
            });
        }
    );
});

CVScreen.post('/updateFormation', (req, res) => {
    const { token_id,id , ecole , diplome ,mois_debut , annee_debut , mois_obtention , annee_obtention ,description } = req.body;
    console.log('Received CV updateFormation request with token_id');
 

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `UPDATE expenreicenformations_scolaire SET ecole = ?, diplome = ?, mois_debut = ?, annee_debut = ?, mois_obtention = ?, annee_obtention = ?, description = ?
         WHERE token_id = ? AND id = ? AND deleted = 0`,
        [ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description, token_id, id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            return res.json({
                message: 'Formation updated successfully'
            });
        }
    );
});

CVScreen.post('/addFormation', (req, res) => {
    const { token_id, ecole , diplome ,mois_debut , annee_debut , mois_obtention , annee_obtention ,description} = req.body;
    console.log('Received CV addFormation request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        `INSERT INTO expenreicenformations_scolaire (token_id, ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [token_id, ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            return res.json({
                message: 'Formation added successfully'
            });
        }
    );
});





module.exports = CVScreen;
