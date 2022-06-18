import express from 'express';
import { authentification } from '../middlewares/auth';
import authRouter from './auth/auth-routes';
import logicRouter from './logic/logic-routes';
const router = express.Router();

router.use( '/auth', authRouter );
router.use( '/', authentification, logicRouter );

export default router;