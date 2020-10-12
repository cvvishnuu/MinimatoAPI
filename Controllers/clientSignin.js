const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

function issueJwt(user) {
    const id = user.client_id;
    const expiresIn = '7d';
    const payload = {
        sub: id,
        iat: Date.now()
    };
    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    }
}

//To Do's
//email exists ?
//compare passsword ?
//return user and issue token
// : return error with passsword not matching
// : return no email in db  


const handleLogin = async (req, res, pool, bcrypt) => {
    try {
        const {email, password} = req.body;
        await pool.query('SELECT * FROM student WHERE email = $1', [email], async (err, result) => {
            if(err) {
                res.status(401).json({
                    success: false
                })
            }
            const user = result.rows[0];
            if(user) {
                if(await bcrypt.compare(password, user.password)) {
                    const generateToken = issueJwt(user);
                    res.status(200).json({ success: true, token: generateToken.token, expiresIn: generateToken.expires });
                }
                else{
                    res.status(401).json({message:'wrong username or password'})
                }
            }
            else{
                res.status(401).json({message:'wrong username or password'})
            }
        })  
    } catch (error) {
        res.status(401).json({message: "Error"});
    }
}

module.exports = {handleLogin}