import { Request, Response } from 'express';
import moment from 'moment';
import { serialize } from 'cookie';
import uploadFile from '../../middleware/uploadFile';
import deleteFile from '../../middleware/deleteFile';
import User from '../../model/User';
const asyncHandler = require('express-async-handler');

moment.suppressDeprecationWarnings = true;

export const authHandler = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).json({ data: res.locals.auth, message: 'Authentication Success' });
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId, image, imageName } = res.locals.auth;

    const { fullname, bio, website, dateOfBirth } = req.body;

    try {
      if (req.files) {
        const file = req.files.image as any;

        if (!file.mimetype.startsWith('image/'))
          return res.status(403).json({ message: 'Please choose an image' });

        if (image && imageName) deleteFile(`users/${imageName}`);

        const filename = file.mimetype.replace('image/', `${authId}.`);

        const fileUrl = await uploadFile(file.data, file.mimetype, `users/${filename}`);

        await User.findByIdAndUpdate(authId, {
          image: fileUrl,
          imageName: filename,
        });
      }

      await User.findByIdAndUpdate(authId, {
        fullname,
        bio,
        website,
        dateOfBirth: new Date(moment(dateOfBirth).format()),
      });

      return res.status(200).json({ message: 'Profile Updated Successfully' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

export const deleteImage = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId, image, imageName } = res.locals.auth;

  try {
    if (image && imageName) deleteFile(imageName);

    await User.findByIdAndUpdate(authId, {
      image: null,
      imageName: null,
    });

    return res.status(200).json({ message: 'Profile Image Removed Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const deleteProfile = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId, image, imageName } = res.locals.auth;

    try {
      if (image && imageName) deleteFile(`users/${imageName}`);

      await User.findByIdAndDelete(authId);

      return res.status(200).json({ message: 'Profile Deleted Successfully' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

export const logout = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  try {
    const serialized = serialize('token', '', {
      maxAge: 0,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    return res.status(200).json({ message: 'Logout Successful' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});