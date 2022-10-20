import axios, { AxiosResponse } from 'axios';
import { SORT_TYPE } from '../constants/reduxKeys';
import { IBlog, IBlogData, IBlogs, IGenre } from '../interface/blog';
import IMessage from '../interface/message';

class Blog {
  constructor(private cookie?: any) {}

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IGenre & IBlogData & IBlog & IBlogs & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:3000/api/blog/${url}`,
      data,
      headers: { Cookie: this.cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  getBlog = async (id: string): Promise<IBlogData> => await (await this.axiosFn('get', id)).data;

  getAllBlog = async ({
    sort,
    pageSize,
    genre,
    search,
  }: {
    sort?: SORT_TYPE;
    pageSize?: number;
    genre?: string[] | [];
    search?: string;
  }): Promise<IBlogs> =>
    await this.axiosFn(
      'get',
      `?genre=${genre || []}&sort=${sort || 'likes'}&pageSize=${pageSize || 20}&search=${
        search || ''
      }`
    );

  getRandomBlogs = async ({ pageSize }: { pageSize: number }):Promise<IBlogs> =>
    await this.axiosFn('get', `random?pageSize=${pageSize || 4}`);

  postBlog = async (data: FormData): Promise<IMessage> => await this.axiosFn('post', '', data);

  updateBlog = async ({ id, data }: { id: string; data: FormData }): Promise<IMessage> =>
    await this.axiosFn('put', id, data);

  deleteBlog = async (id: string): Promise<IMessage> => this.axiosFn('delete', id);

  publishBlog = async ({
    id,
    shouldPublish,
  }: {
    id: string;
    shouldPublish: boolean;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldPublish ? 'post' : 'delete'}`, `${id}/publish`);

  likeBlog = async ({ id, shouldLike }: { id: string; shouldLike: boolean }): Promise<IMessage> =>
    await this.axiosFn(`${shouldLike ? 'post' : 'delete'}`, `${id}/like`);

  bookmarkBlog = async ({
    id,
    shouldBookmark,
  }: {
    id: string;
    shouldBookmark: boolean;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldBookmark ? 'post' : 'delete'}`, `${id}/bookmark`);

  commentBlog = async ({
    id,
    shouldComment,
    data,
  }: {
    id: string;
    shouldComment: boolean;
    data: FormData;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldComment ? 'post' : 'delete'}`, `${id}/comment`, data);

  getGenre = async (): Promise<IGenre['data']> => await (await this.axiosFn('get', 'genre')).data;
}

export default Blog;
