import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthController } from 'server/factories/auth';

const authController = getAuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post((req, res) => authController.register(req, res));

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
