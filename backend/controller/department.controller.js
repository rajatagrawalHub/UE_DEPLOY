const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const orgModel = require("../models/org.model");
const userModel = require("../models/user.model");
const departmentModel = require("../models/department.model");

// CREATE Department
exports.create = async (req, res) => {
  try {
    const { name, type, description, orgId } = req.body;
    const loggedInUser = req.user;

    // Verify org and access
    const organization = await orgModel.findOne({
      _id: orgId,
      admins: loggedInUser._id,
    });

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found or access denied",
      });
    }

    // Check duplicate department
    const existingDept = await departmentModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      organization: orgId,
    });

    if (existingDept) {
      return res.status(400).json({
        message: "Department with this name already exists",
      });
    }

    // Create new department
    const newDepartment = new departmentModel({
      name,
      type,
      description,
      organization: orgId,
      createdBy: loggedInUser._id,
    });

    const savedDepartment = await newDepartment.save();

    // Push department to org
    await orgModel.findByIdAndUpdate(orgId, {
      $push: { departments: savedDepartment._id },
    });

    res.status(201).json({
      message: "Department created successfully",
      department: savedDepartment,
    });
  } catch (error) {
    console.error("Department Creation Error:", error);
    res.status(500).json({
      message: "Failed to create department",
      error: error.message,
    });
  }
};

