// const handleGetPrimaryMenu = async(req ,res, pool) => {
   
    
//     try {    
//     let starters, maincourse, deserts, drinks;
//     const { canteen_id } = req.user;
//  /*--------------------------------- Starters getdata-----------------------------------------------------*/
//         Promise.all([
//             await pool.query("SELECT * FROM starters WHERE canteen_id = $1", [canteen_id] , (err, result) => {
//                 if(err) {
//                     res.status(401).json({
//                         success: false
//                     })
//                 }
//                 const food = result.rows;
//                 starters = food;
//                 // console.log(starters);
//             }),
            
//     /*--------------------------------- main course getdata-----------------------------------------------------*/
    
//             await pool.query("SELECT * FROM maincourse WHERE canteen_id = $1", [canteen_id] , (err, result) => {
//                     if(err) {
//                         res.status(401).json({
//                             success: false
//                         })
//                     }
//                     const food = result.rows;
//                     maincourse = food;
//                     // console.log(maincourse);
//                 }
//             ),
            
//     /*--------------------------------- deserts getdata-----------------------------------------------------*/

//             await pool.query("SELECT * FROM deserts WHERE canteen_id = $1", [canteen_id] , (err, result) => {
//                     if(err) {
//                         res.status(401).json({
//                             success: false
//                         })
//                     }
//                     const food = result.rows;
//                     deserts = food;
//                     // console.log(deserts);
//                 }
//             ),

//     /*--------------------------------- drinks getdata-----------------------------------------------------*/

//             await pool.query("SELECT * FROM drinks WHERE canteen_id = $1", [canteen_id] , (err, result) => {
//                 if(err) {
//                     res.status(401).json({
//                         success: false
//                     })
//                 }
//                 const food = result.rows;
//                 drinks = food;
//                 console.log("starters " + starters)
//                 console.log("mains " + maincourse)
//                 console.log("deserts " + deserts)
//                 console.log("drinks " + drinks)                              
//             }
//         )]).then(()=>{
//             console.log("im the response")
//             res.status(200).json({                
//                 success: true,
//                 payload: {                    
//                     starters: starters,
//                     maincourse: maincourse,
//                     deserts: deserts,
//                     drinks: drinks
//                 }
//             })

//         })

       




//         //console.log(arr);
//     } catch (error) {
//         console.log(error)
        
//     }
 

    
// }

// module.exports = {handleGetPrimaryMenu}