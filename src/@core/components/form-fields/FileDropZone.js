// ** React Imports
import { useState, Fragment, useEffect } from 'react';
import { isArray } from 'lodash';

// ** Reactstrap Imports
import {
  // Card,
  // CardBody,
  Button,
  // ListGroup,
  // ListGroupItem,
  Spinner,
} from 'reactstrap';

// ** Third Party Imports
import UILoader from '@components/ui-loader';
import { useDropzone } from 'react-dropzone';
import { FileText, X, DownloadCloud } from 'react-feather';
import { getFileName, getFileType } from '../../../helper/common.helper';

const FileDropZone = ({
  multiple = false,
  filesUpload = false,
  removeFile = false,
  fileURLArray = [],
  accept,
  setError = false,
  fileSize = false,
  fieldName,
  loading,
  disabled = false,
  propsBorder = null,
  formDesignField = null,
}) => {
  // ** State
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple,
    accept,
    onDrop: (acceptedFiles) => {
      if (fileSize) {
        if (fileSize < Math.round(acceptedFiles?.[0].size / 100) / 10000) {
          setError(
            fieldName,
            {
              type: 'fileSize',
              message: `File upload max upto ${fileSize} mb`,
            },
            { shouldFocus: true }
          );
          return;
        }
      }
      if (filesUpload) {
        filesUpload([
          ...files,
          ...acceptedFiles.map((file) => Object.assign(file)),
        ]);
      }
    },
  });

  useEffect(() => {
    if (fileURLArray?.length > 0) {
      let tempFiles = [];
      fileURLArray?.forEach((url) => {
        tempFiles = [
          ...tempFiles,
          {
            name: getFileName(url),
            type: getFileType(url),
            url: `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${url}`,
          },
        ];
      });
      setFiles(tempFiles);
    }
  }, [fileURLArray]);

  const renderFilePreview = (file) => {
    if (file?.type?.startsWith('image')) {
      return (
        <img
          className='rounded'
          alt={''}
          src={file.url}
          height='28'
          width='28'
        />
      );
    } else {
      return <FileText size='28' />;
    }
  };

  const handleRemoveFile = (index) => {
    const uploadedFiles = files;
    uploadedFiles.splice(index, 1);
    if (isArray(uploadedFiles)) setFiles([...uploadedFiles]);
    if (removeFile) removeFile(index);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
    if (removeFile) removeFile();
  };

  const renderFileSize = (size) => {
    if (Math.round(size / 100) / 10 > 1000) {
      return `${(Math.round(size / 100) / 10000).toFixed(1)} mb`;
    } else {
      return `${(Math.round(size / 100) / 10).toFixed(1)} kb`;
    }
  };

  const fileList = files.map((file, index) => (
    <div key={`${file.name}-${index}`} className='item'>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div className='file-name-size'>
          <p className='file-name'>{file.name}</p>
          {file && file?.size && (
            <p className='file-size'>{renderFileSize(file.size)}</p>
          )}
        </div>
      </div>
      <Button
        color='danger'
        outline
        size='sm'
        className='remove-btn'
        onClick={() => handleRemoveFile(index)}
      >
        <X size={14} />
      </Button>
    </div>
  ));

  return (
    <div className='custom-fileupload' style={{ border: propsBorder }}>
      <UILoader blocking={loading} loader={<></>}>
        <div className='inner-wrapper'>
          {(multiple || (!multiple && files?.length === 0)) && (
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} disabled={disabled} />
              <div className='d-flex align-items-center justify-content-center flex-column outsite-CN'>
                <DownloadCloud size={64} />
                <h5 className='title'>Drop Files here or click to upload</h5>
                <p className='text-secondary'>
                  Drop files here or click{' '}
                  <a
                    href='/'
                    onClick={(e) => e.preventDefault()}
                    style={{ color: formDesignField?.fontColor }}
                  >
                    browse
                  </a>{' '}
                  thorough your machine
                </p>
                {loading && <Spinner />}
              </div>
            </div>
          )}

          {files.length ? (
            <Fragment>
              <div className='uploded-items'>{fileList}</div>
              {multiple && (
                <div className='d-flex justify-content-end'>
                  <Button
                    className='me-1'
                    color='danger'
                    outline
                    onClick={handleRemoveAllFiles}
                  >
                    Remove All
                  </Button>
                </div>
              )}
            </Fragment>
          ) : null}
        </div>
      </UILoader>
    </div>
  );
};

export default FileDropZone;
