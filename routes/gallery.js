const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');

const cloudinary = require('../utils/cloudinary');
const galleryController = require('../controllers/galleryController');

const upload = multer();

router.post('/upload', upload.single('image'), async (req, res) => {
  const folder = req.body.folder || 'gallery';
  const uniqueName = `${folder}_${Date.now()}`;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: uniqueName, resource_type: 'image' },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    await galleryController.createGalleryManual({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      folder: folder
    });

    res.status(201).json({
      message: 'Gambar berhasil diupload dan disimpan',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      folder: folder
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Gagal upload dan simpan galeri' });
  }
});

router.post('/', galleryController.createGallery);
router.get('/', galleryController.getAllGallery);
router.delete('/:id', galleryController.deleteGallery);

module.exports = router;
