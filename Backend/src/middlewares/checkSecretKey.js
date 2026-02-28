// middleware/checkSecretKey.js
export const checkSecretKey = (req, res, next) => {
  try {
    const { secretKey } = req.body;

    if (!secretKey) {
      return res.status(400).json({
        success: false,
        message: "Secret key is required",
      });
    }

    const correctSecretKey = process.env.HEAD_COUNSELOR_SECRET;

    if (secretKey === correctSecretKey) {
      return res.status(200).json({
        success: true,
        message: "Secret key validated",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid secret key",
      });
    }
  } catch (err) {
    console.error("Middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during validation",
    });
  }
};
