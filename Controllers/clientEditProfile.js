const handleClientEditProfile = async (req, res, pool) => {
    try {
        const { id, name, email, phoneNo, gender, address } =  req.body;
        await pool.query('UPDATE student SET client_name = $1, email = $2, phone_no = $3, gender = $4, address = $5 WHERE client_id = $6', [name, email, phoneNo, gender, address, id])
        await pool.query("SELECT * FROM student WHERE client_id = $1", [id] , (err, result) => {
            if(err) {
                res.status(401).json({
                    success: false
                })
            }
            const user = result.rows[0];
            res.status(200).json({
                success: true,
                payload: {
                    id: user.client_id,
                    name: user.client_name,
                    email: user.email,
                    phone_no: user.phone_no,
                    address: user.address,
                    gender: user.gender
                }
            })
        })
    } 
    catch (error) {
        console.log(error)
        res.status(400).json("Error please try again later");
    }
}

module.exports = {handleClientEditProfile}