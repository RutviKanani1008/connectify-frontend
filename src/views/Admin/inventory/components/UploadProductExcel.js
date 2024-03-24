import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzone } from 'react-dropzone';
import { DownloadCloud } from 'react-feather';
import { useForm } from 'react-hook-form';
import { Button } from 'reactstrap';
import { required } from '../../../../configs/validationConstant';
import { validateProducts } from '../hooks/InventoryProductApi';

const documentScheme = yup.object().shape({
  document: yup
    .string()
    .when('documentURL', {
      is: (documentURL) =>
        documentURL === '' || documentURL === undefined || documentURL === null,
      then: yup.string().required(required('Document')),
    })
    .nullable(),
});
const UploadProductExcel = ({
  // setImportedContacts,
  stepper,
  setFileUploading,
  setFile,
  showFileError,
  socketSessionId,
  setUploadProgress,
  setImportId,
}) => {
  const {
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(documentScheme),
  });

  const fileSize = 50;
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept:
      '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    onDrop: (acceptedFiles) => {
      if (fileSize) {
        if (fileSize < Math.round(acceptedFiles?.[0]?.size / 100) / 10000) {
          setError(
            'document',
            {
              type: 'fileSize',
              message: `File upload max upto ${fileSize} mb`,
            },
            { shouldFocus: true }
          );
        } else {
          documentUpload([...acceptedFiles.map((file) => Object.assign(file))]);
        }
      }
    },
  });

  const documentUpload = (files) => {
    if (files && files.length) {
      const file = files[0];
      const formData = new FormData();
      formData.append('public', file);
      setFile(file);
      setFileUploading(true);

      validateProducts(formData, socketSessionId)
        .then((res) => {
          setTimeout(() => {
            setUploadProgress && setUploadProgress(null);
          }, 1500);
          if (res?.data?.data) {
            setImportId(res?.data?.data?._id);
            stepper.next();
          }
          setFileUploading(false);
        })
        .catch(() => {
          setTimeout(() => {
            setUploadProgress && setUploadProgress(null);
          }, 1500);
          setFileUploading(false);
        });
    }
  };

  return (
    <>
      <div className='import-contact-upload-wrapper'>
        <div
          {...getRootProps({ className: 'custom-fileupload' })}
          // style={{ border: '1px dashed #6e6b7b' }}
        >
          <div className='inner-wrapper'>
            <div className='dropzone'>
              <input {...getInputProps()} />
              <div className='d-flex align-items-center justify-content-center flex-column outsite-CN'>
                <DownloadCloud size={64} />
                <h5>Drop Files here or click to upload</h5>
                <p className='text-secondary'>
                  Drop files here or click{' '}
                  <a href='/' onClick={(e) => e.preventDefault()}>
                    browse
                  </a>{' '}
                  thorough your machine
                </p>
              </div>
            </div>
          </div>
        </div>
        {showFileError && (
          <span
            className='mt-1 text-danger block d-flex align-items-center justify-content-center'
            style={{ fontSize: '1.00rem' }}
          >
            Document is required
          </span>
        )}
        {errors?.document && errors?.document?.type === 'fileSize' && (
          <span className='text-danger block' style={{ fontSize: '0.857rem' }}>
            {`File upload max upto ${5} mb`}
          </span>
        )}
        <ul className='fancy-ul'>
          <li className='item'>Product title,sku & quantity is required fields.</li>
          <li className='item'>
            Not sure what exact data you should enter in the csv ?
          </li>
          <li className='item'>
            Don't worry you can always edit scanned Products in second step of
            import process.
          </li>
        </ul>
        <Button
          className=''
          color='primary'
        >
          Download sample excel file
        </Button>
      </div>
    </>
  );
};
export default UploadProductExcel;
