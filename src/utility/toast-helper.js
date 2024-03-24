import toast from 'react-hot-toast';

export const TOASTTYPES = {
  loading: 'loading',
  success: 'success',
  error: 'error',
};

const toastMessage = {
  loading: 'Processing...',
  success: 'Saved successfully',
  error: 'Error while processing',
};

export const showToast = (type, toastId = '', customMessage = '') => {
  const message = customMessage ? customMessage : toastMessage[type];
  if (toastId) {
    toast[type](message, { id: toastId });
  } else {
    const toastObj = toast[type](message);
    return toastObj;
  }
};
