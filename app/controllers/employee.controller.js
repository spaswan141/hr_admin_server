const Candidate = require("../models/candidate.model");

exports.getEmployees = async (req, res) => {
  try {
    const { position, search, attendanceStatus } = req.query;

    let query = {
      status: "Selected",
      userId: req.user._id,
    };
    if (position) {
      query.employeeType = position;
    }
    if (attendanceStatus) {
      query.employeeAttendanceStatus = attendanceStatus;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const employees = await Candidate.aggregate([
      {
        $match: query,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    return res.status(200).send({
      data: employees,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Candidate.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getPresentEmployees = async (req, res) => {
  try {
    const data = await Candidate.find({
      userId:req.user._id,
      status:'Selected',
      employeeAttendanceStatus: "Present",
    }).sort({
      createdAt: -1,
    });
    return res.status(200).send({
      code: 200,
      data:data
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: "Internal Server Error",
    });
  }
};
