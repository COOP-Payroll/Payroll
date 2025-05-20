import express from "express";
import rateSettingController from "../../controllers/rateSetting.controller";
import validate from "../../middlewares/validate";
import rateSettingValidation from "../../validations/rateSetting.validation";

const router = express.Router();

router.post(
  "/",
 // validate(rateSettingValidation.createRateSetting),
  rateSettingController.createRateSetting
);
router.get("/", rateSettingController.getAllRateSettings);

router
  .route("/:companyId")
  .get(rateSettingController.getRateSettingByCompanyId)
  .post(rateSettingController.updateRateSetting);

export default router;
