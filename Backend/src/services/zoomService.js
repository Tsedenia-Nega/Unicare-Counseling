import fetch from "node-fetch";
import base64 from "base-64";

const zoomClientId = process.env.ZOOM_CLIENT_ID;
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;

const getAuthHeaders = () => ({
  Authorization: `Basic ${base64.encode(
    `${zoomClientId}:${zoomClientSecret}`
  )}`,
  "Content-Type": "application/json",
});

export const generateZoomAccessToken = async () => {
  try {
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
      { method: "POST", headers: getAuthHeaders() }
    );
    const jsonResponse = await response.json();
    return jsonResponse?.access_token;
  } catch (error) {
    console.error("Failed to generate Zoom access token:", error);
    throw error;
  }
};

export const generateZoomMeeting = async (meetingDetails) => {
  try {
    const zoomAccessToken = await generateZoomAccessToken();

    const response = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${zoomAccessToken}`,
      },
      body: JSON.stringify({
        topic: meetingDetails.topic || "Counseling Session",
        type: 2, // Scheduled meeting
        start_time: new Date(meetingDetails.startTime).toISOString(),
        duration: meetingDetails.duration || 60,
        timezone:
          meetingDetails.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        password: meetingDetails.password || generateRandomPassword(),
        settings: {
          join_before_host: true,
          waiting_room: false,
          auto_delete_after_meeting: true,
          host_video: true,
          start_upon_enter: true,
          participant_video: true,
          mute_upon_entry: false,
          approval_type: 0,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.statusText}`);
    }
const jsonResponse = await response.json();
   
       return {
      meetingId: jsonResponse.id,
      start_url: jsonResponse.start_url,
      join_url: jsonResponse.join_url,
      password: jsonResponse.password,
    };
    
  } catch (error) {
    console.error("Failed to generate Zoom meeting:", error);
    throw error;
  }
};

export const updateZoomMeeting = async (meetingId, updates) => {
  try {
    const zoomAccessToken = await generateZoomAccessToken();

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${zoomAccessToken}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to update Zoom meeting:", error);
    throw error;
  }
};

export const deleteZoomMeeting = async (meetingId) => {
  try {
    const zoomAccessToken = await generateZoomAccessToken();

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${zoomAccessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Zoom API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete Zoom meeting:", error);
    throw error;
  }
};

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(2, 10);
};

// import fetch from "node-fetch";
// import base64 from "base-64";

// const zoomClientId = "9kAczn6gT4qqVbQsAbWQVg";
// const zoomClientSecret = "CC7rIMcHPHyC2wtdhsOZx43kutgZqnAd";
// const zoomAccountId = "0p-Pa6MJSYy4dSXvvG5E_Q";
// const getAuthHeaders = () =>{
//   return {
//     Authorization:`Basic ${base64.encode(`${zoomClientId}:${zoomClientSecret}`)}`,
//     'Content-Type': 'application/json',
//   }
// }
// const generateZoomAccessToken = async()=>{
//   try{
// const response= await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
//      {
//   method:"POST",
//   headers:getAuthHeaders(),
//   // body:JSON.stringify({
//   //   grant_type : "account_credentials",
//   //   account_id : zoomAccountId,
//   // }),
// });
// const jsonResponse = await response.json();
// // console.log(jsonResponse);

// return jsonResponse?.access_token;

//   }catch(error){
// console.log("generate zoom access token",error);
// throw error;
//   }
// };
// const generateZoomMeeting= async ()=>{
//   try{
//     const zoomAccessToken= await  generateZoomAccessToken();
// const response = await fetch(`https://api.zoom.us/v2/users/me/meetings`,{
//   method: "POST",
//   headers:{
//     "Content-Type":'application/json',
//     "Authorization":`Bearer ${zoomAccessToken}`
//   },
//    body:JSON.stringify({
//   agenda:"zoom meeting",
//   default_password: false,
//   duration:60,
//   password:"12345",
//   // schedule_for: "tsedy171@gmail.com",
//   settings:{
//     allow_multiple_devices: true,
//     // alternative_hosts:"tsedy171@gmail.com",
//     alternative_hosts_email_notification: true,
//     breakout_room:{
//       enable: true,
//       rooms:[
//         {name:"room1",
//           participants:["tsedenienega@gmail.com","tsedenia301@gmail.com"],
//         },
//       ],
//     },
//     calendar_type: 1,
//     encryption_type:'enhanced_encryption',
//     join_before_host:true,
//     registrant_confirmation_email: true,
//     registrant_confirmation_notification: true,
//     continious_meeting_chat:{
//       enable: true,
//     }
//   },
//   }),
// });
// const jsonResponse = await response.json();
// console.log(jsonResponse);
//   }catch(error){
// console.log(error);
//   }
// }
// generateZoomMeeting();
