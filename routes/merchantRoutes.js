const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");

router.get("/products", merchantController.getProducts);
router.post("/products", merchantController.addProduct);

router.get("/orders", merchantController.getOrders);
router.post("/orders", merchantController.addOrder);

module.exports = router;
