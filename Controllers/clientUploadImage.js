const handleUploadImage = async (req, res, pool) => {
    try { 
        const { id } = req.body
        const { name, data } = req.files.picture;
        // await pool.query('UPDATE student SET client_name = $1, WHERE client_id = $2', ["name", id])
        // await pool.query('UPDATE student SET client_name = $1, WHERE client_id = $2', [name,id])
        // await pool.query('UPDATE student SET image_name = $1, image = $2 WHERE client_id = $3', [name, data, id])
        await pool.query("SELECT * FROM images WHERE client_id = $1", [id] , async (err, result) => {
            if(err) {
                res.status(401).json({
                    success: false
                })
            }
            if(!result.rows[0]) {
                try {  
                    await pool.query(
                        'INSERT INTO images(image_name, image, client_id) VALUES($1,$2,$3)', 
                        [ name, data, id ]
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
                    await pool.query('UPDATE images SET image_name = $1, image = $2 WHERE client_id = $3', [name, data, id])
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