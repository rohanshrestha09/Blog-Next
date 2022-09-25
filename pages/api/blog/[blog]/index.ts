import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import fs from 'fs';
import { isEmpty } from 'lodash';
import User from '../../../../model/User';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateBlog from '../../../../middleware/withValidateBlog';
import withParseMultipartForm from '../../../../middleware/withParseMultipartForm';
import { IBlog } from '../../../../interface/blog';
import { IAuth } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import IFiles from '../../../../interface/files';

export const config = {
  api: {
    bodyParser: false,
  },
};

const fsPromises = fs.promises;

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IBlog & IFiles & IAuth,
  res: NextApiResponse<IBlog | IMessage>
) => {
  const { method } = req;

  const { _id: blogId, image, imageName } = req.blog;

  const storage = getStorage();

  switch (method) {
    case 'GET':
      const blog = req.blog;

      try {
        return res.status(200).json({ blog, message: 'Blog Fetched Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'PUT':
      const { title, content, genre } = req.body;

      try {
        if (!isEmpty(req.files)) {
          const file = req.files.image as any;

          if (!file.mimetype.startsWith('image/'))
            return res.status(403).json({ message: 'Please choose an image' });

          if (image) deleteObject(ref(storage, `blogs/${imageName}`));

          const filename = file.mimetype.replace('image/', `${blogId}.`);

          const storageRef = ref(storage, `blogs/${filename}`);

          const metadata = {
            contentType: file.mimetype,
          };

          await uploadBytes(storageRef, await fsPromises.readFile(file.filepath), metadata);

          const url = await getDownloadURL(storageRef);

          await Blog.findByIdAndUpdate(blogId, {
            image: url,
            imageName: filename,
          });
        }

        await Blog.findByIdAndUpdate(blogId, {
          title,
          content,
          genre,
        });

        return res.status(200).json({ message: 'Blog Updated Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      const { _id: authId } = req.auth;

      try {
        if (image) deleteObject(ref(storage, `blogs/${imageName}`));

        await Blog.findByIdAndDelete(blogId);

        await User.findByIdAndUpdate(authId, { $pull: { blogs: blogId } });

        return res.status(200).json({ message: 'Blog Deleted Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateBlog(withParseMultipartForm(handler)));