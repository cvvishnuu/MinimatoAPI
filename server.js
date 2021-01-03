const express = require('express'); // Importing express framework for building our server.
const bodyParser = require('body-parser'); //Importing body parser to parse the request json objects so that we can process them.
const multer = require('multer');
const pool = require('./db'); 
const cors = require('cors');
const fileupload = require('express-fileupload');
require('dotenv').config()
//const session = require('express-session'); // Importing the session middleware for creating our session and session store.
const bcrypt = require('bcrypt'); //Bcrypt package required for encrypting incoming password.
const passport = require('passport');

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
//const pgSession = require('connect-pg-simple')(session);

const app = express();

//---------------------------------------------------------------------multer image storage ---------------------------------------------------




const storage = multer.diskStorage({
    destination: function (req, file, cb) {                
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();
        if(req.user.canteen_id){
            const path = `${req.user.canteen_id}${file.originalname}`
            console.log(typeof(path))
            file.originalname = path
            cb(null, file.originalname)
        } else {            
            const path = `${req.user.clien_id}${file.originalname}`
            file.originalname = path
            cb(null, file.originalname)
        }        
    }
})

// const fileFilter = (req, file, cb) => {
 
//     if(file.mimetype === "image/png" || file.mimetype === "image/jpg" ) {
//         console.log("im   workin");
//         cb(null, true)
//     }

//     else {
//         cb(null, false)
//     }
  
// }
    // To accept the file pass `true`, like so:
    
    
    // You can always pass an error if something goes wrong:
    
   
  

//Middleware
app.use(bodyParser.json()) // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

const upload = multer({
    storage: storage
});
app.use('/uploads',express.static('uploads'));

app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000','http://localhost:8000']
}))



//-------------------------------------------------------------------END OF IMPORTS -------------------------------------------------------//



//canteen controllers 
const signupCanteen = require('./Controllers/canteenSignup');
const loginCanteen = require('./Controllers/canteenSignin');
const canteenProfile = require('./Controllers/canteenProfile');
const canteenEditProfile = require('./Controllers/canteenEditProfile');
const canteenPrimaryMenu = require('./Controllers/canteenPrimaryMenu');
const canteenGetPrimaryMenu = require('./Controllers/canteenGetPrimaryMenu');
const canteenIncomingOrder = require('./Controllers/canteenIncomingOrder');


//student controllers
const registerClient = require('./Controllers/clientSignup');
const loginClient = require('./Controllers/clientSignin');
const clientDashboard = require('./Controllers/clientDashboard');
const clientEditProfile = require('./Controllers/clientEditProfile');
const clientUploadImage = require('./Controllers/clientUploadImage');
const clientGetSearchResults = require('./Controllers/clientGetSearchResults');
const clientGetMenu = require('./Controllers/clientGetMenu');
const clientOrder = require('./Controllers/clientOrder')



// app.use(fileupload());



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
app.post('/business/primary_menu', passport.authenticate('jwt-canteen-signin', {session:false}), (req, res) => { canteenPrimaryMenu.handlePrimaryMenu(req, res, pool); });
app.post('/business/uploadImage', passport.authenticate('jwt-canteen-signin', {session:false}), upload.single('picture'), async(req, res) => {
    try {
        const { canteen_id } = req.user;
        const url = `/uploads/${req.file.originalname}`
        await pool.query('UPDATE canteen SET imageurl= $1 WHERE canteen_id = $2', [url, canteen_id])
        await pool.query("SELECT imageurl FROM canteen WHERE canteen_id = $1", [canteen_id] , async (err, result) => {
            if(err) {
                res.status(401).json({
                    success: false
                })
            }
            if(result.rows[0]) {
                res.status(200).json({
                    success: true,
                    msg: 'Updated'
                })                
            } 
            else {
                res.status(500).json({
                    mssg: "server error"
                })    
            }
        })
    } catch (error) {                
        console.log(error);
    }
})

app.post('/api/messages', (req, res) => {
    res.header('Content-Type', 'application/json');
    console.log(req.body)
    client.messages
      .create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: req.body.to,
        body: req.body.body
      })
      .then(() => {
        res.send(JSON.stringify({ success: true }));
      })
      .catch(err => {
        console.log(err);
        res.send(JSON.stringify({ success: false }));
      });
  });

/*--------------------------------GET ROUTES---------------------------------------------------------------------- */

