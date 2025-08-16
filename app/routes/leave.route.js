const express = require('express');
const router = express.Router();
const { addLeave, getAllLeaves, getApprovedLeaves, updateStatus, downloadDocs } = require('../controllers/leave.controller');
const passport=require("passport")
const requireAuth = passport.authenticate('jwt', {
  session: false
})

router.post('/add',requireAuth,addLeave);
router.get('/',requireAuth,getAllLeaves);
router.get("/approved",requireAuth,getApprovedLeaves);
router.patch("/update/:id",requireAuth,updateStatus)
router.get("/download-doc/:id",downloadDocs)

module.exports = router;
