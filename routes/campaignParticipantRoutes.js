const express = require("express");
const router = express.Router();
const campaignParticipantController = require("../controllers/campaignParticipantController");
const upload = require("../middleware/multer");
const middleware = require("../middleware/auth.js");
router.post("/", campaignParticipantController.createParticipant);
router.get(
  "/download-excel",
  middleware.protectAll,
  campaignParticipantController.downloadExcel
);
// router.get(
//   "/:id",
//   middleware.protectAll,
//   campaignParticipantController.getParticipantById
// );
router.post(
  "/upload-excel",
  middleware.protectAll,
  upload.fields([{ name: "file", maxCount: 1 }]),
  campaignParticipantController.bulkRegisterFromExcel
);
router.get(
  "/campaign/:campaignId",
  middleware.protectAll,
  campaignParticipantController.getAllParticipants
);

router.put(
  "/update",
  middleware.protectAll,
  campaignParticipantController.updateParticipant
);
router.put(
  "/verify",
  middleware.protectAll,
  campaignParticipantController.verifyParticipant
);
router.delete("", campaignParticipantController.deleteParticipant);

module.exports = router;
