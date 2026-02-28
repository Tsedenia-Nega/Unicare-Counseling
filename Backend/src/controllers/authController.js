import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import UserModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import VerifiedStudent from "../models/verifiedStudentModel.js";
dotenv.config();
//user registration
export const register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    role = "student", 
    student_id,
    phone,
    bio,
  } = req.body;

  const profilePicture = req.file ? req.file.filename : "";

  if (!first_name || !email || !password || !student_id) {
    return res.json({ success: false, message: "Missing required details" });
  }
// password validation
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters, include one uppercase letter, one number, and one special character.",
    });
  }
  // Only apply student_id validation for students
  if (role === "student") {
    const studentIdRegex = /^[A-Z]{3}\/\d{4}\/\d{2}$/;
    if (!studentIdRegex.test(student_id)) {
      return res.json({
        success: false,
        message: "Student ID must be in format UGR/1234/12",
      });
    }
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    //  If role is student, validate against registrar CSV (VerifiedStudent)
    let department = "";
    let year_of_study = "";
    let gender = "";

    if (role === "student") {
      const verified = await VerifiedStudent.findOne({ student_id });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: "Student ID not recognized by registrar",
        });
      }

      department = verified.department;
      year_of_study = verified.year_of_study;
      gender = verified.gender;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
      student_id: role === "student" ? student_id : undefined,
      department: role === "student" ? department : undefined,
      year_of_study: role === "student" ? year_of_study : undefined,
      gender: role === "student" ? gender : undefined,
      phone_number: phone || "",
      bio: bio || "",
      profile_picture: profilePicture,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          _id: user._id,
          role: user.role,
          email: user.email,
        },
      });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const login= async(req,res)=>{
  const {email,password}= req.body;
if(!email || !password){
  return res.json({
    success: false, message: 'Email and Password are required'
  });}
  try{
 const user = await UserModel.findOne({email});
 if(!user){
  return res.json({success:false, message: 'Invalid Email'});
 }
 const isMatch = await bcrypt.compare(password, user.password);
 if (!isMatch){
   return res.json({ success: false, message: "Invalid password" });
 }
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: "1d",
});
console.log("Setting cookie token:", token);
res
  .cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    domain: "localhost",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  })
  .status(200)
  .json({
    success: true,
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture,
      department: user.department,
      year_of_study: user.year_of_study,
    }, 
  });

  }   catch(error){
return res.json({ success: false, message: error.message});
  }
}

export const logout = async(req,res)=>{
  try {
  res.clearCookie("token",
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "strict",
      
    });
  return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const sendVerifyOtp= async(req,res)=>{
  try{
    const{userId}= req.body;
    const user= await UserModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified){
      return res.json({success:false, message:"account already verified"});
    }
    const otp =String(Math.floor(100000 + Math.random()*900000));
    user.verifyOtp= otp;
    user.VerifyOtpExpireAt= Date.now()+24 *60*60*1000
    await user.save();
 
  const mailOption={
  from: process.env.SENDER_EMAIL,
  to: user.email,
  subject: "Account Verification Otp",
  text: `Your OTP is ${otp}. verify your account using this otp`
}
await transporter.sendMail(mailOption);
return res.json({success: true, message:"Verification OTP sent successfully"});


  }
  catch (error) {
    return res.json({ success: false, message: error.message });
  }
}





export const verifyEmail= async(req,res)=>{
  // const {userId,otp}= req.body;
  const { otp } = req.body;
  const userId = req.body.userId; 
  if(!userId || !otp){
    return res.json({
      success:false, message: "missing details"
    });}
try{
const user= await UserModel.findById(userId);
if(!user)
  {
 return res.json({
      success:false, message: "User not found"
    });
}
if (user.verifyOtp=== ''|| user.verifyOtp !==otp){
  return res.json ({success:false, message: "Invalid otp"});
}
if (user.VerifyOtpExpireAt < Date.now()){
return res.json({ success: false, message:"OTP Expired" });
}
user.isAccountVerified= true;
user.verifyOtp="";
user.VerifyOtpExpireAt= 0;



await user.save();
return res.json({ success: true, message:"Email Verified successfully" });
}catch(error){
  return res.json ({success:false, message: error.message});
}

}
export const isAuthenticated= async(req,res)=>{
  try{
return res.json({ success: true});
  }catch(error){
     return res.json({ success: false, message: error.message });
  }
}
// password reset otp
export const sendResetOtp= async(req,res)=>{
  const{email}= req.body;
  if(!email){  
    return res.json({ success: false, message:"Email i s required"});
  }
  try{
const user= await UserModel.findOne({email});
if (!user){
  return res.json({ success: false, message:"user not found"});
}
const otp = String(Math.floor(100000 + Math.random() * 900000));
user.resetOtp = otp;
user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
await user.save();
 const mailOption = {
   from: process.env.SENDER_EMAIL,
   to: user.email,
   subject: "Password Reset Otp",
   text: `Your OTP for resetting your password is ${otp}. use this otp to proceed with resetting your password`,
 };
 await transporter.sendMail(mailOption);

return res.json ({success:true, message:"OTP sent to your Email"});
  }catch(error){
     return res.json({ success: false, message: error.message });
  }

}
// Reset user password
export  const resetPassword= async(req,res)=>{
  const{email,otp,newPassword}=req.body;
  if(!email||!otp||!newPassword){
return res.json({ success: false, message:"Email,OTP,and new password are required" });
  } 
  try{
const user= await UserModel.findOne({email});
if(!user){
  return res.json({ success: false, message: "user not found" });
}
if(user.resetOtp === " "|| user.resetOtp !== otp){
return res.json({ success: false, message: "Invalid OTP" });
}
if(user.resetOtpExpireAt< Date.now()){
  return res.json({ success: false, message: "OTp Expired" });
}
const hashedPassword= await bcrypt.hash(newPassword,10);
user.password=hashedPassword;
user.resetOtp= '';
user.resetOtpExpireAt= 0;
await user.save();
return res.json({ success: true, message: "Password has been reset successfully " });
  }catch(error){
     return res.json({ success: false, message: error.message });
  }
}

// updating profile
// Optional helper if needed to generate token again
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};



export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Use from auth middleware

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update allowed fields
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.phone_number = req.body.phone_number || user.phone_number;
    user.department = req.body.department || user.department;
    user.year_of_study = req.body.year_of_study || user.year_of_study;
    user.bio = req.body.bio || user.bio;

    
    if (req.file) {
      user.profile_picture = req.file.filename;
    }

    // Password update
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: user.email,
        role: user.role,
        profile_picture: updatedUser.profile_picture,
        phone_number: updatedUser.phone_number,
        department: updatedUser.department,
        year_of_study: updatedUser.year_of_study,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-passwordHash"); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

// profile

export const getProfile = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?._id;
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



