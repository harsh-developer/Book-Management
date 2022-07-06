const express = require('express')
const bodyParser = require('body-parser')
const route = require('./route/route')
const mongoose = require('mongoose')
const app = express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true }))

mongoose.connect("mongodb+srv://harsh-developer:aA12345678@cluster0.lxbes.mongodb.net/group22Database?retryWrites=true&w=majority",{
    useNewUrlParser: true
})
.then(()=> console.log('mongoDb is connected'))
.catch((error) => console.log(error))


app.use('/',route)

app.listen(process.env.PORT || 3000, function () {
    console.log("Express app running on port " + (process.env.PORT || 3000));
  });
  