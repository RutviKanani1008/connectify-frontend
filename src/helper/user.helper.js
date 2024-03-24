import { ContentState, EditorState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import moment, { isDate } from 'moment';
import { useSelector } from 'react-redux';
import { store } from '../redux/store';
import { userData } from '../redux/user';

const storeState = store.getState();
const user = storeState.user.userData;

export const isSuperAdmin = () => {
  return user.role === 'superadmin';
};

export const getCurrentUser = () => {
  return user;
};

export const htmlToDraftConverter = (bodyContent) => {
  const html = bodyContent;

  if (html) {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks,
        contentBlock.entityMap
      );
      const editorState = EditorState.createWithContent(contentState);
      return editorState;
    }
  }
  return null;
};

export const getCurrentDateFormat = () => {
  const user = useSelector(userData);
  if (user && user.company && user.company.dateFormat) {
    return user.company.dateFormat;
  }
  return 'MM/DD/YYYY';
};

export const getCurrentDateFormatForDatePicker = () => {
  const dateFormatForDatePicker = {
    'MM/DD/YYYY': 'm/d/Y',
    'DD MMM YYYY': 'd M Y',
    'DD/MM/YYYY': 'd/m/Y',
    'YYYY/MM/DD': 'Y/m/d',
  };
  return dateFormatForDatePicker[getCurrentDateFormat()];
};

export const displayDateByCompanyFormate = (date) => {
  return moment(isDate(new Date(date)) ? new Date(date) : new Date()).format(
    `${user?.company?.dateFormat ? user?.company?.dateFormat : 'MM/DD/YYYY'}`
  );
};

export const setUserData = ({ userData, token }) => {
  const date = new Date();
  date.setTime(date.getTime() + 1440 * 60000 * 7);
  document.cookie = `token=${token};expires=${date.toGMTString()};path=/`;
  if (userData && userData.role === 'admin') {
    localStorage.setItem('isCompanyAdmin', true);
  }
  if (userData && userData.role === 'superadmin') {
    localStorage.setItem('isSuperAdmin', true);
  }
  localStorage.setItem('userId', btoa(userData._id));
  localStorage.setItem('token', token);
};
