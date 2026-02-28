import UserModel from "../models/userModel.js";

const isHeadCounselor = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in request.",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user || user.role !== "head_counselor") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Head Counselor only.",
      });
    }

    next(); // Allow access if the user is a head counselor
  } catch (error) {
    console.error("Head Counselor middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking head counselor access.",
    });
  }
};

export default isHeadCounselor;
