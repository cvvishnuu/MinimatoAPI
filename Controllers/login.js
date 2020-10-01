const handleLogin =  async (req,res,pool)=>{
    try{
        const {email, password} =  req.body;
        const result = await pool.query('SELECT * FROM canteen WHERE email=$1 AND password=$2 ',[email,password] )
        if (result.rows.length >= 1){
            res.send('data exists')
        }
        else{
            res.send('data doesnt exists')
        }
    }
    catch(err){
        console.log(err);
        res.status(400).json('something went wrong');
    }
}

module.exports ={handleLogin}