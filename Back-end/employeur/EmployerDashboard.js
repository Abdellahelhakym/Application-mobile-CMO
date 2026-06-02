const express = require('express');
const db = require('../db');

const EmployerDashboard = express.Router();

EmployerDashboard.get('/', (req, res) => {
    res.send('Employer Dashboard route');
});
EmployerDashboard.post('/pseudo', (req, res) => {
   const { token_id } = req.body;
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



EmployerDashboard.post('/phase1', (req, res) => {

    const { token_id } = req.body;

    console.log('Received employer dashboard phase 1 request with token_id');

    if (!token_id) {
        return res.status(400).json({
            error: 'token_id is required'
        });
    }

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

EmployerDashboard.post('/phase2', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }
    
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

                 const baseCondition = `
                        c.deleted='0'
                        AND c.etat_affect='1'
                        AND c.id IN (
                            SELECT a.id_candidat
                            FROM affectation a
                            WHERE a.deleted='0'
                            AND a.id_fiche_poste IN (
                                SELECT f.id_fiche_poste
                                FROM fiche_poste f
                                WHERE f.id_societe=?
                            )
                        )
                    `;

                    // PHASE 2 - multiple stats
                    db.query(`
                        SELECT 
                        SUM(CASE WHEN c.statut_commande='15' THEN 1 ELSE 0 END) AS phase2_2,
                        SUM(CASE WHEN c.statut_commande='16' THEN 1 ELSE 0 END) AS phase2_4,
                        SUM(CASE WHEN c.statut_commande='17' THEN 1 ELSE 0 END) AS phase2_5,
                        SUM(CASE WHEN c.statut_commande='70' THEN 1 ELSE 0 END) AS phase2_6,
                        SUM(CASE WHEN c.statut_candidat='3' THEN 1 ELSE 0 END) AS phase2_3
                        FROM cmo_candidats c
                        WHERE ${baseCondition}
                        AND (
                            c.statut_commande IN ('15','16','17','70')
                            OR c.statut_candidat='3'
                        )
                    `, [idEmployer], (err, result) => {

                        if (err) return res.status(500).json({ error: 'Database error' });

                        const data = result[0];

                        // PHASE 2 - count global (statut_aff in 1,2,3,4)
                        db.query(`
                            SELECT COUNT(*) AS nbr
                            FROM cmo_candidats c
                            WHERE ${baseCondition}
                            AND c.id IN (
                                SELECT a.id_candidat
                                FROM affectation a
                                WHERE a.statut_aff IN ('1','2','3','4')
                            )
                        `, [idEmployer], (err, r1) => {

                            if (err) return res.status(500).json({ error: 'Database error' });

                            const phase2_1 = r1[0].nbr;

                            db.query(`
                                SELECT COUNT(*) AS nbr
                                FROM cmo_candidats c
                                WHERE ${baseCondition}
                                AND c.statut_commande='15'
                                AND c.id IN (
                                    SELECT a.id_candidat
                                    FROM affectation a
                                    WHERE a.statut_aff='3'
                                )
                            `, [idEmployer], (err, r2) => {

                                if (err) return res.status(500).json({ error: 'Database error' });

                                const phase2_2 = r2[0].nbr;

                                db.query(`
                                    SELECT COUNT(*) AS nbr
                                    FROM cmo_candidats c
                                    WHERE ${baseCondition}
                                    AND c.statut_commande='16'
                                `, [idEmployer], (err, r3) => {

                                    if (err) return res.status(500).json({ error: 'Database error' });

                                    const phase2_4 = r3[0].nbr;

                                    db.query(`
                                        SELECT COUNT(*) AS nbr
                                        FROM cmo_candidats c
                                        WHERE ${baseCondition}
                                        AND c.statut_commande='17'
                                    `, [idEmployer], (err, r4) => {

                                        if (err) return res.status(500).json({ error: 'Database error' });

                                        const phase2_5 = r4[0].nbr;

                                        db.query(`
                                            SELECT COUNT(*) AS nbr
                                            FROM cmo_candidats c
                                            WHERE ${baseCondition}
                                            AND c.statut_commande='70'
                                        `, [idEmployer], (err, r5) => {

                                            if (err) return res.status(500).json({ error: 'Database error' });

                                            const phase2_6 = r5[0].nbr;

                                            db.query(`
                                                SELECT COUNT(*) AS nbr
                                                FROM cmo_candidats c
                                                WHERE ${baseCondition}
                                                AND c.statut_candidat='3'
                                            `, [idEmployer], (err, r6) => {

                                                if (err) return res.status(500).json({ error: 'Database error' });

                                                const phase2_3 = r6[0].nbr;

                                                return res.status(200).json({
                                                    success: true,
                                                    phase2_1,
                                                    phase2_2,
                                                    phase2_4,
                                                    phase2_5,
                                                    phase2_6,
                                                    phase2_3
                                                });

                                            });

                                        });

                                    });

                                });

                            });

                        });

                    });

        });

   

});

//---------phase 3
EmployerDashboard.post('/phase3', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

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
EmployerDashboard.post('/phase4', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

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
EmployerDashboard.post('/phase5', (req, res) => {

    const { token_id } = req.body;

    if (!token_id) {
        return res.status(400).json({ error: 'token_id is required' });
    }

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


module.exports = EmployerDashboard;
