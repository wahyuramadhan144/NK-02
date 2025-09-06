const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const axios = require("axios");

const addCustomerToVendor = async (customerData) => {
  try {
    const response = await axios.post(
      "https://v2.jkt48connect.com/api/nayrakuen/customer-input",
      {
        username: "vzy",
        password: "vzy",
        nama: customerData.name,
        alamat: customerData.address,
        nomor_hp: customerData.phone,
        email: customerData.email,
        harga: customerData.price,
        product: customerData.product || "Produk Default",
        member: customerData.member || "no",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding customer to vendor:", error.message);
    throw error;
  }
};

exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM merchant_products ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error getProducts:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    let imageUrl = null;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "merchant_products",
        use_filename: true,
        unique_filename: false,
        resource_type: "image",
      });

      imageUrl = uploadResult.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const result = await pool.query(
      `INSERT INTO merchant_products (name, price, description, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, price, description || null, imageUrl]
    );

    res.status(201).json({
      message: "Product added",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Error addProduct:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM merchant_products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error getProductById:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.customer_name, o.quantity, o.created_at,
              p.name AS product_name, p.price, p.description, p.image_url
       FROM merchant_orders o
       JOIN merchant_products p ON o.product_id = p.id
       ORDER BY o.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error getOrders:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addOrder = async (req, res) => {
  const { product_id, customer_name, quantity, address, phone, email } = req.body;
  try {
    if (!product_id || !customer_name || !quantity) {
      return res.status(400).json({
        error: "product_id, customer_name, and quantity are required",
      });
    }

    const productResult = await pool.query(
      "SELECT * FROM merchant_products WHERE id = $1",
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const product = productResult.rows[0];

    const result = await pool.query(
      `INSERT INTO merchant_orders (product_id, customer_name, quantity)
       VALUES ($1, $2, $3) RETURNING *`,
      [product_id, customer_name, quantity]
    );

    const order = result.rows[0];

    const totalPrice = product.price * quantity;

    const vendorResponse = await addCustomerToVendor({
      name: customer_name,
      address: address || "Alamat belum diisi",
      phone: phone || "-",
      email: email || "-",
      price: totalPrice,
      product: product.name,
      member: "no",
    });

    res.status(201).json({
      message: "Order placed & synced with vendor",
      order,
      vendorResponse,
    });
  } catch (err) {
    console.error("Error addOrder:", err);
    res.status(500).json({ error: err.message });
  }
};
