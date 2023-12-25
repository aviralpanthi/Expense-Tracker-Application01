const mongoose = require('mongoose');

const userData = new mongoose.Schema({
   
    amount:Number,
    category:String,
    remark:String,
    paymentmode:{
        type:String,
        enum:['cash','online','cheque']
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
    

},{timestamps:true});

module.exports = mongoose.model('expense',userData)