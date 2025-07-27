const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');

const cloudinary = require('../utils/cloudinary');
const galleryController = require('../controllers/galleryController');

const upload = multer();

router.post('/upload', upload.single('image'), (req, res) => {
  const folder = req.body.folder || 'gallery';
  const uniqueName = `${folder}_${Date.now()}`;

  const stream = cloudinary.uploader.upload_stream(
    { folder, public_id: uniqueName, resource_type: 'image' },
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        imageUrl: result.secure_url,
        publicId: result.public_id,
        folder: folder,
      });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

router.post('/', galleryController.createGallery);
router.get('/', galleryController.getAllGallery);
router.delete('/:id', galleryController.deleteGallery);

module.exports = router;
