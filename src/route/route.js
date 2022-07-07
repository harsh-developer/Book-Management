const express = require('express')
const router = express.Router()
const bookcontroller=require('../controller/bookController')
const usercontroller=require('../controller/userController')





router.post('/register',usercontroller.registerUser)
router.post('/login',usercontroller.login)
router.post('/books',bookcontroller.createBooks)
router.get('/books',bookcontroller.getBook)
router.get('/books/:bookId',bookcontroller.getBookbyparams)







// global route>>>>>>>>>>
router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you request is not available"
    })
})


module.exports = router