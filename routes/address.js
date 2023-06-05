const express = require("express");
const address = require("../controllers/addressController");
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");

const router = express.Router();

router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  address.updateAddress
);

module.exports = router;
