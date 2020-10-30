
const handleClientDashboard = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            msg: "You are successfully authenticated to this route!",
            payload: {
               id: req.user.client_id,
               name: req.user.client_name,
               email: req.user.email,
               phone_no: req.user.phone_no,
               address: req.user.address,
               gender:req.user.gender
           }
       });
    } catch (error) {
        res.status(400).json('An error occured please try again later');
    }   
}

module.exports = {handleClientDashboard}