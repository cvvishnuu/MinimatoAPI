const handleSignup = async (req, res, pool) =>{
    try {
        const {canteenName,email,phoneNumber,password} = req.body;
        await pool.query(
            'INSERT INTO canteen(canteen_name, email, phone_no, password) VALUES ($1,$2,$3,$4)',
            [canteenName,email,phoneNumber,password]
        )
        res.json({confirm: 'true'});
    } catch (error) {
        console.log(error);
        res.status(400).json('unable to register');
    }
}

module.exports = {handleSignup}
