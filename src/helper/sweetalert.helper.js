import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

const MySwal = withReactContent(Swal);

export function showWarnAlert({
  title = '',
  text = '',
  icon = 'warning',
  showCancelButton = true,
  allowOutsideClick = false,
  loaderHtml = '<div class="spinner-border text-primary"></div>',
  confirmButtonText = 'Okay',
  showLoaderOnConfirm = false,
  customClass = {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-danger ms-1',
  },
  buttonsStyling = false,
  ...restOptions
}) {
  return new Promise((resolve) =>
    MySwal.fire({
      title,
      text,
      icon,
      showCancelButton,
      loaderHtml,
      allowOutsideClick,
      confirmButtonText,
      showLoaderOnConfirm,
      customClass,
      buttonsStyling,
      ...restOptions,
    }).then((result) => resolve(result))
  );
}