// EDIT Department
exports.edit = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { name, type, description, adminId } = req.body;

    const department = await departmentModel.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Prevent duplicate name
    if (name) {
      const duplicate = await departmentModel.findOne({
        _id: { $ne: deptId },
        organization: department.organization,
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (duplicate) {
        return res.status(400).json({
          message: "Another department with this name already exists",
        });
      }
    }

    // Update fields
    const updated = await departmentModel.findByIdAndUpdate(
      deptId,
      {
        ...(name && { name }),
        ...(type && { type }),
        ...(description && { description }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Department updated successfully",
      department: updated,
    });
  } catch (error) {
    console.error("Department Update Error:", error);
    res.status(500).json({
      message: "Failed to update department",
      error: error.message,
    });
  }
};

// DELETE Department
exports.delete = async (req, res) => {
  try {
    const { deptId } = req.params;

    const department = await departmentModel.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await orgModel.findByIdAndUpdate(department.organization, {
      $pull: { departments: deptId },
    });

    const users = await userModel.find({ departments: deptId });

    const updateUsers = users.map(async (user) => {
      user.departments = user.departments.filter(
        (id) => id.toString() !== deptId
      );
      if (user.departments.length === 0) {
        user.roles = user.roles.filter((r) => r !== "Departmental Admin");
      }
      return user.save();
    });

    await Promise.all(updateUsers);
    await departmentModel.findByIdAndDelete(deptId);

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Department Deletion Error:", error);
    res.status(500).json({
      message: "Failed to delete department",
      error: error.message,
    });
  }
};

// GET All Departments (with optional org filter)
exports.getAllDepartments = async (req, res) => {
  try {
    const { orgId } = req.query;
    const filter = orgId ? { organization: orgId } : {};

    const departments = await departmentModel
      .find(filter)
      .populate("admins", "email")
      .lean();
    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

// ASSIGN Admin to Department
exports.assignAdmin = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { adminEmail } = req.body;

    const department = await departmentModel.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const user = await userModel.findOne({ email: adminEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.findByIdAndUpdate(user._id, {
      $addToSet: {
        roles: "Departmental Admin",
        departments: deptId,
      },
    });

    await departmentModel.findByIdAndUpdate(deptId, {
      $addToSet: { admins: user._id },
    });

    res.status(200).json({
      success: true,
      message: "Admin assigned successfully",
    });
  } catch (error) {
    console.error("Assign Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign admin",
      error: error.message,
    });
  }
};

// ADD USERS to Department
exports.addUsers = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { userEmails } = req.body;

    if (!Array.isArray(userEmails) || userEmails.length === 0) {
      return res.status(400).json({ message: "No user emails provided" });
    }

    const department = await departmentModel
      .findById(deptId)
      .populate("organization", "members memberDomain")
      .populate("members", "email");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const org = department.organization;

    const users = await userModel.find({ email: { $in: userEmails } });
    const foundEmails = users.map((u) => u.email);
    const notFound = userEmails.filter((e) => !foundEmails.includes(e));

    const invalid = users.filter((u) => !org.members.includes(u._id));
    const alreadyInDept = users.filter((u) =>
      department.members.some((m) => m._id.equals(u._id))
    );

    if (invalid.length > 0) {
      return res.status(400).json({
        message: "Some users are not in the organization",
        invalidUsers: invalid.map((u) => u.email),
      });
    }

    const toAdd = users.filter(
      (u) => !department.members.some((m) => m._id.equals(u._id))
    );

    await departmentModel.findByIdAndUpdate(deptId, {
      $addToSet: { members: { $each: toAdd.map((u) => u._id) } },
    });

    const updateUserPromises = toAdd.map((u) =>
      userModel.findByIdAndUpdate(u._id, {
        $addToSet: { departments: deptId },
      })
    );
    await Promise.all(updateUserPromises);

    res.status(200).json({
      message: "Users added to department",
      addedUsers: toAdd.map((u) => u.email),
      notFound,
    });
  } catch (error) {
    console.error("Add Users Error:", error);
    res.status(500).json({
      message: "Failed to add users",
      error: error.message,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { deptId } = req.params;
    const userId = req.user._id;

    const department = await departmentModel
      .findById(deptId)
      .populate("organization");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (!department.organization.admins.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Access denied to this department" });
    }

    res.status(200).json({ department });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch department", error: error.message });
  }
};

// POST /department/:deptId/replace-admin
exports.replaceAdmin = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { oldAdminId, newEmail } = req.body;

    const department = await departmentModel.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const newAdmin = await userModel.findOne({ email: newEmail });
    if (!newAdmin) {
      return res.status(404).json({ message: "New user not found" });
    }

    // 1. Remove old admin from department
    department.admins = department.admins.filter(
      (adminId) => adminId.toString() !== oldAdminId
    );
    await department.save();

    // 2. Remove department from old admin's list
    const oldAdmin = await userModel.findById(oldAdminId);
    if (oldAdmin) {
      oldAdmin.departments = oldAdmin.departments.filter(
        (d) => d.toString() !== deptId
      );

      // Remove Departmental Admin role if they have no departments left
      if (oldAdmin.departments.length === 0) {
        oldAdmin.roles = oldAdmin.roles.filter((role) => role !== "Departmental Admin");
      }

      await oldAdmin.save();
    }

    // 3. Add department to new admin and assign role
    await userModel.findByIdAndUpdate(newAdmin._id, {
      $addToSet: {
        departments: deptId,
        roles: "Departmental Admin",
      },
    });

    // 4. Add new admin to department
    await departmentModel.findByIdAndUpdate(deptId, {
      $addToSet: { admins: newAdmin._id },
    });

    res.status(200).json({ success: true, message: "Admin replaced successfully" });
  } catch (error) {
    console.error("Replace Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to replace admin",
      error: error.message,
    });
  }
};

exports.getDepartmentsByAdmin = async (req, res) => {
  try {
    const userId = req.user._id;

    const departments = await departmentModel
      .find({ admins: userId })
      .populate("organization", "name")
      .select("name type organization");

    res.status(200).json({
      success: true,
      message: "Departments fetched where user is admin",
      departments,
    });
  } catch (error) {
    console.error("Error fetching admin departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments by admin",
      error: error.message,
    });
  }
};

exports.getCollaborationDepartments = async (req, res) => {
  try {
    const { deptId } = req.params;

    const currentDept = await departmentModel.findById(deptId);
    if (!currentDept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const allDepartments = await departmentModel.find({
      _id: { $ne: deptId },
    }).populate("organization", "name");

    const internal = [];
    const external = [];

    allDepartments.forEach((dept) => {
      if (dept.organization._id.toString() === currentDept.organization._id.toString()) {
        internal.push(dept);
      } else {
        external.push(dept);
      }
    });

    res.status(200).json({
      departments:
        req.query.mode === "external"
          ? external
          : req.query.mode === "internal"
          ? internal
          : [...internal, ...external],
    });
  } catch (err) {
    console.error("Error fetching collaboration departments", err);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

