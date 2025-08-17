const LeaveModel = require("../models/leave.model");
const path = require("path");
const fs = require("fs");



exports.addLeave = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract form fields
    const { employeeId, designation, reason, leaveDate } = req.body;

    // Check if resume file is uploaded
    if (!req.files || !req.files.document) {
      return res.status(400).json({ error: "Document is required" });
    }

    // Get resume file
    const resume = req.files.document;

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${resume.name}`;

    // Define upload paths

    const uploadDir = path.join(__dirname, "../../", "uploads");
    console.log(uploadDir, "uploadDir");
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/leaves/${fileName}`; // Backend URL path

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert callback-based mv to Promise
    const moveFile = () => {
      return new Promise((resolve, reject) => {
        resume.mv(filePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };

    // Move the uploaded file
    await moveFile();

    // Save candidate data to database
    const payload = {
      userId:req.user._id,
      employeeId,
      reason,
      designation,
      leaveDate,
      document: fileUrl,
    };

    // TODO: Replace with your database save logic
    // Example with Mongoose:
    const leavedata = new LeaveModel(payload);
    const response = await leavedata.save();

    res.status(201).json({
      message: "Candidate added successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({
      error: "An error occurred while processing your request",
    });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    let { status, search } = req.query;
    let query = {
    };
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { "employeeDetails.fullName": { $regex: search, $options: "i" } },
        { "employeeDetails.email": { $regex: search, $options: "i" } },
      ];
    }
    const leaves = await LeaveModel.aggregate([
      {
        $match:{
          userId:req.user._id
        }
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "candidates",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails",
      },
      {
        $match:query
      },
    ]);
    return res.status(200).send({
      data: leaves,
      code: 200,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};
exports.getApprovedLeaves = async (req, res) => {
  try {
    const leaves = await LeaveModel.aggregate([
      {
        $match:{
          status:'Approve',
          userId:req.user._id
        }
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "candidates",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails",
      }
    ]);
    return res.status(200).send({
      data: leaves,
      code: 200,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};
exports.updateStatus=async(req,res)=>{
  try{
    await LeaveModel.findByIdAndUpdate(req.params.id,{
      $set:{
        status:req.query.status
      }
    });
    return res.status(200).send({
      code:200
    })
  }catch(err){
    return res.status(500).send({
      message:'Internal Server Error',
      code:500
    })
  }
}
exports.downloadDocs = async (req, res) => {
  try {
    const leave = await LeaveModel.findById(req.params.id);
    const fileName = path.basename(leave.document);
    const filePath = path.join(__dirname, "../../uploads", fileName);

    return res.download(filePath, fileName, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};