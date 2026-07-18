const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // Importer la connexion à la base de données
const path = require("path");
require('dotenv').config();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

// routes
//login route
const loginRoute = require('./login');
app.use('/login', loginRoute);


//delete account route
const deleteAccountRoute = require('./deleteAccount');
app.use('/delete-account', deleteAccountRoute);


//change password route
const changePasswordRoute = require('./changePassword');
app.use('/change-password', changePasswordRoute);


//--------------------candidat route----------------------------
// Route d'accueil (pour l'URL .../cmo_app/)
app.get('/', (req, res) => {
  res.send('Hello World!');
});


//dashboard route
const dashboard = require('./candidat/DashboardScreen');
app.use('/candidat/dashboard', dashboard);

//candidature route
const candidature = require('./candidat/CandidatureScreen');
app.use('/candidat/candidature', candidature);

//cv route
const cv = require('./candidat/CVScreen');
app.use('/candidat/cv', cv);


//profile route
const profile = require('./candidat/ProfileScreen');
app.use('/candidat/profile', profile);

//favorites route
const favorites = require('./candidat/FavoritesScreen');
app.use('/candidat/favorites', favorites);

//attestations route
const attestations = require('./candidat/AttestationsScreen');
app.use('/candidat/attestations', attestations);

//----documents---
const documentsCan = require('./candidat/documents');
app.use('/candidat/documents', documentsCan);

const MessagerieCan = require('./candidat/Messagerie');
app.use('/candidat/messagerie', MessagerieCan);



app.use(
  '/documents/photos_candidats',
  express.static(
    path.resolve(
      __dirname,
      '../../crm_cmo/documents/photos_candidats'
    )
  )
);
app.use(
  '/documents/attestations',
  express.static(
    path.resolve(
      __dirname,
      '../../crm_cmo/documents/attestations'
    )
  )
);
//---------------------employeur route----------------------------

const employerDashboard = require('./employeur/EmployerDashboard');
app.use('/employeur/dashboard', employerDashboard);

const myOffers = require('./employeur/MyOffers');
app.use('/employeur/my-offers', myOffers);

const createOffer = require('./employeur/CreateOffer');
app.use('/employeur/create-offer', createOffer);

const CVDatabase = require('./employeur/CVDatabase');
app.use('/employeur/cv-database', CVDatabase);

const EmployerInfo = require('./employeur/EmployerInfo');
app.use('/employeur/profile', EmployerInfo);

//--new--

const EmployerCandidatures = require('./employeur/EmployeurCandidatures');
app.use('/employeur/candidatures', EmployerCandidatures);

const subscription = require('./employeur/Subscription');
app.use('/employeur/subscription', subscription);

//----documents---
const documents = require('./employeur/documents');
app.use('/employeur/documents', documents);

const MessagerieEmp = require('./employeur/Messagerie');
app.use('/employeur/messagerie', MessagerieEmp);

app.use(
  '/documents/photos_employeur',
  express.static(
    path.resolve(
      __dirname,
      '../../crm_cmo/documents/photos_employeur'
    )
  )
);
app.use(
  '/documents/autre_type_entreprise',
  express.static(
    path.resolve(
      __dirname,
      '../../crm_cmo/documents/autre_type_entreprise'
    )
  )
);
//new-------------------------------
app.use(
  '/documents/devis',
  express.static(
    path.resolve(
      __dirname,
      '../../crm_cmo/documents/devis'
    )
  )
);

app.get('/cmo_app/test', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});