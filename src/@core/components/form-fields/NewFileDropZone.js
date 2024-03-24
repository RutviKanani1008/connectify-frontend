// ** React Imports
import { useState, Fragment, useEffect } from 'react';
import { isArray } from 'lodash';

// ** Reactstrap Imports
import {
  Card,
  CardBody,
  Button,
  ListGroup,
  ListGroupItem,
  Spinner,
} from 'reactstrap';

// ** Third Party Imports
import UILoader from '@components/ui-loader';
import { useDropzone } from 'react-dropzone';
import { FileText, X, DownloadCloud } from 'react-feather';
import { getFileName, getFileType } from '../../../helper/common.helper';

const NewFileDropZone = ({
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
}) => {
  // ** State
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
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
    <ListGroupItem
      key={`${file.name}-${index}`}
      className='d-flex align-items-center justify-content-between'
    >
      <div className='file-details d-flex align-items-center'>
        <div className='file-preview me-1'>{renderFilePreview(file)}</div>
        <div>
          <p className='file-name mb-0 text-break'>{file.name}</p>
          {file && file?.size && (
            <p className='file-size mb-0'>{renderFileSize(file.size)}</p>
          )}
        </div>
      </div>
      <Button
        color='danger'
        outline
        size='sm'
        className='btn-icon'
        onClick={() => handleRemoveFile(index)}
      >
        <X size={14} />
      </Button>
    </ListGroupItem>
  ));

  return (
    <Card>
      <UILoader blocking={loading} loader={<></>}>
        <CardBody>
          {(multiple || (!multiple && files?.length === 0)) && (
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} disabled={disabled} />
              <div className='d-flex align-items-center justify-content-center flex-column'>
                <DownloadCloud size={64} />
                <h5>Drop Files here or click to upload</h5>
                <p className='text-secondary'>
                  Drop files here or click{' '}
                  <a href='/' onClick={(e) => e.preventDefault()}>
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
              <ListGroup className='my-2'>{fileList}</ListGroup>
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
        </CardBody>
      </UILoader>
    </Card>
  );
};

export default NewFileDropZone;
