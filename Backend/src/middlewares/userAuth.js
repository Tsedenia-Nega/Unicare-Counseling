import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Adjust path if needed

const userAuth = async (req, res, next) => {
  try {
    let token;

    // 1. Try to get token from cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback: get token from Authorization header (Bearer token)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 3. If no token found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing. Please log in.",
      });
    }

    // 4. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Find user by decoded id and exclude password hash
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    // 6. Attach user info to req.user for downstream routes/middlewares
    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    // 7. Proceed to next middleware/route
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default userAuth;
