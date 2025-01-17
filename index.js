require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
// TODO - require express-openid-connect and destructure auth from it

const { User, Cupcake } = require('./db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
  // define the config object
  // attach Auth0 OIDC auth router
  // create a GET / route handler that sends back Logged in or Logged out
  const {
    AUTH0_SECRET, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN} = process.env;
  

  const { auth } = require('express-openid-connect');

  const config = {
    authRequired: true,
    auth0Logout: true,
    secret: AUTH0_SECRET,
    baseURL: AUTH0_AUDIENCE,
    clientID: AUTH0_CLIENT_ID,
    issuerBaseURL: AUTH0_DOMAIN,
  };

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.use(async (req, res, next) => {
  const user = req.oidc.user;
  if(user){
    const [newUser] = await User.findOrCreate({
      where: {email: user.email},
      defaults: user
    })
  }
  console.log(user);
  next()
});



// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  console.log(req.oidc.user);
  const userIndfo = req.oidc.user;

  const welcomeMesage = `
  <h1>My Web App, Inc<br></h1> 
  <h1>Weclome, ${req.oidc.nickname} Emakpo <br></h1>
  <h5>Username: ${req.oidc.user.nickname}<br></h5>
  <p>${req.oidc.user.name}</p>
  <img src=${req.oidc.user.picture} >
  `


  res.send(req.oidc.isAuthenticated() ? welcomeMesage : 'Logged out');
});



app.get('/cupcakes', async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});

