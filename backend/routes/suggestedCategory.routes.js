const express = require("express");
const router = express.Router();
const categoryController = require("../controller/suggestCategory.controller");

router.post("/suggest-category", categoryController.suggestCategory);

module.exports = router;
