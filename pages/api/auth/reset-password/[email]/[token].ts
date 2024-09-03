import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthController } from 'server/factories/auth';

const authController = getAuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(authController.resetPassword);

export default router.handler({ onError: errorHandler });