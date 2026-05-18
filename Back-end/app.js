const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // Importer la connexion à la base de données
const path = require("path");

app.use(express.json());
app.use(cors());

const port = 3000;

// routes
//login route
const loginRoute = require('./login');
app.use('/login', loginRoute);


//signup route
const signupRoute = require('./signup');
app.use('/signup', signupRoute);


//--------------------candidat route----------------------------

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
  express.static(path.join(__dirname, 'fils'))
);






app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});