import UserModel
 from "../models/userModel.js";

 export const updateUserProfile= async (req,res)=>{
    try{
const user = await UserModel.findById
(req.user._id);
if(user){
    user.name=req.body.name|| user.name;
     user.email = req.body.email || user.email;
      user.profile_picture = req.body.profile_picture || user.profile_picture;

if(req.body.password){
    user.password= req.body.password;
}
const updateUser= await user.save();
res.json({
  _id: updateUser._id,
  name: updateUser.name,
email: updateUser.email,
  profile_picture: updateUser.profile_picture,
  token: generateToken(updateUser._id),
});
}
    }catch(error){
        res.json({success:false, message:error.message});
    }
 }

 

 // List All Users (basic info for table view)
 export const getAllUsers = async (req, res) => {
   try {
     const users = await UserModel.find({isAccountVerified: true }).select(
       "first_name last_name email role isActive isAccountVerified student_id department year_of_study profile_picture createdAt"
     );
     res.status(200).json({ success: true, users });
   } catch (error) {
     res
       .status(500)
       .json({ success: false, message: "Error fetching users", error });
   }
 };

 // Get User Details by ID (for detail view)
 export const getUserById = async (req, res) => {
   try {
     const user = await UserModel.findById(req.params.id).select(
       "first_name last_name email role isActive isAccountVerified student_id department year_of_study profile_picture gender date_of_birth bio createdAt"
     );

     if (!user) {
       return res
         .status(404)
         .json({ success: false, message: "User not found" });
     }

     res.status(200).json({ success: true, user });
   } catch (error) {
     res
       .status(500)
       .json({ success: false, message: "Error fetching user", error });
   }
 };

 // Activate or Deactivate User
 export const toggleUserStatus = async (req, res) => {
   try {
     const { id } = req.params;
     const { isActive } = req.body;

     const user = await UserModel.findByIdAndUpdate(
       id,
       { isActive },
       { new: true }
     ).select("first_name last_name email role isActive");

     if (!user) {
       return res
         .status(404)
         .json({ success: false, message: "User not found" });
     }

     res.status(200).json({
       success: true,
       message: `User ${isActive ? "activated" : "deactivated"} successfully`,
       user,
     });
   } catch (error) {
     res
       .status(500)
       .json({ success: false, message: "Error updating user status", error });
   }
 };
// In your user controller file
export const searchUsersByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name query required" });
    }

    // Case-insensitive partial match on first_name or last_name
    const users = await UserModel.find({
      $or: [
        { first_name: { $regex: name, $options: "i" } },
        { last_name: { $regex: name, $options: "i" } },
      ],
    }).select("first_name last_name email role isActive");

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error searching users", error });
  }
};
