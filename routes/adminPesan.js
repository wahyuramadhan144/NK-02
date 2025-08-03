const express = require("express");
const router = express.Router();
const multer = require("multer");
const adminPesanController = require("../controllers/adminPesanController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/import-review-excel', upload.single('file'), adminPesanController.importReviewFromExcel);

router.get("/review-vc", adminPesanController.getReviews);
router.post("/review-vc", adminPesanController.createReview);
router.delete("/review-vc/:id", adminPesanController.deleteReview);

router.get("/fans-message", adminPesanController.getMessages);
router.post("/fans-message", adminPesanController.createMessage);
router.put("/fans-message/approve/:id", adminPesanController.approveMessage);
router.delete("/fans-message/:id", adminPesanController.deleteMessage);

module.exports = router;
