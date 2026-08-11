import { Router } from 'express';
import multer from 'multer';
import { uploadSample, analyzeSample, getSample } from '../controllers/sample.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

router.post('/upload', requireAuth, requireRole('PATIENT'), upload.single('image'), uploadSample);
router.post('/:id/analyze', requireAuth, requireRole('PATIENT'), analyzeSample);
router.get('/:id', requireAuth, getSample);

export default router;
