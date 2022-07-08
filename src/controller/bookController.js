const bookModel = require("../model/booksModel")
const reviewsModel = require('../model/reviewsModel')
const mongoose = require('mongoose')
const userModel =require("../model/usersModel")
const ObjectId = require('mongoose').Types.ObjectId;
const titleregEx =   /^\w[A-Za-z0-9\s\-_,\.;:()]+$/
const regEx = /^\w[a-zA-Z\.]+/
const isbnregEx = /\x20*(?=.{17}$)97(?:8|9)([ -])\d{1,5}\1\d{1,7}\1\d{1,6}\1\d$/
const Dateregex=/^([0-9]{4}[-/]?((0[13-9]|1[012])[-/]?(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])[-/]?31|02[-/]?(0[1-9]|1[0-9]|2[0-8]))|([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00)[-/]?02[-/]?29)$/


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    if (typeof value === Number && value.trim().length === 0) return false
    return true
}

// CREATE BOOK
const createBooks = async function (req, res) {
    try {
        let booksdata = req.body
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body

        // fiest check data is pressent in body or not?
        if (Object.keys(booksdata).lentgh == 0) {
            return res.status(400).send({ status: false, message: "Please Enter the Data in Request Body" })
        }

        // title is present or not?
        if (!title) return res.status(400).send({ status: false, message: "Please Enter the Title" });
        if(!titleregEx.test(title) ) return res.status(400).send({ status: false, message: "title text is invalid" });
        
       
        // excerpt is present or not?
        if (!excerpt) return res.status(400).send({ status: false, message: "Please Enter the excerpt" });
        if(!regEx.test(excerpt)) return res.status(400).send({ status: false, message: "excerpt text is invalid it must be alphabet " });
        
        // userId is present or not?
        if (!userId) return res.status(400).send({ status: false, message: "Please Enter the userId" });
        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "Id is Invalid" });
        
        //check if userId is present in Db or Not ? 
        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "This userId is not present in Author DB" })

        // ISBN is present or not?
        if (!ISBN) return res.status(400).send({ status: false, message: "Please Enter the ISBN" });
        if(!isbnregEx.test(ISBN)){
            return res.status(400).send({ status: false, message: "Please Enter the valid ISBN its contain only 13 Number" + "Ex. 978-1-4098-8462-6, 978-1-4028-9462-6" });
        }
        // category is present or not?
        if (!category) return res.status(400).send({ status: false, message: "Please Enter the category" });
        if(!regEx.test(category)) return res.status(400).send({ status: false, message: "category text is invalid it must be alphabet " });
        
        // subcategory is present or not?
        if (!subcategory) return res.status(400).send({ status: false, message: "Please Enter the subcategory" });
        if(!regEx.test(subcategory)) return res.status(400).send({ status: false, message: "subcategory text is invalid it must be alphabet " });
    
        // releasedAt is present or not?
        if (!releasedAt) return res.status(400).send({ status: false, message: "Please Enter the releasedAt" });
        if(!Dateregex.test(releasedAt)) return res.status(400).send({ status: false, message: "Date is invalid it must be yyyy-MM-dd " });


        const TitleName = await bookModel.findOne({ title })
        if (TitleName) return res.status(409).send({ status: false, message: "Title must be unique" })
        
        const isbnnum = await bookModel.findOne({ ISBN })
        if (isbnnum) return res.status(409).send({ status: false, message: "ISBN must be unique" })
        
        
        let data = await bookModel.create(booksdata)
        return res.status(201).send({ status: true, message: 'Success', data: data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }


}

// GET ALL BOOK
const getBook = async function (req, res) {
    try {

        let data = req.query

        let { userId, category, subcategory, ...ab } = data

        if (Object.keys(ab).length > 0) return res.status(400).send({ status: false, message: 'Cannot filter is Query' })

        if (category) {
            if (!isValid(category)) return res.status(400).send({ status: false, message: 'Invalid Category' })
        }
        if (subcategory) {
            if (!isValid(subcategory)) return res.status(400).send({ status: false, message: 'Invalid subcategory' })
        }

        if (userId) {
            if (!mongoose.isValidObjectId(userId))
                return res.status(400).send({ status: false, msg: 'Please enter valid userId' })
        }


        const findBook = await bookModel.find({ $and: [data, { isDeleted: false }] }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

        if (!findBook.length) return res.status(404).send({ status: false, message: 'Book is Not found' })

        return res.status(200).send({ status: false, message: 'All Book Successfull', data: findBook })



    } catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}

// GET BOOK DETAIL BY PARAMS
const getBookbyparams = async (req,res)=>{
    try {

        const bookId = req.params.bookId;

        if(!mongoose.isValidObjectId(bookId))  return res.status(400).send({status:false, message:"Please Enter valid ObjectID"});

        const bookDetails = await bookModel.findById(bookId);

        if(!bookDetails || (bookDetails.isDeleted === true))  return res.status(404).send({status:false, message:"Book Details is Not Present in Our Database."});

        const reviews = await reviewsModel.find({bookId,isDeleted:false});

        return res.status(200).send({status:true, message:"Books Details",data:bookDetails,reviews});
        
    } catch (error) {return res.status(500).send({status: false,message: error.message})}
}

// UPDAT BOOK
const updateBook = async function (req, res) {
    try {
        let id = req.params.bookId
        let updateDetails = req.body

        if (Object.keys(updateDetails).length == 0) return res.status(400).send({ status: false, message: "Please enter data for updation." })

        let book = await bookModel.findOne({ _id: id, isDeleted: false });

        if (!book) return res.status(404).send({status: false, msg:'No such book found.'});

        if (Object.keys(updateDetails.category || updateDetails.subcategory)) return res.status(400).send({ status: false, message: "You arn't allowed to update this detail." })

        let updatedBook = await bookModel.findOneAndUpdate({ _id: id }, updateDetails, { new: true });
        return res.status(200).send({ status: true, data: updatedBook });

    }
    catch (err) { return res.status(500).send({status:false, msg: err.message })}
}

// DELETE BY BOOKID
const deletebookbyid=async (req,res)=> {
    try{
        const bookId =req.params.bookId;

        if(!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: 'Please enter valid bookId'})
    
        let book= await bookModel.findById(bookId)
    
        //check if isDeleated Status is True
        if (!book || book.isDeleted === ture) return res.status(404).send({status:false,message: "book is not found"})
        
         await bookModel.findOneAndUpdate({_id:bookId},{ isDeleted: true, deletedAt: new Date()},{new: true} );

         return res.status(200).send({ status: true, message: "successfuly Deleted" });
    
    } catch (error) {return res.status(500).send({status: false,message: error.message})}
}

  
module.exports = { createBooks,getBook,getBookbyparams ,updateBook ,deletebookbyid }




