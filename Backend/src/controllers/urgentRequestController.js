import UrgentRequest from "../models/urgentRequest.js";
import User from "../models/userModel.js"; // To find head counselors
import { sendEmail } from "../services/emailService.js"; // Your custom mailer
import Counselor from "../models/counselorModel.js";
export const createUrgentRequest = async (req, res) => {
  try {
    const { preferred_method, mobile, message, category } = req.body;
    const student_id = req.user._id;

    // Allow only 'call' as preferred method
    if (preferred_method !== "call") {
      return res.status(400).json({
        error:
          "Only 'call' is allowed as the preferred method for urgent requests.",
      });
    }

    if (!message) {
      return res
        .status(400)
        .json({ error: "You must enter a reason for urgent counseling." });
    }

    if (!mobile) {
      return res
        .status(400)
        .json({ error: "Mobile number is required for call method." });
    }

    // ✅ Validate mobile number format (e.g. +251912345678 or 0912345678)
    const phoneRegex = /^(\+?\d{10,15})$/;
    if (!phoneRegex.test(mobile)) {
      return res.status(400).json({
        error: "Invalid mobile number format. Enter a valid phone number.",
      });
    }

    const newRequest = new UrgentRequest({
      student_id,
      preferred_method,
      mobile,
      message,
      category,
    });

    await newRequest.save();

    // Notify head counselors
    const headCounselors = await User.find({
      role: "head_counselor",
     
    });

    for (const hc of headCounselors) {
      console.log(`Sending email to: ${hc.email}`);
      await sendEmail(
        hc.email,
        "🚨 New Urgent Counseling Request",
        `A student has submitted an urgent counseling request.\nCategory: ${category}\nMessage: ${message}\nMobile: ${
          mobile || "N/A"
        }`,
        `
          <p>Dear Head Counselor,</p>
          <p>A student has submitted an <strong>urgent counseling request</strong>.</p>
          <ul>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Message:</strong> ${message}</li>
            <li><strong>Mobile:</strong> ${mobile || "N/A"}</li>
          </ul>
          <p>Please review this request in your dashboard.</p>
        `
      );
    }
    

    return res
      .status(201)
      .json({ message: "Urgent request submitted.", request: newRequest });
  } catch (error) {
    console.error("Error creating urgent request:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// / Get urgent requests for counselors (only unassigned)
export const getUrgentRequestsForCounselor = async (req, res) => {
  try {
    const requests = await UrgentRequest.find({
      assigned_counselor_id: null,
      status: 'pending',
    }).populate('student_id', 'first_name last_name email').sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get urgent requests for head counselor (all)
export const getAllUrgentRequests = async (req, res) => {
  try {
    const requests = await UrgentRequest.find()
      .populate("student_id", "first_name last_name email")
      .populate({
        path: "assigned_counselor_id",
        populate: {
          path: "user_id",
          select: "first_name last_name email",
        },
      });

    res.json(requests);
    
      console.log(requests);
    

  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// Accept a request (counselor)
// export const acceptUrgentRequest = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const counselorId = req.user._id;

//     const request = await UrgentRequest.findById(id);

//     if (!request) {
//       return res.status(404).json({ error: 'Request not found' });
//     }

//     if (request.assigned_counselor_id) {
//       return res.status(400).json({ error: 'Request already accepted' });
//     }

//     request.assigned_counselor_id = counselorId;
//     request.status = 'accepted';
//     await request.save();

//     res.json({ message: 'You have accepted the request.', request });
//   } catch (error) {
//     console.error('Error accepting request:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


export const acceptUrgentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // ✅ Find counselor document by user ID
    const counselor = await Counselor.findOne({ user_id: userId });

    if (!counselor) {
      return res.status(404).json({ error: "Counselor profile not found" });
    }

    const request = await UrgentRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.assigned_counselor_id) {
      return res.status(400).json({ error: "Request already accepted" });
    }

    // ✅ Assign actual counselor ID, not user ID
    request.assigned_counselor_id = counselor._id;
    request.status = "accepted";
    await request.save();

    // Optionally populate response to immediately show assigned counselor
    const populated = await UrgentRequest.findById(request._id)
      .populate("student_id", "first_name last_name email")
      .populate({
        path: "assigned_counselor_id",
        populate: { path: "user_id", select: "first_name last_name email" },
      });

    res.json({ message: "You have accepted the request.", request: populated });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

