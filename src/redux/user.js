import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: {},
    token: null,
    permissions: {},
    allowedNavItems: [],
  },
  reducers: {
    storeUser: (state, action) => {
      state.userData = action.payload;
      return state;
    },
    storeCompanyDetails: (state, action) => {
      state.userData = {
        ...state.userData,
        company: { ...state.userData.company, ...action.payload },
      };
      return state;
    },
    storeToken: (state, action) => {
      state.token = action.payload;
      return state;
    },
    storePermissions: (state, action) => {
      state.permissions = action.payload;
      return state;
    },
    storeUpdateUser: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    storeUpdateCurrentTasksTimer: (state, action) => {
      state.userData = {
        ...state.userData,
        taskTimer: [...action.payload],
      };
      return state;
    },
    storeAllowedNavItems: (state, action) => {
      state.allowedNavItems = action.payload;
    },
  },
});

export const {
  storeUser,
  storeCompanyDetails,
  storeToken,
  storeUpdateUser,
  storeAllowedNavItems,
  storeUpdateCurrentTasksTimer,
} = userSlice.actions;

export const userData = (state) => state.user.userData;
export const useTasksTimerDetails = (state) => state.user.userData.taskTimer;
export const userRole = (state) => state.user.userData.role;
export const userPendingChangeLogCount = (state) =>
  state.user.userData.pendingChangeLogCount;
export const userRolePermission = (state) => ({
  role: state.user.userData.role,
  permissions: state.user.userData?.contactId?.permissions
    ? state.user.userData?.contactId?.permissions
    : [],
});
export const userPermissions = (state) =>
  state.user.userData?.contactId?.permissions
    ? state.user.userData?.contactId?.permissions
    : [];
export const userEmail = (state) => state.user.userData.email;
export const userCompany = (state) => state.user.userData.company; // application for only users other then "superadmin"
export const permissions = (state) => state.user.permissions;
export const allowedNavItems = (state) => state.user.allowedNavItems;

export default userSlice.reducer;
