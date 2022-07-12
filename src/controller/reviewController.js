const reviewsModel = require('../model/reviewsModel');
const bookModel = require("../model/booksModel");
const mongoose = require('mongoose')


// regx
const regEx = /^\w[a-zA-Z.\s]*$/ ;
const regEx1 = /^\w[a-zA-Z\.]+/;

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    if (typeof value === Number && value.trim().length === 0) return false
    return true
}

//CREATE REVIEW
const createReview = async function (req, res) {
    try {
        let requestBody = req.body
        let bookId = req.params.bookId
        
        // let()

        if (Object.keys(requestBody) == 0) return res.status(400).send({ status: false, message: 'Please! Provide data into body 😒' })

        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid book id." })

        if (!isValid(bookId)) return res.status(400).send({ status: false, message: 'bookId is Required...' })

        requestBody.bookId = bookId

        const findBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!findBookId) return res.status(404).send({ status: false, message: ' Book is not found' })
        if (!isValid(requestBody.review)) return res.status(400).send({ status: false, message: 'review can not be blank...' })

        if(requestBody.review) {
            if(!regEx1.test(requestBody.review))return res.status(400).send({status:false , message: 'review must be alphabet'})
        }

        requestBody.reviewedAt = Date.now()

        if (!isValid(requestBody.rating)) return res.status(400).send({ status: false, message: ' rating is Required...' })

        if (!(requestBody.rating >= 1 && requestBody.rating <= 5)) return res.status(400).send({ status: false, message: 'Rating is between 1 to 5' })


         let updatebook=await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } }, { new: true })
      
        let saveData = await reviewsModel.create(requestBody)
        let {_id,reviewedBy,reviewedAt,rating,review,isDeleted}=saveData


        let data = { _id,bookId:saveData.bookId,reviewedBy,reviewedAt,rating,review,isDeleted}
        res.status(201).send({ status: true, message: 'review created successfully',data:updatebook, review:[ data] })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


// UPDATE REVIEW
const updateReview = async (req,res)=>{
    try{
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
       
        if(!regEx.test(req.body.reviewedBy)) return res.status(400).send({ status: false, message: "reviewedBy text is invalid it must be alphabet " });

        if(!regEx.test(req.body.review)) return res.status(400).send({ status: false, message: "review text is invalid it must be alphabet " });

        if(typeof req.body.rating !== "number" ||  (req.body.rating <= 0) || (req.body.rating > 5) ) return res.status(400).send({ status: false, message: " you can rate only 1 to 5 " });

        if(!(mongoose.isValidObjectId(bookId))) return res.status(400).send({ status: false, message: "Please Enter Valid BoodId." })

        if( !(mongoose.isValidObjectId(reviewId)) ) return res.status(400).send({ status: false, message: "Please Enter ReviewId." })

        const isBook = await bookModel.findById(bookId);

        if(!isBook || isBook.isDeleted === true) return res.status(404).send({ status: false, message: "Book is Not Found." })

        const isReview = await reviewsModel.findById(reviewId);

        if(!isReview || isReview.isDeleted === true)  return res.status(404).send({ status: false, message: "Review is Not Found." })

         await reviewsModel.findOneAndUpdate({_id:reviewId},req.body,{new:true});

        const reviewsData = await reviewsModel.find({bookId}).select({bookId:1,reviewedBy:1,reviewedAt:1,rating:1,review:1});

        return  res.status(200).send({ status: true, message: "Review Update secceseful",data:isBook,reviewsData })

    } catch (error) {return res.status(500).send({status: false,message: error.message})}
} 

// DELETE REVIEW
const DeleteBookReview = async function (req, res) {

    try {
        const reviewId = req.params.reviewId
        const bookId = req.params.bookId

        if(!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: 'Please enter valid bookId'})
        if(!mongoose.isValidObjectId(reviewId)) return res.status(400).send({ status: false, msg: 'Please enter valid reviewsId'})

        let book = await bookModel.findById(bookId)
        if (!book) return res.status(404).send({ status: false, message: "This bookId is not present in book DB" })

        // check if isDeleated Status is True
        if (book.isDeleted) return res.status(404).send({ status: false, message: "book is already deleted" })

        let review = await reviewsModel.findById(reviewId)
        if (!review) return res.status(404).send({ status: false, message: "This review is not present in review DB" })
        if (review.isDeleted) return res.status(404).send({ status: false, message: "review is already deleted" })

        if (book && review) {
            await reviewsModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
            await bookModel.findOneAndUpdate({_id:bookId},{$inc:{reviews:-1}},{ new: true })
            return res.status(200).send({ status: true, message: "review successfuly Deleted" });
        }
    } catch (error) { return res.status(500).send({ status: false, message: error.message }) }
}

 
module.exports = {createReview,updateReview,DeleteBookReview }