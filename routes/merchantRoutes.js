const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.get("/products", merchantController.getProducts);
router.post("/products", upload.single("image"), merchantController.addProduct);
router.get("/products/:id", merchantController.getProductById);

router.get("/orders", merchantController.getOrders);
router.post("/orders", merchantController.addOrder);

module.exports = router;
