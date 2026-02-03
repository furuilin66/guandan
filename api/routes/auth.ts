import { Router, type Request, type Response } from 'express'
import { db } from '../db.js';

const router = Router()

/**
 * Reset Database
 * POST /api/auth/reset
 */
router.post('/reset', async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body;
  
  if (password === 'hxyz@123456789') {
    db.resetDatabase();
    res.json({ success: true, message: 'Database reset successfully' });
  } else {
    res.status(403).json({ success: false, error: 'Invalid password' });
  }
})

export default router
