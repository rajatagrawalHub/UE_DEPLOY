const express = require("express");
const router = express.Router();
const taxonomyController = require("../controller/taxonomy.controller");
const authenticateToken = require("../middleware/auth.middleware");

router.get("/", authenticateToken, taxonomyController.getFullTaxonomy);

module.exports = router;
