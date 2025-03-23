const express = require('express')
const {forgotPassword, resetPassword,updatePassword} = require('../controllers/passwordController')
const router = express.Router()

//After form submission
router.post('/update-password', updatePassword)


router.post('/forgot-password', forgotPassword)
router.get('/reset-password/:uuid', resetPassword)


module.exports = router;