const express = require("express");
const multer = require("multer");
const controller = require("../controllers/contentController");

const router = express.Router();
const upload = multer();

router.get("/messages", controller.getMessages);
router.post("/messages", controller.createMessage);
router.put("/messages/:id/approve", controller.approveMessage);
router.delete("/messages/:id", controller.deleteMessage);

router.get("/reviews", controller.getReviews);
router.post("/reviews", controller.createReview);
router.delete("/reviews/:id", controller.deleteReview);
router.post("/reviews/import", upload.single("file"), controller.importReviewFromExcel);

module.exports = router;
