const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary if environment keys are present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @desc    Upload file or image
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // 1. Cloudinary upload if config exists
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'devora_ai_uploads',
        resource_type: 'auto',
      });

      // Cleanup local temp file
      fs.unlinkSync(filePath);

      return res.status(201).json({
        success: true,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        url: result.secure_url,
        preview: result.secure_url,
      });
    }

    // 2. Local fallback if Cloudinary is not configured
    // Read file as base64 to serve as direct preview link
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;

    // Cleanup local temp file
    fs.unlinkSync(filePath);

    res.status(201).json({
      success: true,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      url: dataUri,
      preview: dataUri,
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

module.exports = { uploadFile };
