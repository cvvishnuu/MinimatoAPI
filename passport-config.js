const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const path = require('path');
const fs = require('fs');
const pool = require('./db'); 
const pathToKey = path.join(__dirname, '.', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

/*--------------------------------------------------------END OF IMPORTS-----------------------------------------------------------------*/

//Options that needs to be passed into the JWT strategy
const options ={
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //where to extract the token from
    secretOrKey: PUB_KEY, //the key required which will be used to decrypt the incoming token
    algorithms: ['RS256'] // the algorith used
}

/*----------------- ---------------------------------------JWT startegy -------------------------------------------------------------------------------------------------*/

// payload is extracted from the token which is mentioned above in the option i.e ExractJwt
const client_Startegy = new JwtStrategy(options, async (payload, done) => {
    // console.log('im passport');
   // console.log(payload);
    await pool.query('SELECT * FROM student WHERE client_id = $1', [payload.sub], (err, result) => {
        const user = result.rows[0];
        if (err) {
            //console.log('this is from error');
            return done(err, false);
        }
        if (user) {
            //console.log('user is authenticated');
            return done(null, user);
        }
        else {
           // console.log('im else statement');
            return done(null, false);
        }
    })
})

/*-------------------------------------------------------canteen----------------------------------------------------------------------*/

// payload is extracted from the token which is mentioned above in the option i.e ExractJwt
const canteen_Startegy = new JwtStrategy(options, async (payload, done) => {
    // console.log('im passport');
   // console.log(payload);
    await pool.query('SELECT * FROM canteen WHERE canteen_id = $1', [payload.sub], (err, result) => {
        const user = result.rows[0];
        if (err) {
            //console.log('this is from error');
            return done(err, false);
        }
        if (user) {
            //console.log('user is authenticated');
            return done(null, user);
        }
        else {
           // console.log('im else statement');
            return done(null, false);
        }
    })
})

/*-----------------------------------------------exports-----------------------------------------------------------------------------------*/
module.exports = (passport) => {
    passport.use('jwt-canteen-signin',canteen_Startegy)
    passport.use('jwt-client-signin',client_Startegy)
}
