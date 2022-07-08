const usersModel = require("../model/usersModel")



// Validations
const isValid = function (value) {
    if (typeof value === undefined || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "number") return false;
    return true;
};

const validUserDetails = function (userDetails) {
    if (Object.keys(userDetails).length > 0) {
        return true
    }
    return false
};


// user Register APi
const registerUser = async function (req, res) {
    try {
        let userDetails = req.body
        let nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/
        let mailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        let passRegex = /^(?=.[0-9])(?=.[!@#$%^&])[a-zA-Z0-9!@#$%^&]{8,15}$/

        if (!validUserDetails(userDetails)) {
            return res.status(400).send({ status: false, message: 'Please enter details for user registration.' })
        }

        if (!userDetails.title) {
            return res.status(400).send({ status: false, msg: "Title is required for user registration." })
        }

        if (userDetails.title != "Mr" && userDetails.userDetails != "Mrs" && userDetails.title != "Miss") {
            return res.status(400).send({ status: false, msg: "Title should be from these options only- Mr, Mrs, Miss" })
        }

        if (!(userDetails.name && isValid(userDetails.name))) {
            return res.status(400).send({ status: false, msg: 'Name is required for user registration.' })
        }

        if (!(nameRegex.test(userDetails.name))) {
            return res.status(400).send({ status: false, msg: 'Please enter valid characters only in name.' })
        }

        if (!userDetails.phone) {
            return res.status(400).send({ status: false, msg: 'Phone number is required for user registration.' })
        }

        let phoneCheck = await usersModel.findOne({ phone: userDetails.phone })
        if (phoneCheck) {
            return res.status(400).send({ status: false, msg: "This phone number is already registered. Please log in." })
        }

        if (!userDetails.email) {
            return res.status(400).send({ status: false, msg: "Email is required for user registration." })
        }
        if (!(mailRegex.test(userDetails.email))) {
            return res.status(400).send({ status: false, msg: 'Please enter valid email id to register.' })
        }

        let mailCheck = await usersModel.findOne({ email: userDetails.email })
        if (mailCheck) {
            return res.status(400).send({ status: false, msg: "This email is already registered. Please log in." })
        }

        if (!userDetails.password) {
            return res.status(400).send({ status: false, msg: 'Password is required for privacy.' })
        }

        if (!(passRegex.test(userDetails.password))) {
            return res.status(400).send({ msg: "Please enter a password which contains min 8 and maximum 15 letters, at least a symbol, upper and lower case letters and a number" })
        }

        // if(!isValid.address.street){
        //     return res.status(400).send({status: false, msg: ""})
        // }

        let registerNow = await usersModel.create(userDetails)
        res.status(200).send({ status: true, data: registerNow })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message})
    }
}


const login = async (req,res)=>{

    try {
        const {email , password} = req.body;

        if(!email || !password) return res.status(400).send({status:false, message:"Please Fill All Required* Fields"});

        if(!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) return  res.status(400).send({status:false,message:"Please fill a valid emailId " })

        const isUser = await usersModel.findOne({email});

        if(!isUser) return res.status(404).send({status:false, message:"User Not Register"});

        if(isUser.password !== password) return res.status(401).send({status:false, message:"Invalid Login Credentials"});

        const token = jwt.sign({_id:isUser._id},"sourabhsubhamgauravhurshalltemsnameproject3",{expiresIn:"5d"});

        return res.status(200).send({status:true, message:"Login Successful", data:{token}});
        
    } catch (error) {return res.status(500).send({status: false,message: error.message})}

}

module.exports ={ registerUser,login}