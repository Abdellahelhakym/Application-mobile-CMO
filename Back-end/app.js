const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // Importer la connexion à la base de données


app.use(express.json());
app.use(cors());

// routes
//login route
const loginRoute = require('./login');
app.use('/login', loginRoute);


//signup route
const signupRoute = require('./signup');
app.use('/signup', signupRoute);



const port = 3000;




app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});