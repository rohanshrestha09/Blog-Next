import { createSlice } from '@reduxjs/toolkit';
import { PROFILE_SIDER_KEYS } from '../constants/reduxKeys';

const { FOLLOWERS, FOLLOWING } = PROFILE_SIDER_KEYS;

const followersSice = createSlice({
  name: 'followers',
  initialState: {
    key: FOLLOWERS,
    pageSize: {
      [FOLLOWERS]: 20,
      [FOLLOWING]: 20,
    },
    search: {
      [FOLLOWERS]: '',
      [FOLLOWING]: '',
    },
  },
  reducers: {
    changeKey: (state, { payload: { key } }: { payload: { key: PROFILE_SIDER_KEYS } }) => {
      return (state = { ...state, key });
    },
    setPageSize: (state, { payload: { pageSize } }: { payload: { pageSize: number } }) => {
      return (state = { ...state, pageSize: { ...state.pageSize, [state.key]: pageSize } });
    },
    setSearch: (state, { payload: { search } }: { payload: { search: string } }) => {
      console.log(search);
      return (state = { ...state, search: { ...state.search, [state.key]: search } });
    },
  },
});

export const { changeKey, setPageSize, setSearch } = followersSice.actions;

export default followersSice.reducer;