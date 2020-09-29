const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pool = require('./db');
const cors =require('cors')

//controllers
const signup = require('./Controllers/signup');
const login = require('./Controllers/login');

//Middleware
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

//routes
app.get('/business', async (req, res) => {res.send('peeps')})
app.post('/business/signup', (req,res)=>{signup.handleSignup(req, res, pool)})
app.post('/business/login', (req,res)=>{login.handleLogin(req,res, pool)})


//port
app.listen(5000, () => {
    console.log('Starting server listening to port 5000');
})

