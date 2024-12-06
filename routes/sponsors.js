const express = require("express");
const middleware = require("../middleware/auth");
const Sponsors = require("../controllers/sponsorContollers.js");
const upload = require("../middleware/multer");
const router = express.Router();
//
//get all grade of the same company
router.get(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  Sponsors.getAllSponsors
);

router.get(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  Sponsors.getOneSponsors
);
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "referenceLetter", maxCount: 1 },
  ]),

  Sponsors.createSponsors
);

router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  Sponsors.updateSponsor
);
router.delete(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  Sponsors.deleteSponsor
);
module.exports = router;
