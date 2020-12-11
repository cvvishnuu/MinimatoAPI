const handleGetSearchResults = async (req, res, pool) => {
    try {
        const { keyword } = req.headers        
        const search_results = await pool.query('SELECT canteen_id, canteen_name, email, phone_no, address, imageurl, current_status FROM canteen WHERE canteen_name ILIKE $1 ORDER BY canteen_name' , [`%${keyword}%`])        
        res.status(200).json({ 
            payload :search_results.rows,
            success : true,            
        })
    } catch (e) {
        console.log(e)
        
    }
}

module.exports = {handleGetSearchResults}