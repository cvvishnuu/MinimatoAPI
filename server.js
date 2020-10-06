const express = require('express'); // Importing express framework for building our server.
const bodyParser = require('body-parser'); //Importing body parser to parse the request json objects so that we can process them.
const pool = require('./db'); 
const cors =require('cors')
const session = require('express-session'); // Importing the session middleware for creating our session and session store.
const bcrypt = require('bcrypt'); //Bcrypt package required for encrypting incoming password.
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);

//----------------------------------------END OF IMPORTS -------------------------------------------------------//

const app = express();

//controllers
const signup = require('./Controllers/signup');

//Middleware
app.use(bodyParser.json()) // For parsing application/json
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

require('./passportConfig'); //Requiring our local strategy.

app.use(passport.initialize());
app.use(passport.session());


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

