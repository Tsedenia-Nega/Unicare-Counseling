import dotenv from "dotenv";
dotenv.config();

const zoomConfig = {
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
  redirectUri: process.env.ZOOM_REDIRECT_URI,
};

export default zoomConfig;
