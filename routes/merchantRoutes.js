const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const multer = require("multer");

// pakai memoryStorage untuk langsung ke buffer → Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Products
router.get("/products", merchantController.getProducts);
router.post("/products", upload.array("images", 5), merchantController.addProduct);
router.get("/products/:id", merchantController.getProductById);

// Orders
router.get("/orders", merchantController.getOrders);
router.post("/orders", merchantController.addOrder);

module.exports = router;
