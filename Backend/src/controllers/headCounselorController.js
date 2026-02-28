import CounselorModel from "../models/counselorModel.js"; 

import UserModel from "../models/userModel.js";

import { sendEmail } from "../services/emailService.js";
import PendingCounselorModel from "../models/PendingCounselorModel.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import csv from "csv-parser";
import VerifiedStudent from "../models/verifiedStudentModel.js";
// import { sendVerifyOtp, verifyEmail } from "./authController.js";
import bcrypt from "bcryptjs"; // To hash the password
import dotenv from "dotenv";

dotenv.config();



export const uploadVerifiedStudents = async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const students = [];
  const insertedIds = new Set();

  console.log(" Reading CSV file:", filePath);

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      console.log("🔍 Row received:", row);

      const sid = row.student_id?.trim();
      if (
        sid &&
        /^[A-Z]*\/[0-9]+\/[0-9]+$/i.test(sid) &&
        row.first_name &&
        row.last_name &&
        row.department &&
        row.year_of_study &&
        row.gender
      ) {
        students.push({
          student_id: sid,
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          department: row.department.trim(),
          year_of_study: row.year_of_study.trim(),
          gender: row.gender.trim(),
        });
      } else {
        console.log("❌ Skipped row due to missing/invalid fields:", row);
      }
    })
    .on("end", async () => {
      console.log(
        "✅ Finished reading CSV. Valid students found:",
        students.length
      );

      try {
        let insertedCount = 0;

        for (const student of students) {
          const exists = await VerifiedStudent.findOne({
            student_id: student.student_id,
          });
          if (!exists && !insertedIds.has(student.student_id)) {
            await VerifiedStudent.create(student);
            insertedIds.add(student.student_id);
            insertedCount++;
            console.log(" Inserted student:", student.student_id);
          } else {
            console.log(" Skipped duplicate:", student.student_id);
          }
        }

        // fs.unlinkSync(filePath); // Clean up the uploaded file
        // console.log("🧹 Deleted uploaded file:", filePath);

        return res.json({
          message: "Upload successful",
          insertedCount,
        });
      } catch (error) {
        console.error(" Error while inserting students:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    })
    .on("error", (err) => {
      console.error(" Error reading CSV file:", err);
      return res.status(500).json({ message: "Failed to parse CSV file" });
    });
};
export const registerHeadCounselor = async (req, res) => {
  try {
    const { first_name, last_name, email, password, secretKey } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !secretKey) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Verify secret key
    if (secretKey !== process.env.HEAD_COUNSELOR_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Head counselor already registered.",
      });
    }

    // Hash password and generate OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Create user
    const user = new UserModel({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: "head_counselor",
      isAccountVerified: false,
      verifyOtp: otp,
      VerifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    await user.save();

    // Create counselor profile
    const counselor = new CounselorModel({
      user_id: user._id,
      approval_status: "pending",
      is_head_counselor: true,
    });
    await counselor.save();

    // Send OTP email
    await sendEmail(
      user.email,
      "Account Verification OTP",
      `Your OTP is ${otp}. Verify your account using this OTP.`
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      userId: user._id,
      role: user.role,
      token: token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


// export const uploadVerifiedStudents = async (req, res) => {
//   const filePath = req.file?.path;

//   if (!filePath) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   const students = [];
//   const insertedIds = new Set();

//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on("data", (row) => {
//       // validate student_id format (e.g., 1550/14)
//       const sid = row.student_id?.trim();
//       if (
//         sid &&
//         /^[0-9]+\/[0-9]+$/.test(sid) && // e.g., 1550/14
//         row.first_name &&
//         row.last_name &&
//         row.department &&
//         row.year_of_study &&
//         row.gender
//       ) {
//         students.push({
//           student_id: sid,
//           first_name: row.first_name.trim(),
//           last_name: row.last_name.trim(),
//           department: row.department.trim(),
//           year_of_study: row.year_of_study.trim(),
//           gender: row.gender.trim(),
//         });
//       }
//     })
//     .on("end", async () => {
//       try {
//         let insertedCount = 0;

//         for (const student of students) {
//           const existing = await VerifiedStudent.findOne({
//             student_id: student.student_id,
//           });
//           if (!existing && !insertedIds.has(student.student_id)) {
//             await VerifiedStudent.create(student);
//             insertedIds.add(student.student_id);
//             insertedCount++;
//           }
//         }

//         fs.unlinkSync(filePath); // cleanup uploaded file

//         return res.json({
//           message: "Upload successful",
//           insertedCount,
//         });
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal server error" });
//       }
//     });
// };

// Register a new Head Counselor
// export const registerHeadCounselor = async (req, res) => {
//   try {
//     // 1. Destructure all fields from request
//     const {
//       first_name,
//       last_name,
//       email,
//       password,
//       qualifications,
//       specialization,
//       secretKey,
//     } = req.body;

//     const certificationFile = req.file; // From multer

//     // 2. Validate all required fields
//     if (
//       !first_name ||
//       !last_name ||
//       !email ||
//       !password ||
//       !qualifications ||
//       !specialization ||
//       !secretKey ||
//       !certificationFile
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields including certification file are required",
//       });
//     }

//     // 3. Check for existing user
//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Counselor already registered.",
//       });
//     }

//     // 4. Process file upload
//     const certificateUrl = `/uploads/certificates/${certificationFile.filename}`;

//     // 5. Hash password and generate OTP
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = String(Math.floor(100000 + Math.random() * 900000));

//     // 6. Create user document
//     const user = new UserModel({
//       first_name,
//       last_name,
//       email,
//       password: hashedPassword,
//       role: "head_counselor",
//       isAccountVerified: false,
//       verifyOtp: otp,
//       VerifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
//     });

//     await user.save();

//     // 7. Create counselor profile (EXACTLY matching your model)
//     const counselor = new CounselorModel({
//       user_id: user._id,
//       qualifications: qualifications.split(",").map((q) => q.trim()),
//       specialization: specialization.split(",").map((s) => s.trim()),
//       certificate_url: certificateUrl,
//       approval_status: "pending",
//       is_head_counselor: true,
//     });

//     await counselor.save();

//     // 8. Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     // 9. Send verification email
//     await sendEmail(
//       user.email,
//       "Account Verification OTP",
//       `Your OTP is ${otp}. Verify your account using this OTP.`
//     );

//     // 10. Return success response
//     return res.status(201).json({
//       success: true,
//       message: "Registration successful. Please verify your email.",
//       userId: user._id,
//       role: user.role,
//       token: token,
//       qualifications: qualifications,
//             specialization: specialization,
//             certificateUrl: certificateUrl,
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

    export const headVerifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp ) {
    return res.json({ success: false, message: "Missing required details" });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.VerifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.VerifyOtpExpireAt = 0;
    await user.save();

    await CounselorModel.findOneAndUpdate(
      { user_id: user._id },
      { approval_status: "approved" }
    );
    
    // await counselor.save();

    return res.json({ success: true, message: "Email verified and counselor profile created" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

    
    
    
  //   export const headVerifyEmail= async(req,res)=>{
  //     // const {userId,otp}= req.body;
  //     const { otp } = req.body;
  //     const userId = req.body.userId; 
  //     if(!userId || !otp){
  //       return res.json({
  //         success:false, message: "missing details"
  //       });}
  //   try{
  //   const user= await UserModel.findById(userId);
  //   if(!user)
  //     {
  //    return res.json({
  //         success:false, message: "User not found"
  //       });
  //   }
  //   if (user.verifyOtp=== ''|| user.verifyOtp !==otp){
  //     return res.json ({success:false, message: "Invalid otp"});
  //   }
  //   if (user.VerifyOtpExpireAt < Date.now()){
  //   return res.json({ success: false, message:"OTP Expired" });
  //   }

  //  (user.isAccountVerified = true);
  //   user.verifyOtp="";
  //   user.VerifyOtpExpireAt= 0;
  //   await user.save();
  //   // const counselor= await CounselorModel.findById()
  //   // counselor.is_head_counselor= true,
  //   // await counselor.save();
  //   return res.json({ success: true, message:"Email Verified successfully" });
  //   }catch(error){
  //     return res.json ({success:false, message: error.message});
  //   }
    
  //   }
  export const isAuthenticated= async(req,res)=>{
      try{
    return res.json({ success: true});
      }catch(error){
         return res.json({ success: false, message: error.message });
      }
    }
    // verifying counselor account

    
    export const handleCounselorApproval = async (req, res) => {
      const { pendingId } = req.params;
      const { action } = req.body;

      try {
        const pending = await PendingCounselorModel.findById(pendingId);
        if (!pending) {
          return res
            .status(404)
            .json({
              success: false,
              message: "Pending application not found.",
            });
        }

        if (action === "approve") {
          const user = new UserModel({
            first_name: pending.first_name,
            last_name: pending.last_name,
            email: pending.email,
            password: pending.password,
            profile_picture: pending.profile_picture_url,
            role: "counselor",
            isAccountVerified: true,
          });
          await user.save();

          const counselor = new CounselorModel({
            user_id: user._id,
            qualifications: pending.qualifications,
            specialization: pending.specialization,
            // certificate_url: pending.certificate_url,
            approval_status: "approved",
            is_head_counselor: false,
          });
          await counselor.save();

          await sendEmail(
            user.email,
            "Application Approved",
            `Congratulations ${user.first_name}, your counselor account is approved!`
          );

          await pending.deleteOne();

          return res.json({
            success: true,
            message: "Counselor approved and registered.",
          });
        }

        if (action === "reject") {
          await sendEmail(
            pending.email,
            "Application Rejected",
            `Sorry ${pending.first_name}, your counselor application was not approved.`
          );
          await pending.deleteOne();

          return res.json({
            success: true,
            message: "Application rejected and removed.",
          });
        }

        return res
          .status(400)
          .json({ success: false, message: "Invalid action." });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
    };

    // export const handleCounselorApproval = async (req, res) => {
    //   const { counselorId } = req.params;
    //   const { action } = req.body; // action: "approve" or "reject"

    //   try {
    //     const counselor = await CounselorModel.findById(counselorId);
    //     if (!counselor) {
    //       return res.status(404).json({
    //         success: false,
    //         message: "Counselor not found",
    //       });
    //     }

    //     const user = await UserModel.findById(counselor.user_id);
    //     if (!user) {
    //       return res.status(404).json({
    //         success: false,
    //         message: "User associated with counselor not found",
    //       });
    //     }

    //     if (action === "approve") {
    //       counselor.approval_status = "approved";
    //       user.isAccountVerified = true;

    //       await Promise.all([counselor.save(), user.save()]);

    //       await sendEmail(
    //         user.email,
    //         "Your Counselor Account is Verified",
    //         `Dear ${user.first_name},\n\nCongratulations! Your counselor application has been approved. You can now log in and begin helping students on the platform.\n\n- UniCare Team`
    //       );

    //       return res.json({
    //         success: true,
    //         message: "Counselor approved and notified.",
    //       });
    //     } else if (action === "reject") {
    //       counselor.approval_status = "rejected";
    //       await counselor.save();

    //       await sendEmail(
    //         user.email,
    //         "Your Counselor Application was Rejected",
    //         `Dear ${user.first_name},\n\nWe regret to inform you that your counselor application has been rejected. If you believe this was an error or would like to reapply, please contact support.\n\n- UniCare Team`
    //       );

    //       return res.json({
    //         success: true,
    //         message: "Counselor rejected and notified.",
    //       });
    //     } else {
    //       return res.status(400).json({
    //         success: false,
    //         message: "Invalid action. Must be 'approve' or 'reject'.",
    //       });
    //     }
    //   } catch (error) {
    //     return res.status(500).json({ success: false, message: error.message });
    //   }
    // };
    // Deactivate a user
// export const deactivateUser = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Find the user to deactivate
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Deactivate the user by setting isActive to false
//     user.isActive = false;
//     await user.save();

//     res.json({ success: true, message: "User deactivated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
export const deactivateUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  try {
    // Find the user to deactivate
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Deactivate the user by setting isActive to false
    user.isActive = false;

    // Optionally store the reason if needed
    if (reason) {
      user.deactivationReason = reason; // Add this field in your model schema if not present
    }

    await user.save();

    res.json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Activate a user
export const activateUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user to activate
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Activate the user by setting isActive to true
    user.isActive = true;
    await user.save();

    res.json({ success: true, message: "User activated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};