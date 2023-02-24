import { Router } from 'express';
import auth from './auth';
import user from './user';
import blog from './blog';
import security from './security';
import notification from './notification';

const router = Router();

router.use('/auth', auth);

router.use('/user', user);

router.use('/blog', blog);

router.use('/security', security);

router.use('/notification', notification);

export default router;