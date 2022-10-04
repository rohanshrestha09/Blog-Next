import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import { IAuth } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import { IBookmarks } from '../../../../interface/blog';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth,
  res: NextApiResponse<IBookmarks | IMessage>
) => {
  const {
    method,
    query: { pageSize, genre, search },
    auth: { bookmarks },
  } = req;

  switch (method) {
    case 'GET':
      let query = { _id: bookmarks, isPublished: true };

      if (genre)
        query = Object.assign(
          {
            genre: {
              $in: Array.isArray(genre) ? genre : typeof genre === 'string' && genre.split(','),
            },
          },
          query
        );

      if (search)
        query = Object.assign(
          {
            $text: { $search: typeof search === 'string' && search.toLowerCase() },
          },
          query
        );

      try {
        return res.status(200).json({
          bookmarks: await Blog.find(query).limit(Number(pageSize || 20)),
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