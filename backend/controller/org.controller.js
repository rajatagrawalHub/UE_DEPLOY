const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const orgModel = require("../models/org.model");
const userModel = require("../models/user.model");
const departmentModel = require("../models/department.model");

exports.create = async (req, res) => {
  try {
    const {
      name,
      email,
      type,
      address,
      city,
      state,
      poc,
      contact,
      memberDomain, // This will be a string
    } = req.body;

    // Validate member domain format if provided
    if (memberDomain && !memberDomain.startsWith("@")) {
      return res.status(400).json({
        message: "Member domain must start with '@' symbol",
      });
    }

    // Check if organization already exists with same name, email or domain
    const existingOrg = await orgModel.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { email: email.toLowerCase() },
      ],
    });

    if (existingOrg) {
      return res.status(400).json({
        message: "Organization with this name, email or domain already exists",
        duplicate:
          existingOrg.name === name
            ? "name"
            : existingOrg.email === email.toLowerCase()
            ? "email"
            : "domain",
      });
    }

    // Create new organization
    const newOrg = new orgModel({
      name,
      email: email.toLowerCase(),
      type,
      address,
      city,
      state,
      poc,
      contact,
      memberDomain: memberDomain || [], // Will be empty array if not provided
      createdBy: req.user._id,
    });

    // Save the organization
    const savedOrg = await newOrg.save();

    res.status(201).json({
      message: "Organization created successfully",
      organization: savedOrg,
    });
  } catch (error) {
    console.error("Organization Creation Error:", error);
    res.status(500).json({
      message: "Failed to create organization",
      error: error.message,
    });
  }
};

