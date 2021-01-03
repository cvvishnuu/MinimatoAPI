const handleIncomingOrder = async (req, res, pool) => {
    try {
        const { canteen_id } = req.user;
        const incomingOrders = await pool.query('SELECT order_id, client_id, client_name, client_email, client_phone_no, orders FROM scheduler WHERE canteen_id = $1',[canteen_id]);                
        res.status(200).json({
            payload: {
                orders: incomingOrders.rows
            }
        })
    } catch (error) {
        console.log(error)
        res.status(400)        
    }
}
module.exports = {handleIncomingOrder}