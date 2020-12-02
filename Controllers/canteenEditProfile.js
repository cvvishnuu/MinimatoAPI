const handleCanteenEditProfile = async (req, res, pool) => {
    try {
        const { id, name, email, phoneNo, address } =  req.body;
        await pool.query('UPDATE canteen SET canteen_name = $1, email = $2, phone_no = $3, address = $4 WHERE canteen_id = $5', [name, email, phoneNo, address, id])
        await pool.query("SELECT * FROM canteen WHERE canteen_id = $1", [id] , (err, result) => {
            if(err) {
                res.status(401).json({
                    success: false
                })
            }
            const user = result.rows[0];
            res.status(200).json({
                success: true,
                payload: {
                    id: user.canteen_id,
                    name: user.canteen_name,
                    email: user.email,
                    phone_no: user.phone_no,
                    address: user.address
                }
            })
        })
    } catch (error) {
        console.log(error)
        res.status(400).json("Error please try again later");
    }
}

module.exports = {handleCanteenEditProfile}