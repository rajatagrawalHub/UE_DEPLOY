const Organization = require("../models/org.model");
const Department = require("../models/department.model");
const Category = require("../models/category.model");
const Event = require("../models/event.model");
const Type = require("../models/types.model");

exports.getFullTaxonomy = async (req, res) => {
  try {
    const organizations = await Organization.find().lean();
    const types = await Type.find().lean();
    const departments = await Department.find().lean();
    const categories = await Category.find().lean();
    const events = await Event.find({
      approvalStatus: { $in: ["Approved", "Freezed"] },
    }).lean();

    const taxonomy = organizations.map((org) => {
      const orgTypes = types.filter(
        (type) => type.organization?.toString() === org._id.toString()
      );

      const typeData = orgTypes.map((type) => {
        const typeDepartments = departments.filter(
          (dept) =>
            dept.organization?.toString() === org._id.toString() &&
            dept.type === type.name
        );

        const departmentData = typeDepartments.map((dept) => {
          const deptCategories = categories.filter(
            (cat) => cat.department?.toString() === dept._id.toString()
          );

          const categoryData = deptCategories.map((cat) => {
            const catEvents = events.filter(
              (evt) =>
                evt.department?.toString() === dept._id.toString() &&
                evt.category === cat.name
            );

            return {
              ...cat,
              events: catEvents,
            };
          });

          return {
            ...dept,
            categories: categoryData,
          };
        });

        return {
          ...type,
          departments: departmentData,
        };
      });

      return {
        ...org,
        types: typeData,
      };
    });

    res.status(200).json({ taxonomy });
  } catch (err) {
    console.error("Full Taxonomy Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch full taxonomy data." });
  }
};
