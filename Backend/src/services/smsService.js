import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log("SMS sent:", response.sid);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error("SMS Error:", error);
    return { success: false, error: error.message };
  }
};
