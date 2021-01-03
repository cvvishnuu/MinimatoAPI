const handleGetMenu = async (req, res, pool) => {
    try {
        const { id } = req.headers;    
        const starters = await pool.query("SELECT * FROM starters WHERE canteen_id = $1", [id])
        const maincourse = await pool.query("SELECT * FROM maincourse WHERE canteen_id = $1", [id])
        const  deserts = await pool.query("SELECT * FROM deserts WHERE canteen_id = $1", [id])
        const  drinks = await pool.query("SELECT * FROM drinks WHERE canteen_id = $1", [id])
        res.json({
            payload: {
                starters: starters.rows,
                maincourse: maincourse.rows,
                deserts: deserts.rows,
                drinks: drinks.rows
            }            
        })
    } catch (error) {
        console.log(error)        
    }
}

module.exports = {handleGetMenu}