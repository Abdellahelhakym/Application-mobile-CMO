const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // Importer la connexion à la base de données


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









app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});