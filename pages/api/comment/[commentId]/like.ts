import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getCommentController } from 'server/factories/comment';

const authGuard = getAuthGuard();

const commentController = getCommentController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(authGuard.useAuth(), (req, res) => commentController.likeComment(req, res));

router.delete(authGuard.useAuth(), (req, res) => commentController.unlikeComment(req, res));

export default router.handler({ onError: errorHandler });
