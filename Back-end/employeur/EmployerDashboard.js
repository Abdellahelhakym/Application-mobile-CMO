const express = require('express');
const db = require('../db');

const EmployerDashboard = express.Router();
const auth = require('../middleware/auth');

EmployerDashboard.get('/',auth, (req, res) => {
    res.send('Employer Dashboard route V2');
});
EmployerDashboard.post('/pseudo', auth, (req, res) => {
   const token_id = req.user.token_id;
   if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

    db.query(
        'SELECT pseudo FROM users WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }
            if (results.length === 0) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            const pseudo = results[0].pseudo;
            return res.json({ pseudo });
        }
    );
});



EmployerDashboard.post('/phase1', auth, (req, res) => {

    const token_id = req.user.token_id;

    console.log('Received employer dashboard phase 1 request with token_id');

   

    db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;
            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

                 db.query(
                    "SELECT COUNT(*) as nbr FROM fiche_poste WHERE deleted='0' AND id_societe=? AND statut_fiche='1'",
                    [idEmployer],
                    (err, results1) => {

                        if (err) {
                            return res.status(500).json({
                                error: 'Database error'
                            });
                        }

                        const nouvelle_commande = results1[0].nbr;

                        db.query(
                            "SELECT SUM(nbr_poste) as nbr FROM fiche_poste WHERE deleted='0' AND id_societe=? AND statut_fiche='3'",
                            [idEmployer],
                            (err, results2) => {

                                if (err) {
                                    return res.status(500).json({
                                        error: 'Database error'
                                    });
                                }

                                const nombre_poste = results2[0].nbr || 0;

                                db.query(
                                    "SELECT COUNT(*) as nbr FROM fiche_poste WHERE deleted='0' AND id_societe=? AND statut_fiche='6'",
                                    [idEmployer],
                                    (err, results3) => {

                                        if (err) {
                                            return res.status(500).json({
                                                error: 'Database error'
                                            });
                                        }

                                        const En_cours = results3[0].nbr;

                                        db.query(
                                            "SELECT COUNT(*) as nbr FROM fiche_poste WHERE deleted='0' AND id_societe=? AND statut_fiche='3'",
                                            [idEmployer],
                                            (err, results4) => {

                                                if (err) {
                                                    return res.status(500).json({
                                                        error: 'Database error'
                                                    });
                                                }

                                                const commande_validée = results4[0].nbr;

                                                db.query(
                                                    "SELECT COUNT(*) as nbr FROM fiche_poste WHERE deleted='0' AND id_societe=? AND statut_fiche='4'",
                                                    [idEmployer],
                                                    (err, results5) => {

                                                        if (err) {
                                                            return res.status(500).json({
                                                                error: 'Database error'
                                                            });
                                                        }

                                                        const commandes_refusées = results5[0].nbr;

                                                        db.query(
                                                            "SELECT COUNT(*) as nbr FROM fiche_poste WHERE deleted='0' AND id_societe=? AND statut_fiche='2'",
                                                            [idEmployer],
                                                            (err, results6) => {

                                                                if (err) {
                                                                    return res.status(500).json({
                                                                        error: 'Database error'
                                                                    });
                                                                }

                                                                const commandes_annulées = results6[0].nbr;

                                                                return res.status(200).json({
                                                                    success: true,
                                                                    nouvelle_commande,
                                                                    nombre_poste,
                                                                    En_cours,
                                                                    commande_validée,
                                                                    commandes_refusées,
                                                                    commandes_annulées
                                                                });

                                                            }
                                                        );

                                                    }
                                                );

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );


        });

   
});

//---------phase 2

EmployerDashboard.post('/phase2', auth, (req, res) => {
    const token_id = req.user.token_id;

    // 1. Récupérer l'ID de l'employeur
    db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;
            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            // PHASE 2_1
            db.query(`
                SELECT COUNT(*) AS nbr 
                FROM cmo_candidats 
                WHERE deleted='0' AND etat_affect='1' AND statut_candidat<>'3'  
                  AND id IN (
                      SELECT id_candidat FROM affectation 
                      WHERE deleted='0' AND statut_aff IN ('1','2','3','4') 
                        AND id_fiche_poste IN (SELECT id_fiche_poste FROM fiche_poste WHERE id_societe=?)
                  )
            `, [idEmployer], (err, r1) => {
                if (err) return res.status(500).json({ error: 'Database error p2_1' });
                const phase2_1 = r1[0].nbr;

                // PHASE 2_2
                db.query(`
                    SELECT COUNT(*) AS nbr 
                    FROM cmo_candidats 
                    WHERE deleted='0' AND etat_affect='1' AND statut_commande='15' 
                      AND id IN (
                          SELECT id_candidat FROM affectation 
                          WHERE deleted='0' AND statut_aff='3' 
                            AND id_fiche_poste IN (SELECT id_fiche_poste FROM fiche_poste WHERE id_societe=?)
                      )
                `, [idEmployer], (err, r2) => {
                    if (err) return res.status(500).json({ error: 'Database error p2_2' });
                    const phase2_2 = r2[0].nbr;

                    // PHASE 2_3
                    db.query(`
                        SELECT COUNT(*) AS nbr 
                        FROM cmo_candidats 
                        WHERE deleted='0' AND etat_affect='1' AND statut_commande='16' 
                          AND id IN (
                              SELECT id_candidat FROM affectation 
                              WHERE deleted='0' AND statut_aff='3' 
                                AND id_fiche_poste IN (SELECT id_fiche_poste FROM fiche_poste WHERE id_societe=?)
                          )
                    `, [idEmployer], (err, r3) => {
                        if (err) return res.status(500).json({ error: 'Database error p2_3' });
                        const phase2_3 = r3[0].nbr;

                        // PHASE 2_4
                        db.query(`
                            SELECT COUNT(*) AS nbr 
                            FROM cmo_candidats 
                            WHERE deleted='0' AND etat_affect='1' AND statut_candidat='3' 
                              AND id IN (
                                  SELECT id_candidat FROM affectation 
                                  WHERE deleted='0' AND statut_aff='3' 
                                    AND id_fiche_poste IN (SELECT id_fiche_poste FROM fiche_poste WHERE id_societe=?)
                              )
                        `, [idEmployer], (err, r4) => {
                            if (err) return res.status(500).json({ error: 'Database error p2_4' });
                            const phase2_4 = r4[0].nbr;

                            // PHASE 2_5
                            db.query(`
                                SELECT COUNT(*) AS nbr 
                                FROM cmo_candidats 
                                WHERE deleted='0' AND etat_affect='1' AND statut_commande='17' 
                                  AND id IN (
                                      SELECT id_candidat FROM affectation 
                                      WHERE deleted='0' AND statut_aff='3' 
                                        AND id_fiche_poste IN (SELECT id_fiche_poste FROM fiche_poste WHERE id_societe=?)
                                  )
                            `, [idEmployer], (err, r5) => {
                                if (err) return res.status(500).json({ error: 'Database error p2_5' });
                                const phase2_5 = r5[0].nbr;

                                // PHASE 2_6
                                db.query(`
                                    SELECT COUNT(*) AS nbr 
                                    FROM cmo_candidats 
                                    WHERE deleted='0' AND etat_affect='1' AND statut_commande='70' 
                                      AND id IN (
                                          SELECT id_candidat FROM affectation 
                                          WHERE deleted='0' AND statut_aff='3' 
                                            AND id_fiche_poste IN (SELECT id_fiche_poste FROM fiche_poste WHERE id_societe=?)
                                      )
                                `, [idEmployer], (err, r6) => {
                                    if (err) return res.status(500).json({ error: 'Database error p2_6' });
                                    const phase2_6 = r6[0].nbr;

                                    // Retour final de toutes les données séparées
                                    return res.status(200).json({
                                        success: true,
                                        phase2_1,
                                        phase2_2,
                                        phase2_3,
                                        phase2_4,
                                        phase2_5,
                                        phase2_6
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
    );
});
//---------phase 3
EmployerDashboard.post('/phase3', auth, (req, res) => {

    const token_id = req.user.token_id;

     db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;
            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            
                db.query(`
                    SELECT 
                        SUM(CASE WHEN c.statut_commande='18' THEN 1 ELSE 0 END) AS phase3_1,
                        SUM(CASE WHEN c.statut_commande='19' THEN 1 ELSE 0 END) AS phase3_2,
                        SUM(CASE WHEN c.statut_commande='20' THEN 1 ELSE 0 END) AS phase3_3
                    FROM cmo_candidats c
                    WHERE c.deleted='0'
                    AND c.etat_affect='1'
                    AND c.id IN (
                        SELECT a.id_candidat
                        FROM affectation a
                        WHERE a.deleted='0'
                        AND a.statut_aff='3'
                        AND a.id_fiche_poste IN (
                            SELECT f.id_fiche_poste
                            FROM fiche_poste f
                            WHERE f.id_societe=?
                        )
                    )
                `, [idEmployer], (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: 'Database error',
                            details: err
                        });
                    }

                    const data = result[0];

                    return res.status(200).json({
                        success: true,
                        phase3_1: data.phase3_1 || 0,
                        phase3_2: data.phase3_2 || 0,
                        phase3_3: data.phase3_3 || 0
                    });

                });



        });

   

});

//---------phase 4
EmployerDashboard.post('/phase4', auth, (req, res) => {

    const token_id = req.user.token_id;

     db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;
            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

              

                db.query(`
                    SELECT 
                        SUM(CASE WHEN c.statut_commande='21' THEN 1 ELSE 0 END) AS phase4_1,
                        SUM(CASE WHEN c.statut_commande='22' THEN 1 ELSE 0 END) AS phase4_2,
                        SUM(CASE WHEN c.statut_commande='23' THEN 1 ELSE 0 END) AS phase4_3,
                        SUM(CASE WHEN c.statut_commande='24' THEN 1 ELSE 0 END) AS phase4_4
                    FROM cmo_candidats c
                    WHERE c.deleted='0'
                    AND c.etat_affect='1'
                    AND c.id IN (
                        SELECT a.id_candidat
                        FROM affectation a
                        WHERE a.deleted='0'
                        AND a.statut_aff='3'
                        AND a.id_fiche_poste IN (
                            SELECT f.id_fiche_poste
                            FROM fiche_poste f
                            WHERE f.id_societe=?
                        )
                    )
                `, [idEmployer], (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: 'Database error',
                            details: err
                        });
                    }

                    const data = result[0];

                    return res.status(200).json({
                        success: true,
                        phase4_1: data.phase4_1 || 0,
                        phase4_2: data.phase4_2 || 0,
                        phase4_3: data.phase4_3 || 0,
                        phase4_4: data.phase4_4 || 0
                    });

                });


        } );

      
});

//---------phase 5
EmployerDashboard.post('/phase5', auth, (req, res) => {

    const token_id = req.user.token_id;

     db.query(
        'SELECT id FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, enterpriseResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const idEmployer = enterpriseResults[0]?.id;
            if (!idEmployer) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            
                db.query(`
                    SELECT 
                        SUM(CASE WHEN c.statut_commande='25' THEN 1 ELSE 0 END) AS phase5_1,
                        SUM(CASE WHEN c.statut_commande='26' THEN 1 ELSE 0 END) AS phase5_2,
                        SUM(CASE WHEN c.statut_commande='27' THEN 1 ELSE 0 END) AS phase5_3
                    FROM cmo_candidats c
                    WHERE c.deleted='0'
                    AND c.etat_affect='1'
                    AND c.id IN (
                        SELECT a.id_candidat
                        FROM affectation a
                        WHERE a.deleted='0'
                        AND a.statut_aff='3'
                        AND a.id_fiche_poste IN (
                            SELECT f.id_fiche_poste
                            FROM fiche_poste f
                            WHERE f.id_societe=?
                        )
                    )
                `, [idEmployer], (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: 'Database error',
                            details: err
                        });
                    }

                    const data = result[0];

                    return res.status(200).json({
                        success: true,
                        phase5_1: data.phase5_1 || 0,
                        phase5_2: data.phase5_2 || 0,
                        phase5_3: data.phase5_3 || 0
                    });

                });


        });

});


EmployerDashboard.post('/pack', auth, (req, res) => {

    const token_id = req.user.token_id;
 
    db.query(
        'SELECT id_formule FROM mco_entreprise WHERE token_id = ? AND deleted = 0',
        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            const idFormule = results[0].id_formule;
            return res.status(200).json({ id_formule: idFormule });
        }
    );


});


EmployerDashboard.post('/telAgent', auth, (req, res) => {
    const token_id = req.user.token_id;
    db.query(
        `SELECT userss.*
            FROM mco_entreprise
            INNER JOIN userss
                ON mco_entreprise.id_commercial = userss.token_id
            WHERE mco_entreprise.token_id = ?
            AND mco_entreprise.deleted = 0;
            `,

        [token_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (results.length === 0) {
                return res.status(200).json(null);
            }

            return res.status(200).json(results[0]);
        }
    );
});

module.exports = EmployerDashboard;
