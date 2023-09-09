import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { blogFields, exculdeFields, prisma, User, userFields } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { session } from 'middlewares/session';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { session: Session; auth: User }, NextApiResponse>();

router.use(auth(), session()).get(async (req, res) => {
  const authUser = req.auth;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const { isPublished } = req.query;

  const count = await prisma.blog.count({
    where: {
      authorId: authUser.id,
      title: {
        search,
      },
      isPublished: isPublished ? isPublished == 'true' : undefined,
    },
  });

  const blogs = await prisma.user
    .findUnique({
      where: {
        id: authUser.id,
      },
    })
    .blogs({
      where: {
        title: { search },
        isPublished: isPublished ? isPublished == 'true' : undefined,
      },
      select: {
        ...blogFields,
        author: {
          select: {
            ...exculdeFields(userFields, ['password', 'email']),
          },
        },
        likedBy: {
          where: {
            id: req.session.userId,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likedBy: true,
            comments: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        [sort]: order,
      },
    });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Blogs fetched', { data: blogs, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
