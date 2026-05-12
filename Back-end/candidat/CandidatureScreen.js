const express = require('express');
const db = require('../db');
const CandidatureScreen = express.Router();

CandidatureScreen.get('/', (req, res) => {
    res.send('Candidature    Screen route');
});

CandidatureScreen.post('/', (req, res) => {
    try{
        const { token_id } = req.body;
        console.log('Received candidature request with token_id');

        if (!token_id) {
            return res.status(400).json({
                error: 'token_id is required'
            });
        }

        const candidatureData = [
            {
                  id: 1,
                title: 'Ouvrier viticole (H/F)',
                reference: '#18293758',
                type: 'CDD',
                duration: '4 à 6 mois',
                region: 'Bourgogne-Franche-Comté',
                category: 'Viticulture',
                description:
                "Nous recrutons un ouvrier viticole en CDD afin de realiser les travaux saisonniers de la vigne.",
                applied: true
            },
             {
                  id: 2,
                title: 'test',
                reference: '#18293758',
                type: 'CDI',
                duration: '3 à 8 mois',
                region: 'Franche',
                category: 'Viticulture',
                description:
                "Nous recrutons un ouvrier viticole en CDD afin de realiser les travaux saisonniers de la vigne.",
                applied: true
            },
             {
                  id: 3,
                title: 'test',
                reference: '#18293758',
                type: 'CDI',
                duration: '3 à 8 mois',
                region: 'Franche',
                category: 'Viticulture',
                description:
                "Nous recrutons un ouvrier viticole en CDD afin de realiser les travaux saisonniers de la vigne.",
                applied: true
            }
        ];

        return res.json(candidatureData);

    }catch(err){
        console.error(err);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }

});


module.exports = CandidatureScreen;




