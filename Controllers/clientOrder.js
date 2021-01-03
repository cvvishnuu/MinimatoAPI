const handleClientOrder = async (req, res, pool) => {
    try {        
        const { client_id, client_name, email, phone_no } = req.user;
        const { order, canteenId } = req.body;
        const orders = JSON.stringify(order)
        await pool.query(
            'INSERT INTO scheduler(canteen_id, client_id, client_name, client_email, client_phone_no, orders) VALUES($1,$2,$3,$4,$5,$6)', 
            [ canteenId, client_id, client_name, email, phone_no, orders]
        )     
    } catch (error) {
        console.log(error)        
    }
}

module.exports = {handleClientOrder}