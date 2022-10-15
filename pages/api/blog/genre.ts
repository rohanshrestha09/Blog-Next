import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import init from '../../../middleware/init';
import { IGenre } from '../../../interface/blog';
import { genre } from '../../../model/Blog';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<IGenre | IMessage>
) => {
  const { method } = req;

  res.setHeader('Cache-Control', 'public,max-age=86400');

  return method === 'GET'
    ? res.status(200).json({ data: genre, message: 'Genre Fetched Successfully' })
    : res.status(405).json({ message: 'Method not allowed' });
};

export default handler;
