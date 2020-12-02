const express = require('express'); // Importing express framework for building our server.
const bodyParser = require('body-parser'); //Importing body parser to parse the request json objects so that we can process them.
const pool = require('./db'); 
const cors = require('cors')
const fileupload = require('express-fileupload');
//const session = require('express-session'); // Importing the session middleware for creating our session and session store.
const bcrypt = require('bcrypt'); //Bcrypt package required for encrypting incoming password.
const passport = require('passport');
//const pgSession = require('connect-pg-simple')(session);





//-------------------------------------------------------------------END OF IMPORTS -------------------------------------------------------//

const app = express();

//canteen controllers 
const signupCanteen = require('./Controllers/canteenSignup');
const loginCanteen = require('./Controllers/canteenSignin');
const canteenProfile = require('./Controllers/canteenProfile');
const canteenEditProfile = require('./Controllers/canteenEditProfile');

//student controllers
const registerClient = require('./Controllers/clientSignup');
const loginClient = require('./Controllers/clientSignin');
const clientDashboard = require('./Controllers/clientDashboard');
const clientEditProfile = require('./Controllers/clientEditProfile');
const clientUploadImage = require('./Controllers/clientUploadImage');

//Middleware
app.use(bodyParser.json()) // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000','http://localhost:8000']
}))
app.use(fileupload());

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


// app.get('/', (req, res) => {
//     res.send('cookie sending');
// })
// app.get('/business',  (req, res) => {
   
//     res.json({
//         value:req.session
//     })
// })

/*---------------------------------------------------------------------Canteen routes--------------------------------------------------------------------*/

/*--------------------------------POST ROUTES---------------------------------------------------------------------- */

app.post('/business/signup', (req, res) => {signupCanteen.handleSignup(req, res, pool, bcrypt)});
app.post('/business/login', (req, res) => {loginCanteen.handleLogin(req, res, pool, bcrypt)});

/*--------------------------------GET ROUTES---------------------------------------------------------------------- */

app.get('/business/profile', passport.authenticate('jwt-canteen-signin', {session:false}), (req, res) => {canteenProfile.handleCanteenProfile(req, res)});

/*--------------------------------PUT ROUTES---------------------------------------------------------------------- */

app.put('/business/editprofile', passport.authenticate('jwt-canteen-signin', {session:false}), (req, res) => {canteenEditProfile.handleCanteenEditProfile(req, res, pool)});
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

/*--------------------------------POST ROUTES---------------------------------------------------------------------- */

app.post('/student/signup', (req, res) => {registerClient.handleSignup(req, res, pool, bcrypt)});
app.post('/student/login', (req, res) => {loginClient.handleLogin(req, res, pool, bcrypt)});
app.post('/student/uploadImage', (req, res) => {clientUploadImage.handleUploadImage(req, res, pool)})

/*--------------------------------GET ROUTES---------------------------------------------------------------------- */

app.get('/student/dashboard', passport.authenticate('jwt-client-signin', {session:false}), (req, res) => {clientDashboard.handleClientDashboard(req, res)});
app.get('/student/getImage', async (req, res) => {
    const { id } = req.headers;
    console.log("id "+ id)
    console.log(req.headers.id)
    await pool.query("SELECT * FROM images WHERE client_id = $1", [id] , (err, result) => {
        if(err) {
            res.status(401).json({
                success: false
            })
        }
        const user = result.rows[0];
        if(user) {
            const name = user.image_name;
            console.log(name)
            const index = name.indexOf(".");
            const extension = name.slice(index + 1);
            console.log(extension)
            const buffer = user.image // e.g., <Buffer 89 50 4e ... >
            const b64 = new Buffer.from(buffer).toString('base64')
            const mimeType = `image/${extension}` // e.g., image/png
            res.status(200).json({
                payload: {
                    b64: b64,
                    mimeType: mimeType,
                    success: true
                }
            })
        }
    })
})

/*--------------------------------PUT ROUTES---------------------------------------------------------------------- */

app.put('/student/editprofile', passport.authenticate('jwt-client-signin', {session:false}), (req, res) => {clientEditProfile.handleClientEditProfile(req, res, pool)});




/*----------------------------------------------------------------------port----------------------------------------------------------------------*/

app.listen(5000, () => {
    console.log('Starting server listening to port 5000');
})

