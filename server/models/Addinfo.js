const mongoose=require('mongoose')
const User= require('./User')

const DataSchema=new mongoose.Schema({

  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
      status:{
         type:String,
         required:true
      },
      product:{
        type:String,
        required:true
     },
      quantity:{
        type:Number,
        required:true
      },
      lat:{
        type:Number,
        required:true
      },
      lng:{
        type:Number,
        required:true
      },
  
     
})

const data=mongoose.model('DataAddition',DataSchema)
module.exports=data