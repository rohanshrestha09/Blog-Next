import Head from 'next/head';
import { useRouter, NextRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  DehydratedState,
  QueryClient,
  dehydrate,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Image, Button, Divider, Empty, Skeleton, List, ConfigProvider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from 'auth';
import BlogCard from 'components/common/BlogCard';
import UserProfileSider from './components/Sider';
import { useFilterStore } from 'store/hooks';
import { getProfile } from 'request/auth';
import {
  followUser,
  getUser,
  getUserBlogs,
  getUserFollowers,
  getUserFollowing,
  unfollowUser,
} from 'request/user';
import { queryKeys } from 'utils';
import { errorNotification, successNotification } from 'utils/notification';
import { AUTH, USER, BLOG, FOLLOWER, FOLLOWING } from 'constants/queryKeys';
import { FILTERS } from 'constants/reduxKeys';

const UserProfile = () => {
  const { query, push }: NextRouter = useRouter();

  const { size, setSize } = useFilterStore(FILTERS.USER_PROFILE_FILTER);

  const queryClient = useQueryClient();

  const { authUser } = useAuth();

  const { data: user, refetch } = useQuery({
    queryFn: () => getUser(String(query?.userId)),
    queryKey: queryKeys(USER).detail(String(query?.userId)),
  });

  const { data: blogs, isLoading } = useQuery({
    queryFn: () => getUserBlogs({ id: String(query?.userId), size }),
    queryKey: queryKeys(BLOG, USER).list({ id: String(query?.userId), size }),
    keepPreviousData: true,
  });

  const handleFollowUser = useMutation(followUser, {
    onSuccess: (res) => {
      successNotification(res.message);
      refetch();
      queryClient.refetchQueries(queryKeys(FOLLOWING).all);
      queryClient.refetchQueries(queryKeys(FOLLOWER).all);
    },
    onError: errorNotification,
  });

  const handleUnfollowUser = useMutation(unfollowUser, {
    onSuccess: (res) => {
      successNotification(res.message);
      refetch();
      queryClient.refetchQueries(queryKeys(FOLLOWING).all);
      queryClient.refetchQueries(queryKeys(FOLLOWER).all);
    },
    onError: errorNotification,
  });

  return (
    <div className='w-full flex justify-center'>
      <Head>
        <title>{`${user?.name} | BlogSansar`}</title>
        <link href='/favicon.ico' rel='icon' />
      </Head>

      <main className='w-full flex flex-col'>
        <header className='text-2xl uppercase pb-4'>Profile</header>

        <div className='w-full flex flex-wrap sm:flex-row flex-col sm:items-center gap-3 justify-between'>
          <span className='flex items-center gap-4'>
            <Image
              alt=''
              className='min-w-[50px] rounded-full object-cover'
              height={50}
              width={50}
              src={
                user?.image ||
                'data:image/png;base64,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'
              }
            />

            <p className='text-xl text-white' style={{ overflowWrap: 'anywhere' }}>
              {user?.name}
            </p>
          </span>

          <UserProfileSider />

          <Button
            type='primary'
            className='sm:order-2 rounded-lg'
            danger={user?.followedByViewer}
            disabled={authUser?.id === user?.id}
            onClick={() => {
              if (!user) return;
              user?.followedByViewer
                ? handleUnfollowUser.mutate(user?.id)
                : handleFollowUser.mutate(user?.id);
            }}
          >
            {user?.followedByViewer ? 'Unfollow' : 'Follow'}
          </Button>
        </div>

        <Divider />

        <header className='text-2xl uppercase pb-2'>{`${user?.name}'s Blogs`}</header>

        <div className='w-full pt-3'>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='py-8' avatar round paragraph={{ rows: 3 }} active />
            ))
          ) : (
            <InfiniteScroll
              dataLength={blogs?.result?.length ?? 0}
              next={() => setSize(10)}
              hasMore={blogs?.result ? blogs?.result?.length < blogs?.count : false}
              loader={<Skeleton avatar round paragraph={{ rows: 2 }} active />}
            >
              <ConfigProvider
                renderEmpty={() => (
                  <Empty>
                    <Button className='h-10 uppercase rounded-lg' onClick={() => push('/')}>
                      Browse Blogs
                    </Button>
                  </Empty>
                )}
              >
                <List
                  itemLayout='vertical'
                  dataSource={blogs?.result}
                  renderItem={(blog) => (
                    <BlogCard
                      key={blog?.id}
                      blog={blog}
                      editable={blog?.authorId === authUser?.id}
                    />
                  )}
                />
              </ConfigProvider>
            </InfiniteScroll>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
): Promise<
  | {
      props: { dehydratedState: DehydratedState };
    }
  | { notFound: true }
> => {
  const queryClient = new QueryClient();

  ctx.res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const config = { headers: { Cookie: ctx.req.headers.cookie || '' } };

  await queryClient.prefetchQuery({
    queryFn: () => getProfile(config),
    queryKey: queryKeys(AUTH).details(),
  });

  await queryClient.prefetchQuery({
    queryFn: () => getUser(String(ctx.params?.userId), config),
    queryKey: queryKeys(USER).detail(String(ctx.params?.userId)),
  });

  const user = await queryClient.getQueryData(queryKeys(USER).detail(String(ctx.params?.userId)));

  if (!user)
    return {
      notFound: true,
    };

  await queryClient.prefetchQuery({
    queryFn: () => getUserBlogs({ id: String(ctx.params?.userId), size: 20 }, config),
    queryKey: queryKeys(BLOG, USER).list({ id: String(ctx.params?.userId), size: 20 }),
  });

  await queryClient.prefetchQuery({
    queryFn: () =>
      getUserFollowers({ id: String(ctx.params?.userId), size: 20, search: '' }, config),
    queryKey: queryKeys(FOLLOWER, USER).list({
      id: String(ctx.params?.userId),
      size: 20,
      search: '',
    }),
  });

  await queryClient.prefetchQuery({
    queryFn: () =>
      getUserFollowing({ id: String(ctx.params?.userId), size: 20, search: '' }, config),
    queryKey: queryKeys(FOLLOWING, USER).list({
      id: String(ctx.params?.userId),
      size: 20,
      search: '',
    }),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
