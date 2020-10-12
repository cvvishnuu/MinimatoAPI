const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

function issueJwt(user) {
    const id = user.canteen_id;
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

const handleLogin = async (req, res, pool, bcrypt) => {
    try {
        const { email, password } = req.body;
        await pool.query('SELECT * FROM canteen WHERE email = $1', [email], async (err, result) => {
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
                    res.json({success: false, message:'wrong username or password'})
                }
            }
            else{
                res.json({success: false, message:'wrong username or password'})
            }
        })  
    } catch (error) {
        res.status(401).json({success: false, message: "Error"});
        
    }
}

module.exports = {handleLogin}