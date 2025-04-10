const express = require("express");
const router = express.Router();
const controller = require("../controllers/perdiemControllers");
// const middleware = require("../middleware/auth");
const middleware = require("../middleware/auth");
// router.use(middleware.protect); // if needed

router.get("/", middleware.protectAll, controller.getAllPerDiem);

router.get(
  "/currentmonth",
  middleware.protectAll,
  controller.getAllPerDiemCurrentMonth
);

router.get(
  "/currentyear",
  middleware.protectAll,
  controller.getAllPerDiemCurrentYear
);
router.get("/:id", middleware.protectAll, controller.getPerDiemById);
router.post("/", middleware.protectAll, controller.createPerDiem);
router.put("/:id", middleware.protectAll, controller.updatePerDiem);
router.delete("/:id", middleware.protectAll, controller.deletePerDiem);

module.exports = router;
