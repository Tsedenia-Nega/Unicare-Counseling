import Resource from "../models/resourceModel.js";

// Add Resource

export const addResource = async (req, res) => {
  try {
    const { title, description, media_type, category } = req.body;
const userId = req.body.userId || req.user?._id;
if (!userId) {
  return res
    .status(400)
    .json({ success: false, message: "User ID is required" });
}
    const media_url = req.file
      ? `/uploads/resources/${req.file.filename}`
      : null;

    const resource = new Resource({
      title,
      description,
      media_type,
      media_url,
      category,
      uploaded_by: userId,
    });

    await resource.save();
    res
      .status(201)
      .json({ success: true, message: "Resource added", resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

    
//get resource

export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("uploaded_by", "first_name last_name") // populate uploader's name
      .exec();

    // Base URL of your backend
    const baseURL = "http://localhost:4000";

    // Format response so frontend gets uploader name as a string and full media URL
    const formattedResources = resources.map((resource) => ({
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      media_type: resource.media_type,
      media_url: resource.media_url
        ? `${baseURL}${resource.media_url}` // add backend base URL here
        : null,
      category: resource.category,
      uploadedBy: resource.uploaded_by
        ? `${resource.uploaded_by.first_name} ${resource.uploaded_by.last_name}`
        : "Unknown",
      createdAt: resource.createdAt,
    }));

    res.status(200).json({ success: true, resources: formattedResources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const getResources = async (req, res) => {
//   try {
//     const resources = await Resource.find()
//       .populate("uploaded_by", "first_name last_name") // populate uploader's name
//       .exec();

//     // Format response so frontend gets uploader name as a string
//     const formattedResources = resources.map((resource) => ({
//       _id: resource._id,
//       title: resource.title,
//       description: resource.description,
//       media_type: resource.media_type,
//       media_url: resource.media_url,
//       category: resource.category,
//       uploadedBy: resource.uploaded_by
//         ? `${resource.uploaded_by.first_name} ${resource.uploaded_by.last_name}`
//         : "Unknown",
//       createdAt: resource.createdAt,
//     }));

//     res.status(200).json({ success: true, resources: formattedResources });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



//   try {
//     console.log("Fetching resources...");
//     const resources = await Resource.find({}); // Get all resources
//     console.log("Resources:", resources);

//     res.status(200).json({
//       success: true,
//       resources,
//     });
//   } catch (error) {
//     console.error("Error fetching resources:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



//delete resource
export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    const userId = req.body.userId || req.user?._id|| user.id;
    const userRole = req.user.role|| user?.role;

    console.log("Logged-in user ID:", userId);
    console.log("Logged-in user role:", userRole);
    console.log("Resource uploaded_by:", resource.uploaded_by.toString());

    if (
      resource.uploaded_by.toString() !== userId?.toString() &&
      userRole !== "head_counselor"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this resource.",
      });
    }

    await resource.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// In resourceController.js

export const updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { title, description, media_type, category, media_url: bodyMediaUrl } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    // Only uploader or head_counselor can update
    if (resource.uploaded_by.toString() !== userId && userRole !== "head_counselor") {
      return res.status(403).json({ success: false, message: "Not authorized to update this resource." });
    }

    // Update fields if provided
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (media_type) resource.media_type = media_type;
    if (category) resource.category = category;

    // Handle media_url update based on file upload or link
    if (req.file) {
      resource.media_url = `/uploads/resources/${req.file.filename}`;
    } else if (media_type === "link" && bodyMediaUrl) {
      resource.media_url = bodyMediaUrl;
    }

    await resource.save();

    res.status(200).json({ success: true, message: "Resource updated", resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

