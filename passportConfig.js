// const pool = require('./db');
// const bcrypt = require("bcryptjs");
// const LocalStrategy = require("passport-local").Strategy;
// const passport = require('passport');

// //Setting our custom fields to the names that are in the req.body that's been sent by the body, so that 
// //We can poppulate the username and the password field with the values available in the req.body.
// const customFields = {
//     usernameField: 'email',
//     passwordField: 'password'
// };

// //Defining the local strategy
// const verifyCallback = async (username, password, done) => {
//     await pool.query('SELECT * FROM canteen WHERE email = $1', [username], async (err, result) => {
//         if(err) return done (err);
//         if(result.rows.length > 0) {
//             const user = result.rows[0];
//            if(await bcrypt.compare(password, user.password)) {
//                 return done(null, user)
//             } else {
//                 return done(null, false)
//             }
//         } else {
//             return done(null, false)
//         }
//     })
// }


// const strategy = new LocalStrategy(customFields, verifyCallback);

// passport.use(strategy);

// passport.serializeUser((user, done) => {
//     done(null, user.canteen_id);
// });

// passport.deserializeUser(async (userId, done) => {
//     await pool.query('SELECT * FROM canteen WHERE canteen_id = $1', [parseInt(userId, 10)], (err, results) => {
//         if(err) {
//             console.log(err);
//         }
//         const user = results.rows[0];
//         done(null, user)
//     })
// })