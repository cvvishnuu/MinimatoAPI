const handleSignup = async (req, res, pool,bcrypt) => {
    try {
        const { clientName, email, phoneNumber, gender, password } = req.body;
        const pass = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO student(client_name, email, phone_no, gender, password) VALUES($1,$2,$3,$4,$5)', 
            [clientName, email, phoneNumber, gender, pass ]
        )
        res.json({confirm:'success'});   
    } catch (err) {
        console.log(err)
        res.send('unable to register')
    }
}

module.exports = { handleSignup }