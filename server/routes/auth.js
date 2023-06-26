const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  addData,
  getData,
  getSingleData,
  deleteData,
  updateData,
  statusUpdated,
  markCompleted // add this line
} = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/addData',protect, addData);


router.post('/forgotpassword', forgotPassword);
router.put('/passwordreset/:resetToken', resetPassword);
router.get('/getData', getData);
router.get('/getSingleData', protect, getSingleData);

router.patch('/updateData/:id', protect, updateData);
router.delete('/deleteData/:id', protect, deleteData);

router.post('/markCompleted', protect, markCompleted); // add this line
router.post('/updateStatus/:_id', statusUpdated);

module.exports = router;
