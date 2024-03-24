import { createSlice } from '@reduxjs/toolkit';

export const emailSlice = createSlice({
  name: 'email',
  initialState: {
    mails: [],
    totalMailCount: 0,
    selectedMails: [],
    currentMails: [],
    connectedMailAccounts: [],
    params: {
      page: 1,
      search: '',
      filters: ['ALL'],
    },
    isMailsLoading: false,
    folders: {},
    foldersCount: {},
    isMailSyncingChecked: false,
  },
  reducers: {
    setMails: (state, action) => {
      state.mails = [...action.payload];
      return state;
    },
    setTotalMailCount: (state, action) => {
      state.totalMailCount = action.payload;
      return state;
    },
    setCurrentMail: (state, action) => {
      state.currentMails = action.payload;
      return state;
    },
    setConnectedMailAccounts: (state, action) => {
      state.connectedMailAccounts = [
        ...state.connectedMailAccounts,
        ...action.payload,
      ];
      return state;
    },
    removeMailAccounts: (state, action) => {
      state.connectedMailAccounts = state.connectedMailAccounts.filter(
        (obj) => obj.username !== action.payload
      );
      return state;
    },
    setEmailParams: (state, action) => {
      state.params = { ...state.params, ...action.payload };
      return state;
    },
    setEmailFilter: (state, action) => {
      state.params = { ...state.params, filters: [action.payload] };
      return state;
    },
    setMailsLoading: (state, action) => {
      state.isMailsLoading = action.payload;
      return state;
    },
    setMailFolder: (state, action) => {
      state.folders = action.payload;
      return state;
    },
    setMailFoldersCount: (state, action) => {
      state.foldersCount = { ...state.foldersCount, ...action.payload };
    },
    selectMail: (state, action) => {
      let selectedMails = state.selectedMails;

      if (
        !selectedMails.find(
          (mail) =>
            mail.mail_provider_thread_id ===
            action.payload.mail_provider_thread_id
        )
      ) {
        selectedMails.push(action.payload);
      } else {
        selectedMails = selectedMails.filter(
          (mail) =>
            mail.mail_provider_thread_id !==
            action.payload.mail_provider_thread_id
        );
      }
      state.selectedMails = selectedMails;
    },
    selectAllMail: (state, action) => {
      let selectAllMailsArr = [];
      if (action.payload) {
        selectAllMailsArr.length = 0;
        selectAllMailsArr = state.mails;
      } else {
        selectAllMailsArr.length = 0;
      }
      state.selectedMails = selectAllMailsArr;
    },
  },
});

export const {
  setMails,
  setCurrentMail,
  setConnectedMailAccounts,
  removeMailAccounts,
  setEmailParams,
  setEmailFilter,
  setMailsLoading,
  setTotalMailCount,
  setMailFolder,
  setMailFoldersCount,
  selectMail,
  selectAllMail,
} = emailSlice.actions;

export const getMails = (state) => state.email.mails;
export const getCurrentMails = (state) => state.email.currentMails;
export const getConnectedMailAccounts = (state) =>
  state.email.connectedMailAccounts;
export const getIsMailsLoading = (state) => state.email.isMailsLoading;
export const getMailFolders = (state) => state.email.folders;
export const getMailFoldersCount = (state) => state.email.foldersCount;
export const getSelectedMails = (state) => state.email.selectedMails;

export default emailSlice.reducer;
