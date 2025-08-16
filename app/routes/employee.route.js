const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employee.controller');
const passport=require("passport")
const requireAuth = passport.authenticate('jwt', {
  session: false
})

router.get('/',requireAuth, getEmployees);
router.patch('/update/:id',requireAuth,updateEmployee);
router.get('/:id',requireAuth, getEmployeeById);
router.delete('/:id',requireAuth, deleteEmployee);

module.exports = router;
