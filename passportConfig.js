const pool = require('./db');
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const passport = require('passport');


const customFields = {
    usernameField: 'email',
    passwordField: 'password'
};

const verifyCallback = async (username, password, done) => {
    console.log(username);
    console.log(password);
    await pool.query('SELECT * FROM canteen WHERE email = $1', [username], async (err, result) => {
        if(err) return done (err);
        if(result.rows.length > 0) {
            const user = result.rows[0];
            console.log(user);
           if(await bcrypt.compare(password, user.password)) {
                console.log('true')
                return done(null, user)
            } else {
                console.log('it dosent match')
                return done(' either email or Password incorrect', null)
            }
        }
    })
}


const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.canteen_id);
});

passport.deserializeUser(async (userId, done) => {
    await pool.query('SELECT * FROM canteen WHERE canteen_id = $1', [userId], (err, user) => {
        if(err) {
            console.log(err);
        }
        done(null, user)
    })
})