exports.edit = async (req, res) => {
  try {
    const { orgId } = req.params;
    const updateData = {
      name: req.body.name,
      email: req.body.email?.toLowerCase(),
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      poc: req.body.poc,
      contact: req.body.contact,
    };


    // Check if organization exists
    const organization = await orgModel.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    // Check if new name, email or domain conflicts with existing organizations
    if (updateData.name || updateData.email || updateData.memberDomain) {
      const existingOrg = await orgModel.findOne({
        _id: { $ne: orgId },
        $or: [
          updateData.name
            ? { name: { $regex: new RegExp(`^${updateData.name}$`, "i") } }
            : null,
          updateData.email ? { email: updateData.email } : null,
          updateData.memberDomain
            ? { memberDomain: updateData.memberDomain }
            : null,
        ].filter(Boolean),
      });

      if (existingOrg) {
        return res.status(400).json({
          message:
            "Organization with this name, email or domain already exists",
          duplicate:
            existingOrg.name === updateData.name
              ? "name"
              : existingOrg.email === updateData.email
              ? "email"
              : "domain",
        });
      }
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Update organization
    const updatedOrg = await orgModel.findByIdAndUpdate(
      orgId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Organization updated successfully",
      organization: updatedOrg,
    });
  } catch (error) {
    console.error("Organization Update Error:", error);
    res.status(500).json({
      message: "Failed to update organization",
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Check if organization exists
    const organization = await orgModel.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    // Find all users associated with this organization
    const usersToUpdate = await userModel.find({ organizations: orgId });

    // Update each user's organizations and roles
    const userUpdatePromises = usersToUpdate.map(async (user) => {
      return userModel.findByIdAndUpdate(
        user._id,
        {
          $pull: { organizations: orgId },
          ...(user.organizations.length === 1 && {
            $set: { roles: ["User"] },
          }),
        },
        { new: true }
      );
    });

    // Wait for all user updates to complete
    await Promise.all(userUpdatePromises);

    // Delete the organization
    await orgModel.findByIdAndDelete(orgId);

    res.status(200).json({
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Organization Deletion Error:", error);
    res.status(500).json({
      message: "Failed to delete organization",
      error: error.message,
    });
  }
};

exports.addUsers = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { userEmails } = req.body;

    // Validate input
    if (!Array.isArray(userEmails) || userEmails.length === 0) {
      return res.status(400).json({
        message: "Please provide an array of user emails",
      });
    }

    // Find organization
    const organization = await orgModel
      .findById(orgId)
      .populate("members", "email");

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    // Only validate domain if memberDomain exists and is not empty
    if (organization.memberDomain && organization.memberDomain.length > 0) {
      const validDomains = organization.memberDomain;
      const invalidEmails = userEmails.filter((email) => {
        const domain = email.substring(email.lastIndexOf("@"));
        return !validDomains.includes(domain);
      });

      if (invalidEmails.length > 0) {
        return res.status(400).json({
          message: "Some emails don't match organization's allowed domains",
          invalidEmails,
        });
      }
    }

    // Find existing users and identify new emails
    const existingUsers = await userModel.find({
      email: { $in: userEmails },
    });

    const existingEmails = existingUsers.map((user) => user.email);
    const nonExistentEmails = userEmails.filter(
      (email) => !existingEmails.includes(email)
    );

    // Check for users already in organization
    const alreadyMembers = existingUsers.filter((user) =>
      organization.members.some((member) => member._id.equals(user._id))
    );

    if (alreadyMembers.length > 0) {
      return res.status(400).json({
        message: "Some users are already members of the organization",
        alreadyMembers: alreadyMembers.map((user) => user.email),
      });
    }

    // Update organization and users
    const userUpdatePromises = existingUsers.map((user) =>
      userModel.findByIdAndUpdate(
        user._id,
        {
          $addToSet: {
            organizations: orgId,
            roles: "Member",
          },
        },
        { new: true }
      )
    );

    // Update organization with new members
    const updatedOrg = await orgModel
      .findByIdAndUpdate(
        orgId,
        {
          $addToSet: {
            members: { $each: existingUsers.map((user) => user._id) },
          },
        },
        { new: true }
      )
      .populate("members", "email name");

    // Wait for all updates to complete
    await Promise.all(userUpdatePromises);

    res.status(200).json({
      message: "Users added successfully",
      addedUsers: existingEmails,
      nonExistentUsers: nonExistentEmails,
      organization: updatedOrg,
    });
  } catch (error) {
    console.error("Add Users Error:", error);
    res.status(500).json({
      message: "Failed to add users to organization",
      error: error.message,
    });
  }
};

exports.getAllOrganizations = async (req, res) => {
  try {
    // Fetch all organizations
    const organizations = await orgModel
      .find()
      .populate("admins", "name email")
      .populate("members", "name email")
      .populate("departments", "name type")
      .select("-__v"); // Exclude unnecessary fields like __v

    res.status(200).json({
      success: true,
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    console.error("Get All Organizations Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizations",
      error: error.message,
    });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const { orgId } = req.params;
    const organization = await orgModel.findById(orgId);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({ organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: "Failed to fetch organization" });
  }
};

exports.assignOrgAdminByName = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Organization name and user email are required",
      });
    }

    // Find the organization by name (case-insensitive)
    const organization = await orgModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user is already an admin for the organization
    if (organization.admins.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already an admin for this organization",
      });
    }

    // Assign the user as an admin for the organization
    organization.admins.push(user._id);
    await organization.save();

    // Update the user's roles and organizations
    if (!user.roles.includes("Organization Admin")) {
      user.roles.push("Organization Admin");
    }
    if (!user.organizations.includes(organization._id)) {
      user.organizations.push(organization._id);
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "User assigned as organization admin successfully",
      organization,
    });
  } catch (error) {
    console.error("Assign Org Admin by Name Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign organization admin",
      error: error.message,
    });
  }
};
exports.editAdmin = async (req, res) => {
  try {
    const { orgId, adminId, newEmail } = req.body;

    if (!orgId || !adminId || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Organization ID, Admin ID, and new email are required",
      });
    }

    const organization = await orgModel.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const currentAdmin = await userModel.findById(adminId);
    if (!currentAdmin) {
      return res.status(404).json({
        success: false,
        message: "Current admin user not found",
      });
    }

    // Remove current admin from organization.admins
    organization.admins = organization.admins.filter(
      (id) => id.toString() !== adminId
    );

    await organization.save();

    // Remove organization from user's organizations list
    currentAdmin.organizations = currentAdmin.organizations.filter(
      (id) => id.toString() !== orgId
    );

    // Check if user is still an admin in any organization
    const isStillAdmin = await orgModel.exists({
      admins: currentAdmin._id,
    });

    if (!isStillAdmin) {
      // Remove 'Organization Admin' role if not admin in any org
      currentAdmin.roles = currentAdmin.roles.filter(
        (role) => role !== "Organization Admin"
      );
    }

    await currentAdmin.save();

    // Handle new email user
    const newEmailLower = newEmail.toLowerCase();
    let newAdmin = await userModel.findOne({ email: newEmailLower });

    if (!newAdmin) {
      return res.status(404).json({
        success: false,
        message: "New email user not found",
      });
    }

    // Assign new admin to the organization
    if (!organization.admins.includes(newAdmin._id)) {
      organization.admins.push(newAdmin._id);
    }

    await organization.save();

    if (!newAdmin.organizations.includes(organization._id)) {
      newAdmin.organizations.push(organization._id);
    }

    if (!newAdmin.roles.includes("Organization Admin")) {
      newAdmin.roles.push("Organization Admin");
    }

    await newAdmin.save();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      oldAdmin: currentAdmin.email,
      newAdmin: newAdmin.email,
      organization,
    });
  } catch (error) {
    console.error("Edit Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error.message,
    });
  }
};
