const categoryModel = require("../models/category.model");
const departmentModel = require("../models/department.model");
const orgModel = require("../models/org.model");

exports.getAllCategories = async (req, res) => {
  try {
    const { deptId } = req.query;
    const filter = deptId ? { department: deptId } : {};
    const categories = await categoryModel
      .find(filter)
      .populate("department", "name")
      .lean();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

exports.getCategoriesOrgAdmin = async (req, res) => {
  try {
    const { deptId } = req.query;
    const userId = req.user._id;

    // Find the organization where the user is an admin
    const org = await orgModel.findOne({ admins: userId }).lean();
    if (!org) {
      return res.status(403).json({
        success: false,
        message: "You are not an admin of any organization.",
      });
    }

    // Find departments under this organization
    const orgDepartments = await departmentModel
      .find({ organization: org._id }, "_id")
      .lean();
    const deptIds = orgDepartments.map((d) => d._id.toString());

    // Build the filter for category fetch
    const filter = deptId
      ? { department: deptId }
      : { department: { $in: deptIds } };

    // Fetch categories belonging to those departments
    const categories = await categoryModel
      .find(filter)
      .populate("department", "name")
      .lean();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description, deptId } = req.body;

    if (!name || !description || !deptId) {
      return res
        .status(400)
        .json({ message: "Name, description and department ID are required" });
    }

    const newCategory = new categoryModel({
      name,
      description: description,
      department: deptId,
      status: "pending",
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category requested successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add category" + error.message,
      error: error.message,
    });
  }
};

exports.approveCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryModel.findById(categoryId);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const department = await departmentModel.findById(category.department);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    category.status = "approved";
    await category.save();

    if (!department.category.includes(category.name)) {
      department.category.push(category.name);
      await department.save();
    }

    res.status(200).json({
      success: true,
      message: "Category approved and linked to department",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve category" + error.message,
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryModel.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await departmentModel.updateMany(
      { category: category.name },
      { $pull: { category: category.name } }
    );

    await categoryModel.findByIdAndDelete(categoryId);

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
