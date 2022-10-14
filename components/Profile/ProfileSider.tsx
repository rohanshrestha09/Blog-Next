import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Empty, Tabs, Divider, Input, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { IconType } from 'react-icons';
import { BiLink, BiSearch } from 'react-icons/bi';
import { BsFillCalendarDateFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { RiUserAddLine, RiUserFollowFill, RiUserFollowLine } from 'react-icons/ri';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import UserSkeleton from '../shared/UserSkeleton';
import { changeKey, setPageSize, setSearch } from '../../store/followersSlice';
import { openModal, closeModal } from '../../store/modalSlice';
import { GET_AUTH_FOLLOWERS, GET_AUTH_FOLLOWING } from '../../constants/queryKeys';
import { MODAL_KEYS, PROFILE_SIDER_KEYS } from '../../constants/reduxKeys';
import type { IUsers } from '../../interface/user';
import type { RootState } from '../../store';

interface Props {
  isSider?: boolean;
}

const { AUTH_FOLLOWERS, AUTH_FOLLOWING } = PROFILE_SIDER_KEYS;

const { AUTH_FOLLOWERS_MODAL } = MODAL_KEYS;

const Profile: React.FC<Props> = ({ isSider }) => {
  const { authKey, pageSize, search } = useSelector(
    (state: RootState) => state.followers,
    shallowEqual
  );

  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const authAxios = new AuthAxios();

  const { data: followers, isLoading: isFollowersLoading } = useQuery({
    queryFn: () =>
      authAxios.getFollowers({
        pageSize: pageSize[AUTH_FOLLOWERS],
        search: search[AUTH_FOLLOWERS],
      }),
    queryKey: [
      GET_AUTH_FOLLOWERS,
      { pageSize: pageSize[AUTH_FOLLOWERS], search: search[AUTH_FOLLOWERS] },
    ],
  });

  const { data: following, isLoading: isFollowingLoading } = useQuery({
    queryFn: () =>
      authAxios.getFollowing({
        pageSize: pageSize[AUTH_FOLLOWING],
        search: search[AUTH_FOLLOWING],
      }),
    queryKey: [
      GET_AUTH_FOLLOWING,
      { pageSize: pageSize[AUTH_FOLLOWING], search: search[AUTH_FOLLOWING] },
    ],
  });

  let timeout: any = 0;

  const getTabItems = (label: string, key: PROFILE_SIDER_KEYS, Icon: IconType, users?: IUsers) => {
    return {
      key,
      label: (
        <span className='sm:mx-2 mx-auto flex items-center gap-1.5'>
          <Icon className='inline' />{' '}
          {`${authUser[key === AUTH_FOLLOWERS ? 'followersCount' : 'followingCount']} ${label}`}
        </span>
      ),
      children: (
        <div className='w-full pt-3'>
          <span className='w-full flex gap-3 items-center'>
            <Input
              className='rounded-lg py-[5px] bg-black'
              defaultValue={search[key]}
              placeholder='Search title...'
              prefix={<BiSearch />}
              onChange={({ target: { value } }) => {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => dispatch(setSearch({ key, search: value })), 700);
              }}
            />

            {(key === AUTH_FOLLOWERS ? isFollowersLoading : isFollowingLoading) && (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            )}
          </span>

          <Divider />

          {isEmpty(users?.data) ? (
            <Empty>
              <p className='text-[#1890ff] cursor-pointer hover:text-blue-600'>View Suggestions</p>
            </Empty>
          ) : (
            users?.data.map((user) => (
              <UserSkeleton
                key={user._id}
                user={user}
                shouldFollow={!authUser.following.includes(user._id as never)}
              />
            ))
          )}
        </div>
      ),
    };
  };

  const items = [
    { key: AUTH_FOLLOWERS, label: 'Followers', users: followers, icon: RiUserFollowLine },
    { key: AUTH_FOLLOWING, label: 'Following', users: following, icon: RiUserAddLine },
  ].map(({ key, label, users, icon }) => authUser && getTabItems(label, key, icon, users));

  return (
    <div className={`w-full sm:order-last ${!isSider && 'lg:hidden'}`}>
      {authUser && (
        <main className='w-full flex flex-col'>
          {isSider && (
            <header className='text-2xl break-words pb-4'>More from {authUser.fullname}</header>
          )}

          <div
            className='w-full flex flex-col gap-3 [&>*]:flex [&>*]:items-center [&>*]:gap-2'
            style={{ overflowWrap: 'anywhere' }}
          >
            {authUser.bio && (
              <span className='flex-wrap'>
                <BsFillInfoCircleFill />
                <p>{authUser.bio}</p>
              </span>
            )}

            {authUser.website && (
              <span>
                <BiLink />
                <a
                  className='underline'
                  href={
                    !authUser.website.startsWith('https://')
                      ? `https://${authUser.website}`
                      : authUser.website
                  }
                  target='_blank'
                  rel='noreferrer'
                >
                  {authUser.website}
                </a>
              </span>
            )}

            <span>
              <BsFillCalendarDateFill />
              <p>{`Joined ${moment(authUser.createdAt).format('ll')}`}</p>
            </span>

            {!isSider && (
              <>
                <span>
                  <RiUserFollowFill />
                  <p
                    className='text-[#1890ff] cursor-pointer hover:text-blue-600'
                    onClick={() => dispatch(openModal({ key: AUTH_FOLLOWERS_MODAL }))}
                  >
                    Check Followers
                  </p>
                </span>

                <Modal
                  open={isOpen[AUTH_FOLLOWERS_MODAL]}
                  onCancel={() => dispatch(closeModal({ key: AUTH_FOLLOWERS_MODAL }))}
                  footer={null}
                >
                  <Tabs
                    defaultActiveKey={authKey}
                    className='w-full'
                    items={items}
                    onTabClick={(key: any) => dispatch(changeKey({ key, type: 'authKey' }))}
                  />
                </Modal>
              </>
            )}
          </div>

          {isSider && (
            <>
              <Divider className='mb-3' />

              <Tabs
                defaultActiveKey={authKey}
                className='w-full'
                items={items}
                onTabClick={(key: any) => dispatch(changeKey({ key, type: 'authKey' }))}
              />
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default Profile;
