const handlePrimaryMenu = async(req, res, pool, bcrypt) => {
    try {        
        const { arr } = req.body;
        const { canteen_id } = req.user;        
        await pool.query('DELETE FROM starters Where canteen_id = $1', [canteen_id]);
        await pool.query('DELETE FROM maincourse Where canteen_id = $1', [canteen_id]);
        await pool.query('DELETE FROM deserts Where canteen_id = $1', [canteen_id]);
        await pool.query('DELETE FROM drinks Where canteen_id = $1', [canteen_id]);
        // console.log(req.body);
        // console.log(req.user);
        // console.log(arr.starters[1]);
        for(let i = 0; i < arr.starters.length; i++) {   
            const { food_name, price, status } = arr.starters[i];                        
            await pool.query('INSERT INTO starters(food_name, price, canteen_id, status) VALUES ($1,$2,$3,$4)',
                [food_name, price, canteen_id, status]
            )            
        }

        for(let i = 0; i < arr.maincourse.length; i++) {
            // console.log(arr.maincourse[i]);   
            const { food_name, imageURL, price, status } = arr.maincourse[i]    ;
            await pool.query('INSERT INTO maincourse(food_name, price, canteen_id, status) VALUES ($1,$2,$3,$4)',
            [food_name, price, canteen_id, status]
            )             
        }

        for(let i = 0; i < arr.deserts.length; i++) {
            // console.log(arr.deserts[i]);   
            const { food_name, price, status } = arr.deserts[i]    ;
            await pool.query('INSERT INTO deserts(food_name, price, canteen_id,status) VALUES ($1,$2,$3,$4)',
            [food_name, price, canteen_id, status]
            )             
        }

        for(let i = 0; i < arr.drinks.length; i++) {
            // console.log(arr.drinks[i]);   
            const { food_name, price, status }  = arr.drinks[i]    ;
            await pool.query('INSERT INTO drinks(food_name, price, canteen_id,status) VALUES ($1,$2,$3,$4)',
            [food_name, price, canteen_id, status]
            )             
        }
        res.status(200).json({
            payload: {
                success: true,
                mssg: "Submitted Successfully"  
            }            
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            payload: {
                success: false,
                mssg: "Sorry there has been an error"  
            }            
        })
    }
}

module.exports = {handlePrimaryMenu}