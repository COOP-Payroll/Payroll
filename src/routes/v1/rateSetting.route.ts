import express from "express";
import rateSettingController from "../../controllers/rateSetting.controller";
import validate from "../../middlewares/validate";
import rateSettingValidation from "../../validations/rateSetting.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth(),
  // validate(rateSettingValidation.createRateSetting),
  rateSettingController.createRateSetting
);
router.get("/", auth(), rateSettingController.getAllRateSettings);

router
  .route("/:id")
  .get(rateSettingController.getRateSettingByCompanyId)
  .post(auth(), rateSettingController.updateRateSetting);

export default router;
