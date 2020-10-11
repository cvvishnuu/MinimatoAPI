const express = require('express'); // Importing express framework for building our server.
const bodyParser = require('body-parser'); //Importing body parser to parse the request json objects so that we can process them.
const pool = require('./db'); 
const cors = require('cors')
//const session = require('express-session'); // Importing the session middleware for creating our session and session store.
const bcrypt = require('bcrypt'); //Bcrypt package required for encrypting incoming password.
const passport = require('passport');
//const pgSession = require('connect-pg-simple')(session);





//-------------------------------------------------------------------END OF IMPORTS -------------------------------------------------------//

const app = express();

//canteen controllers 
const signupCanteen = require('./Controllers/canteenSignup');
const loginCanteen = require('./Controllers/canteenSignin');

//student controllers
const registerClient = require('./Controllers/clientSignup');
const loginClient = require('./Controllers/clientSignin');

//Middleware
app.use(bodyParser.json()) // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

// app.use(session({
//         secret: 'imsecret',
//         resave:false,
//         saveUninitialized: true,
//         store: new pgSession({
//             pool:pool,
//             tableName:'session'
//         })  
//     })
// )

// require('./passportConfig') //Requiring our local strategy.
require('./passport-config.js')(passport)
app.use(passport.initialize());
// app.use(passport.session());

// app.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user);
//     next();
// })

/*---------------------------------------------------------------canteen routes-----------------------------------------------------*/
// app.get('/', (req, res) => {
//     res.send('cookie sending');
// })
// app.get('/business',  (req, res) => {
   
//     res.json({
//         value:req.session
//     })
// })

/*------------------------------------------------ canteen routes--------------------------------------------------------------------*/
app.post('/business/signup', (req, res) => {signupCanteen.handleSignup(req, res, pool, bcrypt)})
app.post('/business/login', (req, res) => {loginCanteen.handleLogin(req, res, pool, bcrypt)})
app.get('/business/dashboard',passport.authenticate('jwt-canteen-signin', {session:false}), (req, res) => {
    res.status(200).json({ success: true, msg: "You are successfully authenticated to canteen route"});
})
//     passport.authenticate("local", (err, user )=> {
//         if(err){
//             return res.json({message:'oops  somithing wrong'});
//         }
//         if(!user) {
//             res.json({
//                 confirmation: 'false'
//             })
//         } else {
//             req.login(user, err => {
//                 if(err){
//                     res.json({message:'Error user not logged in'});
//                 }
//                 res.json({
//                     payload:user,
//                     confirmation: 'true'
//                 })
//             })
//         }
        
   
//     })(req, res, next)
// }); 



/*---------------------------------------------------------------------student routes--------------------------------------------------------------------*/

app.post('/student/signup', (req, res) => {registerClient.handleSignup(req, res, pool, bcrypt)});
app.post('/student/login', (req, res) => {loginClient.handleLogin(req, res, pool, bcrypt)});
app.get('/student/dashboard', passport.authenticate('jwt-client-signin', {session:false}), (req, res) => {
    res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!"});
})



/*----------------------------------------------------------------------port----------------------------------------------------------------------*/

app.listen(5000, () => {
    console.log('Starting server listening to port 5000');
})

