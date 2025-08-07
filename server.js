const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { deleteAdminUser } = require('./admin-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload folders exist
const uploadBaseDir = path.join(__dirname, 'uploads');
const filesDir = path.join(uploadBaseDir, 'files');
const certificatesDir = path.join(uploadBaseDir, 'certificates');
fs.ensureDirSync(filesDir);
fs.ensureDirSync(certificatesDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isCertificate = req.path.includes('certificate');
    const targetDir = isCertificate ? certificatesDir : filesDir;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
    cb(isValid ? null : new Error('Invalid file type'), isValid);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

// Delete admin endpoint
app.delete('/api/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    if (!adminId) {
      return res.status(400).json({ error: 'Admin ID is required' });
    }
    
    const result = await deleteAdminUser(adminId);
    res.json(result);
  } catch (error) {
    console.error('Error in delete admin endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to delete admin', 
      message: error.message 
    });
  }
});

// Upload certificate
app.post('/api/upload/certificate', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({
    success: true,
    message: 'Certificate uploaded successfully',
    file: {
      name: req.file.originalname,
      path: `/uploads/certificates/${req.file.filename}`,
      url: `/api/files/certificates/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    }
  });
});

// Upload general file
app.post('/api/upload/file', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      name: req.file.originalname,
      path: `/uploads/files/${req.file.filename}`,
      url: `/api/files/files/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    }
  });
});

// Serve files (preview)
app.get('/api/files/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const filePath = path.join(uploadBaseDir, category, filename);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filePath);
});

// Download files
app.get('/api/download/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const filePath = path.join(uploadBaseDir, category, filename);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Files uploaded to: ${uploadBaseDir}`);
});
