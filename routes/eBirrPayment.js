const express = require("express");
const e_birr = require("../controllers/eBirrPayment.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.post(
  "/eBirrPayment",
  //   middleware.protectAll,
  //   middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  e_birr.EbirrPayment
);
router.post(
  "/chappa",

  e_birr.ChapaPayment
);

module.exports = router;
