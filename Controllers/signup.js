
//handling signup request and destructuring the values and inserting it into the database. bcrypt hash is used for hashing.
const handleSignup = async (req, res, pool, bcrypt) =>{
    try {
        //Destructuring the values from the request.body object
        const {canteenName,email,phoneNumber,password} = req.body;
        //Hasing the password and storing the hash into the pass variable.
        const pass = await bcrypt.hash(password,10);
        //Storing the data from the request.body and the hashed password into the database
        await pool.query(
            'INSERT INTO canteen(canteen_name, email, phone_no, password) VALUES ($1,$2,$3,$4)',
            [canteenName,email,phoneNumber,pass]
        )
        res.json({confirm: 'true'});
    } catch (error) {
        console.log(error);
        res.status(400).json('unable to register');
    }
}

//export function
module.exports = {handleSignup}
