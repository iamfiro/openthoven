import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getSongs, uploadSong, searchSong } from '../controllers/songs.controller';

const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'audio/midi' || file.originalname.endsWith('.mid') || file.originalname.endsWith('.midi')) {
      cb(null, true);
    } else {
      cb(new Error('MIDI 파일만 업로드 가능합니다.'));
    }
  },
});

const router = Router();

router.get('/', getSongs);
router.post('/upload', upload.single('midi'), uploadSong);
router.post('/search', searchSong);

export default router;
