// VerifiedStudent.js
import mongoose from "mongoose";
const verifiedStudentSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
//   email: String,
  student_id: { type: String, unique: true },
  department: String,
  year_of_study: String,
  gender: String,
});
const VerifiedStudent=mongoose.models.VerifiedStudent ||
mongoose.model("VerifiedStudent", verifiedStudentSchema);
export default VerifiedStudent;
