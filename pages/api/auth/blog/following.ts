import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { blogFields, exculdeFields, prisma, User, userFields } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).get(async (req, res) => {
  const authUser = req.auth;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.blog.count({
    where: {
      author: {
        followedBy: {
          some: {
            id: authUser.id,
          },
        },
      },
      title: {
        search,
      },
      isPublished: true,
    },
  });

  const blogs = await prisma.blog.findMany({
    where: {
      author: {
        followedBy: {
          some: {
            id: authUser.id,
          },
        },
      },
      title: {
        search,
      },
      isPublished: true,
    },
    select: {
      ...blogFields,
      author: {
        select: {
          ...exculdeFields(userFields, ['password', 'email']),
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
