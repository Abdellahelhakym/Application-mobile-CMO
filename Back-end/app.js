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


//signup route
const signupRoute = require('./signup');
app.use('/signup', signupRoute);

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

app.use(
  '/files',  
  express.static(path.join(__dirname, 'candidat', 'fils'))
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




app.get('/cmo_app/test', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});