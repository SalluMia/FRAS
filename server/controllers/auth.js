const User = require('../models/User');
const Data = require('../models/Addinfo');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({
      username,
      email,
      password,
    });
    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid Credentials', 401));
    }
    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid Credentials', 401));
    }
    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.addData= async(req,res,next)=>{

    try{
      console.log(req.body);
      
      const {status,product,quantity,lat,lng}=req.body;
      const userId= req.user.id;
      
      res.json({message:req.body})
     
      const details= new Data({userId,status,product,quantity,lat,lng})

      details.save();
      
      res.json({message: "Data inserted successfully"})

    }catch(e){
        console.log(e)
        next(e)
    }

}
exports.getData=async(req,res)=>{
  const data= await Data.find();
  res.json(data);
}

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      next(new ErrorResponse('Email cannot be sent', 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;
    const message = `<h1>You have requested a password reset</h1><p>Please go to this link to reset your password</p><a href=${resetUrl} clicktracking=off>${resetUrl}</a>`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: message,
      });
      res.status(200).json({ success: true, data: 'Email Sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      next(new ErrorResponse('Email cannot be sent', 404));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorResponse('Invalid reset token', 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(201).json({
      success: true,
      data: 'Password reset success',
    });
  } catch (error) {
    next(error);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};




exports.getSingleData= async (req, res,next) => {
  try {
    const userId = req.user.id; // Get the ID of the active user from the authentication middleware
    console.log(userId); // Add a console log to check the value of userId
    const data = await Data.find({ userId }); // Add a filter condition to retrieve data only for the active user
    res.json(data);
    console.log(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
    next(err)
  }
};

exports.deleteData = async (req, res,next) => {
  try {
    const { id } = req.params;
    const data = await Data.findById(id);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    await Data.findByIdAndDelete(id);

    res.status(200).json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error(error);
    next(error)
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateData = async (req, res,next) => {
  try {
    const { id } = req.params;
    const { status, product, quantity,lat,lng } = req.body;
    const data = await Data.findById(id);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    data.status = status;
    data.product = product;
    data.quantity = quantity;
    data.lat=lat;
    data.lng=lng;

    await data.save();

    res.status(200).json({ message: 'Data updated successfully', data });
  } catch (error) {
    console.error(error);
    next(error)
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.markCompleted=async (req, res) => {
  const { itemId, userId } = req.body;

  try {
    const item = await Item.findOneAndUpdate(
      { _id: itemId, createdBy: userId }, // assuming each item has a createdBy field to verify ownership
      { $set: { isDone: true } },
      { new: true }
    );

    if (!item) {
      return res.status(404).send({ message: 'Item not found or not authorized.' });
    }

    res.status(200).send({ message: 'Item marked as completed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error.' });
  }
};

exports.statusUpdated=async(req,res)=>{
  try {

    const { status } = req.body;
    const{_id} = req.params;
    
    Data.findByIdAndUpdate(_id, { status }, (err, data) => {    
       if(err) return res.json({status:500,msg:err.message})
       res.json({status:200,msg:'Status Updated Successfully' + status})
    } )  
  } catch (error) {
    // next(error)
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the location' });
}
}