const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')

const  authentication  = async (req,res,next)=>{
try {
    let token = req.headers['x-api-key']

    if(!token) return res.status(401).send({status:false,message:"user has not token"})

    const isVerify = jwt.verify(token,"sourabhsubhamgauravhurshalltemsnameproject3");

    if(!isVerify) return res.status(400).send({status:false,message:"user has invalid token"})

    req.userDetail = isVerify;

    next()

} catch (error) { return res.status(500).send({status:false ,message:error.message})}

}


const authorisation = async (req,res,next)=>{
try {
    const bookId = req.params.bookId;

    if(!(mongoose.isValidObjectId(bookId))) return res.status(400).send({status:false ,message:"Please enter valid BookId"});

    if( req.userDetail._id !== bookId ) return res.status(403).send({status:false ,message:"You can't change other's data"});

    next()


} catch (error) { return res.status(500).send({status:false ,message:error.message})}
}
module.exports.authentication = authentication
module.exports.authorisation = authorisation