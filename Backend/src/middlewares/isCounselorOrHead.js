import jwt from "jsonwebtoken";
import CounselorModel from "../models/counselorModel.js";

const isCounselorOrHead = async (req, res, next) => {
  let token;

  // Get token from cookie or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const counselor = await CounselorModel.findOne({ user_id: userId });

    if (!counselor) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Not a counselor" });
    }

    // This check is a bit redundant, but OK
    if (counselor.is_head_counselor || counselor.user_id) {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Not a counselor" });
    }
  } catch (error) {
    console.error("Role check error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default isCounselorOrHead;
