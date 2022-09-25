import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import withAuth from '../../../../middleware/withAuth';
import { IAuth } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import { IBookmarks } from '../../../../interface/blog';

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth,
  res: NextApiResponse<IBookmarks | IMessage>
) => {
  const {
    method,
    query: { sort, pageSize, genre },
    auth: { bookmarks },
  } = req;

  switch (method) {
    case 'GET':
      let query = { blogs: bookmarks, isPublished: true };

      if (genre) query = Object.assign({ genre }, query);

      try {
        return res.status(200).json({
          bookmarks: await Blog.find(query)
            .sort({ [sort as string]: -1 })
            .limit(Number(pageSize) || 20),
          message: 'Blogs Fetched Successfully',
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(handler);