const express = require("express");
const router = express.Router();
const campaignParticipantController = require("../controllers/campaignParticipantController");
const upload = require("../middleware/multer");
const middleware = require("../middleware/auth.js");
router.post(
  "/",
  middleware.protectAll,
  campaignParticipantController.createParticipant
);
router.get(
  "/download-excel",

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
  "/",
  middleware.protectAll,
  campaignParticipantController.getAllParticipants
);

router.post(
  "/update",
  middleware.protectAll,
  campaignParticipantController.updateParticipant
);
router.post(
  "/verify",
  middleware.protectAll,
  campaignParticipantController.verifyParticipant
);
router.delete(
  "",
  middleware.protectAll,
  campaignParticipantController.deleteParticipant
);

router.post(
  "/:campaignId/assignParticipants",
  middleware.protectAll,
  campaignParticipantController.assignParticipants
);

router.get(
  "/:campaignId/assignParticipants",
  middleware.protectAll,
  campaignParticipantController.getAssignedParticipants
);

router.get(
  "/:campaignId/unassignedParticipants",
  middleware.protectAll,
  campaignParticipantController.getUnassignedParticipants
);
router.post(
  "/publish",
  middleware.protectAll,
  campaignParticipantController.publishParticipants
);

router.post(
  "/detach-participants",

  middleware.protectAll,
  campaignParticipantController.detachParticipants
);
router.post(
  "/approval-status",
  middleware.protectAll,
  campaignParticipantController.updateApprovalStatus
);

router.get(
  "/published",
  middleware.protectAll,
  campaignParticipantController.getAllParticipantsPublished
);

router.get(
  "/approved",
  middleware.protectAll,
  campaignParticipantController.getAllParticipantsApproved
);
router.post(
  "/updatePaymentStatus",
  middleware.protectAll,
  campaignParticipantController.updatePaymentStatus
);

module.exports = router;
