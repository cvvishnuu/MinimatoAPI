const handleCanteenProfile = (req, res) => {
    try {
        res.status(200).json({ 
            success: true, 
            msg: "You are successfully authenticated to canteen route",
            payload:{
                id: req.user.canteen_id,
                name: req.user.canteen_name,
                email: req.user.email,
                phone_no: req.user.phone_no,
                address: req.user.address
            }
        });
    } catch (error) {
        res.status(400).json('An error occured please try again later');
    }
}

module.exports = {handleCanteenProfile}