app.get('/business/profile', passport.authenticate('jwt-canteen-signin', {session:false}), (req, res) => {canteenProfile.handleCanteenProfile(req, res)});
// app.get('/business/primary_menu', passport.authenticate('jwt-canteen-signin', {session:false}), (req,res)=>{canteenGetPrimaryMenu.handleGetPrimaryMenu(req,res, pool)})
app.get('/business/primary_menu', passport.authenticate('jwt-canteen-signin', {session:false}), async(req, res) => {
    const { canteen_id } = req.user;
    const starters= await pool.query("SELECT * FROM starters WHERE canteen_id = $1", [canteen_id])
    const maincourse = await pool.query("SELECT * FROM maincourse WHERE canteen_id = $1", [canteen_id])
    const deserts = await pool.query("SELECT * FROM deserts WHERE canteen_id = $1", [canteen_id])
    const drinks = await pool.query("SELECT * FROM drinks WHERE canteen_id = $1", [canteen_id])
    res.json({
        starters: starters.rows,
        maincourse: maincourse.rows,
        deserts: deserts.rows,
        drinks: drinks.rows
    })
})

app.get('/business/getImage', passport.authenticate('jwt-canteen-signin', {session:false}), async (req, res) => {
    try {
        const { canteen_id } = req.user;
        await pool.query('SELECT imageurl FROM canteen WHERE canteen_id = $1', [canteen_id], (err, result) => {
            if(err) {
                res.status(401).json({
                    success: false
                })
            }
            const image = result.rows[0];            
            if(image) {
                res.status(200).json({
                    success: true,
                    payload: {                
                        url: image.imageurl          
                    }
                })
            } else{
                res.json({
                    mssg: "no image"
                })
            }            
        })
    } catch (error) {
        console.log(error);
    }
    
})
app.get('/business/incomingorder', passport.authenticate('jwt-canteen-signin', {session:false}), (req, res) => {canteenIncomingOrder.handleIncomingOrder(req,res,pool)})

/*--------------------------------PUT ROUTES---------------------------------------------------------------------- */

app.put('/business/editprofile', passport.authenticate('jwt-canteen-signin', {session:false}), (req, res) => {canteenEditProfile.handleCanteenEditProfile(req, res, pool)});
 


/*---------------------------------------------------------------------student routes--------------------------------------------------------------------*/

/*--------------------------------POST ROUTES---------------------------------------------------------------------- */

app.post('/student/signup', (req, res) => {registerClient.handleSignup(req, res, pool, bcrypt)});
app.post('/student/login', (req, res) => {loginClient.handleLogin(req, res, pool, bcrypt)});
app.post('/student/uploadImage', passport.authenticate('jwt-client-signin', {session:false}), upload.single('picture'), (req, res) => {clientUploadImage.handleUploadImage(req, res, pool)})
app.post('/student/order', passport.authenticate('jwt-client-signin', {session:false}), (req, res) => {clientOrder.handleClientOrder(req, res, pool)})

/*--------------------------------GET ROUTES---------------------------------------------------------------------- */

app.get('/student/dashboard', passport.authenticate('jwt-client-signin', {session:false}), (req, res) => {clientDashboard.handleClientDashboard(req, res)});
app.get('/student/getImage', passport.authenticate('jwt-client-signin', {session:false}), async (req, res) => {
    const { client_id } = req.user;
    await pool.query("SELECT * FROM images WHERE client_id = $1", [client_id] , (err, result) => {
        if(err) {
            res.status(401).json({
                success: false
            })
        }
        const user = result.rows[0];
        if(user) {
            const url = user.imageurl;        
            res.status(200).json({
                payload: {
                    url: url,
                    success: true
                }
            })
        }
    })
})

app.get('/student/getCanteenDetails', async(req, res) => {
    try {        
        const canteenDetails = await pool.query('SELECT canteen_id, canteen_name, phone_no, current_status, imageurl FROM canteen');
        res.status(200).json({
            payload: {
                canteenDetails: canteenDetails.rows,
                success: true
            }
        })
    } catch(error){
        console.log(error);
    }
})

app.get('/student/searchresults', (req, res) => {clientGetSearchResults.handleGetSearchResults(req, res, pool)})

app.get('/student/menu', (req,res) => {clientGetMenu.handleGetMenu(req,res,pool)})



/*--------------------------------PUT ROUTES---------------------------------------------------------------------- */

app.put('/student/editprofile', passport.authenticate('jwt-client-signin', {session:false}), (req, res) => {clientEditProfile.handleClientEditProfile(req, res, pool)});












/*----------------------------------------------------------------------port----------------------------------------------------------------------*/

app.listen(5000, () => {
    console.log('Starting server listening to port 5000');
})

