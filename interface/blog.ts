import { Document, Types } from 'mongoose';
import { IBlogSchema, ICommentSchema } from './schema';

type BlogKeys = Record<string, string | string[]>;

export type IBlogData = Omit<
  Document<unknown, any, IBlogSchema> & IBlogSchema & { _id: Types.ObjectId & string },
  never
>;

export interface IBlog extends IMessage {
  data: IBlogData;
}

export interface IBlogs extends IMessage {
  data: IBlogData[];
  count: number;
}

export interface IGenre extends IMessage {
  data: string[];
}

export interface IComments extends IMessage {
  data: Omit<
    Document<unknown, any, ICommentSchema> & ICommentSchema & { _id: Types.ObjectId & string },
    never
  >[];
  count: number;
}

export interface IBlogReturn extends IMessage {
  blog: string;
}

export interface IPostBlog extends BlogKeys {
  title: string;
  content: string;
  genre: string[];
}
