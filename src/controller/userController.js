const usersModel = require("../model/usersModel")
const jwt = require('jsonwebtoken');

// regular expression 
const nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/
const mailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
const regexNumber = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
const regexPin = /^[1-9]{1}[0-9]{2}[0-9]{3}$/
const passRegex = /^[a-zA-Z0-9]{8,15}$/

// Validations
const isValid = function (value) {
    if (typeof value === undefined || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "number") return false;
    return true;
};

// user Register APi
const registerUser = async function (req, res) {
    try {
        let userDetails = req.body
       
        if (Object.keys(userDetails).length == 0) {
            return res.status(400).send({ status: false, message: 'Please enter details for user registration.' })
        }

        if (!userDetails.title) {
            return res.status(400).send({ status: false, msg: "Title is required for user registration." })
        }

        if (userDetails.title != "Mr" && userDetails.title != "Mrs" && userDetails.title != "Miss") {
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

        if (!isValid(userDetails.phone)) {
            return res.status(400).send({ status: false, msg: "Phone number can't be blank or without strig." })
        }
        let checkMobileNo = regexNumber.test(userDetails.phone)
        if (!checkMobileNo) return res.status(400).send({ status: false, msg: "Mobile Number must 10 digit only." })

        let phoneCheck = await usersModel.findOne({ phone: userDetails.phone })
        if (phoneCheck) {
            return res.status(409).send({ status: false, msg: "This phone number is already registered." })
        }

        if (!userDetails.email) {
            return res.status(400).send({ status: false, msg: "Email is required for user registration." })
        }
        if (!(mailRegex.test(userDetails.email))) {
            return res.status(400).send({ status: false, msg: 'Please enter valid email id to register.' })
        }

        let mailCheck = await usersModel.findOne({ email: userDetails.email })
        if (mailCheck) {
            return res.status(409).send({ status: false, msg: "This email is already registered." })
        }

        if (!userDetails.password) {
            return res.status(400).send({ status: false, msg: 'Password is required for privacy.' })
        }

        if (!(passRegex.test(userDetails.password))) {
            return res.status(400).send({ msg: "Please enter a password which contains min 8 and maximum 15 letters,upper and lower case letters and a number" })
        }

        if(Array.isArray(userDetails.address) )  return res.status(400).send({ status: false, msg: " address is in Object format." })

        if (!isValid(userDetails.address.city )) {
            return res.status(400).send({ status: false, msg: "Please enter city." })
        }
        if (!isValid( userDetails.address.pincode)) {
            return res.status(400).send({ status: false, msg: "Please enter pincode " })
        }
        if (!isValid(userDetails.address.street)) {
            return res.status(400).send({ status: false, msg: " Enter proper street name." })
        }
        if (userDetails.address.city) {
            if (!nameRegex.test(userDetails.address.city)) {
                return res.status(400).send({ status: false, msg: "Please enter city in alphabet" })
            }
        }
        if (userDetails.address.pincode) {
            if (!regexPin.test(userDetails.address.pincode)) {
                return res.status(400).send({ status: false, msg: "Please enter pincode in number or only 6 digit" })
            }
        }
        let registerNow = await usersModel.create(userDetails)
        res.status(201).send({ status: true, data: registerNow })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

// Login
const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).send({ status: false, message: "Please Fill All Required* Fields" });

        if (!mailRegex.test(email)) return res.status(400).send({ status: false, message: "Please fill a valid emailId " })

        const isUser = await usersModel.findOne({ email });

        if (!isUser) return res.status(404).send({ status: false, message: "User Not Register" });

        if (isUser.password !== password) return res.status(401).send({ status: false, message: "Invalid Login Credentials" });

        const token = jwt.sign({ _id: isUser._id }, "sourabhsubhamgauravhurshalltemsnameproject3", { expiresIn: "1d" });
        
        res.setHeader("x-api-key", token)    
        return res.status(200).send({ status: true, message: "Login Successful", data: { token } });

    } catch (error) { return res.status(500).send({ status: false, message: error.message }) }

}

module.exports = { registerUser, login }