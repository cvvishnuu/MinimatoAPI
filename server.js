const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const cors =require('cors')
const session = require('express-session');
const bcrypt = require('bcrypt'); //Bcrypt package required for encrypting incoming password
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const pgSession = require('connect-pg-simple')(session);
//----------------------------------------END OF IMPORTS -------------------------------------------------------//

const app = express();
//controllers
const signup = require('./Controllers/signup');
// const login = require('./Controllers/login');

//Middleware

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.use(session({
    secret: 'imsecret',
    resave:false,
    saveUninitialized: false,
    store: new pgSession({
        pool:pool,
        tableName:'session'

    }),
    cookie:{
        //httpOnly:true,
        //secure:true,
        maxAge: 60000

    }
    
}))

require('./passportConfig');

app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user)
//     next();
// })

//routes
app.get('/business',  (req, res) => {
   
    res.json({
        value:req.session
    })
})
app.post('/business/signup', (req, res) => {signup.handleSignup(req, res, pool, bcrypt)})
app.post('/business/login', (req, res,next) => {
    passport.authenticate("local", (err, user )=> {
        //console.log(user);
        if(err){
            return res.json({message:'oops  somithing wrong'});
        }
        req.logIn(user,err =>{
            console.log(user)
            if(err){
                return res.json({message:'user not logged in '});
            }
            return  res.json({
                payload:user,
                confirmation: 'true'
            })
        })
   
    })(req, res,next)
}); 
  


//port
app.listen(5000, () => {
    console.log('Starting server listening to port 5000');
})

