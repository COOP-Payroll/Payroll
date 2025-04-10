const express = require("express");
const router = express.Router();
const controller = require("../controllers/dailyrateControllers.js");
// const middleware = require("../middleware/auth");
const middleware = require("../middleware/auth");
// router.use(middleware.protect); // if needed

router.get("/", middleware.protectAll, controller.getAllPerDiemRates);
router.get("/:id", middleware.protectAll, controller.getPerDiemRateById);
router.post("/", middleware.protectAll, controller.createPerDiemRate);
router.put("/:id", middleware.protectAll, controller.updatePerDiemRate);
router.delete("/:id", middleware.protectAll, controller.deletePerDiemRate);

module.exports = router;
