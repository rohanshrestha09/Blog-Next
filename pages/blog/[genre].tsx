import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { shallowEqual, useSelector } from 'react-redux';
import { dehydrate, QueryClient, DehydratedState, useQuery } from '@tanstack/react-query';
import { capitalize, isEmpty } from 'lodash';
import BlogAxios from '../../apiAxios/blogAxios';
import AuthAxios from '../../apiAxios/authAxios';
import UserAxios from '../../apiAxios/userAxios';
import {
  AUTH,
  GET_ALL_BLOGS,
  GET_BLOG_SUGGESTIONS,
  GET_GENRE,
  GET_USER_SUGGESTIONS,
} from '../../constants/queryKeys';
import type { RootState } from '../../store';
import { HOME_KEYS } from '../../constants/reduxKeys';
import { Divider, Empty, PageHeader } from 'antd';
import BlogList from '../../components/Blogs/BlogList';
import { useAuth } from '../../utils/UserAuth';

const { GENERIC_BLOGS } = HOME_KEYS;

const GenericBlogs: NextPage = () => {
  const {
    query: { genre },
    back,
  }: NextRouter = useRouter();

  const {
    pageSize: { [GENERIC_BLOGS]: pageSize },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const { authUser } = useAuth();

  const blogAxios = new BlogAxios();

  const { data: blogs } = useQuery({
    queryFn: () => blogAxios.getAllBlog({ genre: [capitalize(String(genre))], pageSize }),
    queryKey: [GET_ALL_BLOGS, { genre: [capitalize(String(genre))], pageSize }],
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`Blog / ${capitalize(genre as string)}`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <PageHeader
          className='pt-0 px-0'
          onBack={() => back()}
          title={<header className='font-light text-2xl uppercase'>{genre}</header>}
          footer={<Divider className='my-0' />}
        />

        <div className='w-full pt-3'>
          {isEmpty(blogs?.data) ? (
            <Empty />
          ) : (
            blogs?.data.map((blog) => (
              <BlogList key={blog._id} blog={blog} editable={blog.author._id === authUser?._id} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default GenericBlogs;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  props: { dehydratedState: DehydratedState };
}> => {
  const queryClient = new QueryClient();

  const blogAxios = new BlogAxios(ctx.req.headers.cookie);

  const authAxios = new AuthAxios(ctx.req.headers.cookie);

  const userAxios = new UserAxios(ctx.req.headers.cookie);

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  await queryClient.prefetchQuery({
    queryFn: () => authAxios.auth(),
    queryKey: [AUTH],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getAllBlog({ genre: [capitalize(String(ctx.params?.genre))] }),
    queryKey: [GET_ALL_BLOGS, { genre: [capitalize(String(ctx.params?.genre))], pageSize: 20 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => userAxios.getUserSuggestions({ pageSize: 3 }),
    queryKey: [GET_USER_SUGGESTIONS, { pageSize: 3 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getBlogSuggestions({ pageSize: 4 }),
    queryKey: [GET_BLOG_SUGGESTIONS, { pageSize: 4 }],
  });

  await queryClient.prefetchQuery({
    queryFn: () => blogAxios.getGenre(),
    queryKey: [GET_GENRE],
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
