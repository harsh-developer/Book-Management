const express = require('express')
const router = express.Router()
const {createBooks,getBook,getBookbyparams ,updateBook ,deletebookbyid }=require('../controller/bookController')
const {createReview,updateReview,DeleteBookReview } = require('../controller/reviewController')
const {registerUser,login}=require('../controller/userController')

const {authentication,authorisation} = require('../middleware/auth')


// user
router.post('/register',registerUser)     // test perfect
router.post('/login',login)               // test perfect

//book
router.post('/books', authentication, createBooks)       // test perfect
router.get('/books',authentication,getBook)                  // test perfect
router.get('/books/:bookId',authentication,getBookbyparams)     //test perfect
router.put('/books/:bookId',authentication,authorisation ,updateBook)          //test perfect
router.delete('/books/:bookId',authentication,authorisation,deletebookbyid)         //test perfect

//review
router.post('/books/:bookId/review',createReview)
router.put('/books/:bookId/review/:reviewId',updateReview)
router.delete('/books/:bookId/review/:reviewId',DeleteBookReview)





// BAD URL
router.all("*", function (req, res) {
    res.status(404).send({status: false,msg: "BAD URL NOT FOUND"})
})


module.exports = router