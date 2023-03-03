import axios, { AxiosResponse } from 'axios';
import { SORT_TYPE } from '../constants/reduxKeys';
import { IBlog, IBlogData, IBlogReturn, IBlogs, IComments, IGenre } from '../interface/blog';
import { IUsers } from '../interface/user';

const BlogAxios = (cookie?: any) => {
  const axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IGenre & IBlogData & IBlog & IBlogs & IUsers & IComments & IMessage & IBlogReturn> => {
    const res: AxiosResponse = await axios({
      method,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/${url}`,
      data,
      headers: { Cookie: cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  return {
    getBlog: async (id: string): Promise<IBlogData> => await (await axiosFn('get', id)).data,

    getAllBlog: async ({
      sort,
      size,
      genre,
      search,
    }: {
      sort?: SORT_TYPE;
      size?: number;
      genre?: string[] | [];
      search?: string;
    }): Promise<IBlogs> =>
      await axiosFn(
        'get',
        `?genre=${genre || []}&sort=${sort || 'like'}&size=${size || 20}&search=${search || ''}`
      ),

    getBlogSuggestions: async ({ size }: { size: number }): Promise<IBlogs> =>
      await axiosFn('get', `suggestions?size=${size || 4}`),

    postBlog: async (data: FormData): Promise<IBlogReturn> => await axiosFn('post', '', data),

    updateBlog: async ({ id, data }: { id: string; data: FormData }): Promise<IBlogReturn> =>
      await axiosFn('put', id, data),

    deleteBlog: async (id: string): Promise<IMessage> => axiosFn('delete', id),

    publishBlog: async ({
      id,
      shouldPublish,
    }: {
      id: string;
      shouldPublish: boolean;
    }): Promise<IMessage> => await axiosFn(`${shouldPublish ? 'post' : 'delete'}`, `${id}/publish`),

    getLikers: async ({ id, size }: { id: string; size: number }): Promise<IUsers> =>
      await axiosFn('get', `${id}/like?size=${size || 20}`),

    likeBlog: async ({ id, shouldLike }: { id: string; shouldLike: boolean }): Promise<IMessage> =>
      await axiosFn(`${shouldLike ? 'post' : 'delete'}`, `${id}/like`),

    bookmarkBlog: async ({
      id,
      shouldBookmark,
    }: {
      id: string;
      shouldBookmark: boolean;
    }): Promise<IMessage> =>
      await axiosFn(`${shouldBookmark ? 'post' : 'delete'}`, `${id}/bookmark`),

    getComments: async ({ id, size }: { id: string; size: number }): Promise<IComments> =>
      await axiosFn('get', `${id}/comment?size=${size || 20}`),

    postComment: async ({
      id,
      data,
    }: {
      id: string;
      data: { comment: string };
    }): Promise<IMessage> => await axiosFn('post', `${id}/comment`, data),

    deleteComment: async ({
      blogId,
      commentId,
    }: {
      blogId: string;
      commentId: string;
    }): Promise<IMessage> => await axiosFn('delete', `${blogId}/comment?commentId=${commentId}`),

    likeComment: async ({
      blogId,
      commentId,
      shouldLike,
    }: {
      blogId: string;
      commentId: string;
      shouldLike: boolean;
    }): Promise<IMessage> =>
      axiosFn(`${shouldLike ? 'post' : 'delete'}`, `${blogId}/comment/like?commentId=${commentId}`),

    getGenre: async (): Promise<IGenre['data']> => await (await axiosFn('get', 'genre')).data,
  };
};

export default BlogAxios;
