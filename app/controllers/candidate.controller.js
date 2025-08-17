const Candidate = require("../models/candidate.model");
const path = require("path");
const fs = require("fs");
// Create
exports.createCandidate = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract form fields
    const { fullName, email, phone, experience, position } = req.body;
    const userId = req.user._id;
    const isEmailExist = await Candidate.findOne({ email, userId });
    if (isEmailExist) {
      return res.status(409).send({
        code: 409,
        message: "A candidate with this email already exists.",
      });
    }

    const isPhoneExist = await Candidate.findOne({ phone, userId });
    if (isPhoneExist) {
      return res.status(409).send({
        code: 409,
        message: "A candidate with this phone number already exists.",
      });
    }
    // Check if resume file is uploaded
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    // Get resume file
    const resume = req.files.resume;

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${resume.name}`;

    // Define upload paths
    const uploadDir = path.join(__dirname, "../../", "uploads");
    console.log(uploadDir, "uploadDir");
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/resume/${fileName}`; // Backend URL path

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
    const candidateData = {
      userId: req.user._id,
      fullName,
      email,
      phone,
      experience,
      position,
      resume: fileUrl,
    };

    // TODO: Replace with your database save logic
    // Example with Mongoose:
    const candidate = new Candidate(candidateData);
    const savedCandidate = await candidate.save();

    console.log("Candidate data:", candidateData);

    res.status(201).json({
      message: "Candidate added successfully",
      data: savedCandidate,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({
      error: "An error occurred while processing your request",
    });
  }
};

// Read All
exports.getCandidates = async (req, res) => {
  try {
    const { status, search, position } = req.query;

    // Build match conditions
    let matchConditions = {
      userId: req.user._id,
    };

    if (status) {
      matchConditions.status = status;
    }

    if (position) {
      matchConditions.position = position;
    }

    if (search) {
      matchConditions.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [];

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add sort stage
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    const candidates = await Candidate.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: candidates,
      count: candidates.length,
    });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.downloadResume = async (req, res) => {
  try {
    // Path to the file you want to download
    // For example, assuming the file is saved in /public/files/
    const user = await Candidate.findById(req.params.id);
    const fileName = path.basename(user.resume);
    const filePath = path.join(__dirname, "../../uploads", fileName);
    // Use res.download to trigger file download in browser
    return res.download(filePath, "resume.pdf", (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Read One
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate)
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    res.status(200).json({ success: true, data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
exports.updateCandidateStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          status: req.body.status,
        },
      },
      { new: true, runValidators: true }
    );
    if (!candidate)
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    res.status(200).json({ success: true, data: candidate });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate)
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    res
      .status(200)
      .json({ success: true, message: "Candidate deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
