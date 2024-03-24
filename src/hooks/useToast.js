import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
const useToast = () => {
  const setToast = (loadingMsg, msg) => {
    const toastId = showToast(TOASTTYPES.loading, '', loadingMsg);
    showToast(TOASTTYPES.success, toastId, msg);
  };
  return { setToast };
};

export default useToast;
