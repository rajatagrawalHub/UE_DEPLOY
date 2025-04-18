const orgModel = require("../models/org.model");
const typeModel = require("../models/types.model");

// Fetch all types
exports.getAllTypes = async (req, res) => {
  try {
    const types = await typeModel.find().populate("organization", "name") // 👈 populate name from org
    .lean();
    res.status(200).json({
      success: true,
      message: "Types fetched successfully",
      types,
    });
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch types",
      error: error.message,
    });
  }
};

exports.addType = async (req, res) => {
  try {
    const { name, description,orgId } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    // Create a new type
    const newType = new typeModel({
      name,
      description,
      status: "pending",
      organization: orgId
    });

    await newType.save();

    res.status(201).json({
      success: true,
      message: "Type added successfully",
      type: newType,
    });
  } catch (error) {
    console.error("Error adding type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add type",
      error: error.message,
    });
  }
};

// Approve a type
exports.approveType = async (req, res) => {
  try {
    const { typeId } = req.params;
    const { orgId } = req.body;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required to approve the type",
      });
    }

    const type = await typeModel.findById(typeId);
    if (!type) {
      return res.status(404).json({
        success: false,
        message: "Type not found",
      });
    }

    const organization = await orgModel.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Approve type only if not already approved
    if (type.status !== "approved") {
      type.status = "approved";
      await type.save();
    }

    // Link the type to the organization only if not already linked
    if (!organization.types.includes(type.name)) {
      organization.types.push(type.name);
      await organization.save();
    }

    res.status(200).json({
      success: true,
      message: "Type approved and linked to organization successfully",
      type,
    });
  } catch (error) {
    console.error("Error approving type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve type",
      error: error.message,
    });
  }
};

// Delete a type
exports.deleteType = async (req, res) => {
  try {
    const { typeId } = req.params;

    const type = await typeModel.findById(typeId);
    if (!type) {
      return res.status(404).json({
        success: false,
        message: "Type not found",
      });
    }

    // Remove the type from all organizations
    await orgModel.updateMany(
      { types: type.name },
      { $pull: { types: type.name } }
    );

    // Delete the type itself
    await typeModel.findByIdAndDelete(typeId);

    res.status(200).json({
      success: true,
      message: "Type deleted and removed from all organizations",
    });
  } catch (error) {
    console.error("Error deleting type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete type",
      error: error.message,
    });
  }
};

