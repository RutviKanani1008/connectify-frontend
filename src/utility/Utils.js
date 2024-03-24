import { supportedTypes } from '../helper/common.helper';

// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = (obj) => Object.keys(obj).length === 0;

// ** Returns K format from a number
export const kFormatter = (num) =>
  num > 999 ? `${(num / 1000).toFixed(1)}k` : num;

// ** Converts HTML to string
export const htmlToString = (html) => html.replace(/<\/?[^>]+(>|$)/g, '');

// ** Checks if the passed date is today
const isToday = (date) => {
  const today = new Date();
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  );
};

export const formatDate = (
  value,
  formatting = { month: 'short', day: 'numeric', year: 'numeric' }
) => {
  if (!value) return value;
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value));
};

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value);
  let formatting = { month: 'short', day: 'numeric' };

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: 'numeric', minute: 'numeric' };
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value));
};

export const isUserLoggedIn = () => getCookie('token');
export const getUserData = () => JSON.parse(localStorage.getItem('userData'));

export const getHomeRouteForLoggedInUser = (userRole) => {
  if (userRole === 'admin') return '/';
  if (userRole === 'client') return '/access-control';
  return '/login';
};

// ** React Select Theme Colors
export const selectThemeColors = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#7367f01a', // for option hover bg-color
    primary: '#a3db59', // for selected option bg-color
    neutral10: '#a3db59', // for tags bg-color
    neutral20: '#ededed', // for input border-color
    neutral30: '#ededed', // for input hover border-color
  },
});

export function getCookie(name) {
  // eslint-disable-next-line prefer-template
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
export function deleteCookie(name) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export const singleElementRemoveFromArray = (array, value) => {
  const tempArray = [...(array || [])];
  const index = tempArray.indexOf(value);
  if (index > -1) {
    tempArray.splice(index, 1);
  }
  return tempArray;
};

export const logger = (value) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(value?.message ? value?.message : value);
  }
};

export const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export const hexToRGB = (h, lightness) => {
  let r = 0,
    g = 0,
    b = 0;

  // 3 digits
  if (h.length === 4) {
    r = `0x${h[1]}${h[1]}`;
    g = `0x${h[2]}${h[2]}`;
    b = `0x${h[3]}${h[3]}`;

    // 6 digits
  } else if (h.length === 7) {
    r = `0x${h[1]}${h[2]}`;
    g = `0x${h[3]}${h[4]}`;
    b = `0x${h[5]}${h[6]}`;
  }
  if (lightness) {
    return `rgb(${+r},${+g},${+b},${lightness})`;
  }
  return `rgb(${+r},${+g},${+b})`;
};

export const toggleElementFromArray = (array = [], item) => {
  const exists = array.includes(item);
  if (exists) {
    return (
      array.filter((c) => {
        return c !== item;
      }) || []
    );
  } else {
    const result = [...array, item];
    // result.push(item);
    return result || [];
  }
};

export const givenElementRemoveFromArray = (array = [], item) => {
  const exists = array.includes(item);
  if (exists) {
    return (
      array.filter((c) => {
        return c !== item;
      }) || []
    );
  }
  return array;
};

export const getFileExtension = (currentFile) => {
  const tempFile = currentFile.split('.');
  const fileType = tempFile[tempFile.length - 1];
  return fileType?.toLowerCase();
};

export const isValidFile = (currentFile) => {
  return supportedTypes.includes(getFileExtension(currentFile));
};

export const isFileTypeIsExistInSupportedFileTypes = (
  currentFile,
  supportedFileTypes = []
) => {
  return supportedFileTypes.includes(getFileExtension(currentFile));
};

export const convertHtmlToPlain = (html) => {
  const tempDivElement = document.createElement('div');
  tempDivElement.innerHTML = html;
  return tempDivElement.textContent || tempDivElement.innerText || '';
};

export const getNameFromEmail = (email = '') => {
  return email?.substring(0, email.lastIndexOf('@'));
};

export function getFullName(firstName, lastName) {
  let fullName = firstName || '';

  if (fullName.length && lastName) {
    fullName += ` ${lastName}`;
  } else {
    fullName = lastName || '';
  }
  return fullName;
}

export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
