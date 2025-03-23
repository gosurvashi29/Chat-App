const express = require('express');

const {getUserLeaderBoard} = require('../controllers/premiumController')

const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/showLeaderBoard',getUserLeaderBoard);


module.exports = router;