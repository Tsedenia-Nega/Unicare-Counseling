import mongoose from "mongoose";
import User from "./userModel.js";
const CounselorSchema = new mongoose.Schema(
  {
    // Reference to the user who is the counselor (this could be the user who registers)
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User collection
      required: true,
    },

    // Counselor's qualifications (can be a comma-separated string or array of qualifications)
    qualifications: {
      type: [String],
      
    },

    // Counselor's specialization (e.g., Anxiety, Depression, CBT, etc.)
    specialization: [{ type: String,  }],

    // URL or path to the uploaded certification document (e.g., PDF, JPG, PNG)
    certificate_url: {
      type: String,
      
    },

    // Application status of the counselor
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // Starts as 'pending' and gets updated based on review
    },
    is_head_counselor: {
      type: Boolean,
      default: false,
    },

    // Optional: Additional fields for contact information
    

    // Optional: Bio or description about the counselor
    Experience: {
      type: String,
      default: "",
    },
    zoom: {
      access_token: { type: String },
      refresh_token: { type: String },
      expiry_date: { type: Date },
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the Counselor model from the schema
const CounselorModel = mongoose.model("Counselor", CounselorSchema);
// const CounselorrModel = mongoose.models.Counselor|| mongoose.model('Counselor',CounselorSchema);
export default CounselorModel;
