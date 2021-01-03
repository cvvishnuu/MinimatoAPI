const handleUploadImage = async (req, res, pool) => {
    try { 
        const { client_id } = req.user;
        const url = `/uploads/${req.file.originalname}`
        console.log("url "+url);
        console.log("id "+client_id);
        // await pool.query('UPDATE student SET client_name = $1, WHERE client_id = $2', ["name", id])
        // await pool.query('UPDATE student SET client_name = $1, WHERE client_id = $2', [name,id])
        // await pool.query('UPDATE student SET image_name = $1, image = $2 WHERE client_id = $3', [name, data, id])
        await pool.query("SELECT * FROM images WHERE client_id = $1", [client_id] , async (err, result) => {
            if(err) {
                res.status(401).json({
                    success: false
                })
            }
            if(!result.rows[0]) {
                try {  
                    await pool.query(
                        'INSERT INTO images(imageurl, client_id) VALUES($1,$2)', 
                        [ url, client_id ]
                    );
                    res.status(200).json({
                        success: true,
                        msg: 'Inserted'
                    })    
                } catch (error) {
                    console.log(error);
                    res.json(error);
                }
                
            } else {
                try {
                    await pool.query('UPDATE images SET imageurl = $1, WHERE client_id = $2', [url, client_id])
                    res.status(200).json({
                        success: true,
                        msg: 'Updated'
                    })    
                } catch (e) {
                    console.log(e);
                    res.json(e);
                }        
            }
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false
        })
    }
}

module.exports = { handleUploadImage }