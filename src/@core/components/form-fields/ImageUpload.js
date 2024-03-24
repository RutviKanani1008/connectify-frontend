import { Input, Button, Label, Spinner } from 'reactstrap';
import React, { useState } from 'react';
import defaultImg from '@src/assets/images/avatars/avatar-blank.png';
import _ from 'lodash';

import { FileText } from 'react-feather';
import {
  isValidFile,
  getFileExtension,
  isFileTypeIsExistInSupportedFileTypes,
} from '../../../utility/Utils';

const ImageUpload = ({
  url = false,
  handleUploadImage,
  handleImageReset,
  loading = false,
  isFileLogo = false,
  size = 100,
  defaultImage = defaultImg,
  uploadTitle = '',
  uploadSubtitle = '',
  setError,
  errors,
  filename,
  fileSize,
  errorMessages,
  enableErrorOptions = true,
  supportedFileTypes = [],
  resetLoading = false,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const uploadImage = (e) => {
    let isError = false;
    if (_.isArray([...e.target.files])) {
      if (setError) {
        [...e.target.files]?.forEach((file) => {
          if (fileSize < Math.round(file?.size / 100) / 10000) {
            setError(
              filename,
              {
                type: 'fileSize',
                message: errorMessages?.['fileSize']
                  ? errorMessages['fileSize']
                  : `File upload max upto ${fileSize} mb`,
              },
              enableErrorOptions ? {} : { shouldFocus: true }
            );
            isError = true;
          }
          if (
            (supportedFileTypes.length &&
              !isFileTypeIsExistInSupportedFileTypes(
                file.name,
                supportedFileTypes
              )) ||
            (!supportedFileTypes.length && !isValidFile(file.name))
          ) {
            setError(
              filename,
              {
                type: 'fileType',
                message: errorMessages?.['fileType']
                  ? errorMessages['fileType']
                  : `${getFileExtension(file.name)} is not a valid file.`,
              },
              enableErrorOptions ? {} : { shouldFocus: true }
            );
            isError = true;
          }
        });
      }
      if (isError) {
        return false;
      } else {
        handleUploadImage(e);
      }
    }
  };

  return (
    <>
      {/* old bacup */}
      <div className='d-none'>
        <div className='me-25'>
          {url || !isFileLogo ? (
            <img
              className='rounded me-50'
              src={url ? url : defaultImage}
              alt='Generic placeholder image'
              height={size}
              width={size}
            />
          ) : (
            <FileText size={70} />
          )}
        </div>
        <div className='d-flex align-items-end mt-75 ms-1'>
          <div className='image-upload-wrapper'>
            <Button
              tag={Label}
              className='mb-75 me-75'
              style={{ width: '110px' }}
              size='sm'
              color='primary'
              disabled={loading}
            >
              {loading && <Spinner size='sm mr-2' />}
              Upload
              <Input
                type='file'
                onChange={uploadImage}
                hidden
                accept='image/*'
              />
            </Button>
            <Button
              className='mb-75'
              color='secondary'
              size='sm'
              outline
              onClick={handleImageReset}
            >
              Reset
            </Button>
            <p className='mb-0'>Allowed JPG, GIF or PNG.</p>
          </div>
        </div>
      </div>
      {/* old bacup end */}

      <div className='imgupload-dropzon'>
        <div className='left-preview'>
          {url || !isFileLogo ? (
            <img
              className=''
              src={url && !imageLoadError ? url : defaultImage}
              alt='Generic placeholder image'
              height={size}
              width={size}
              onError={() => {
                setImageLoadError(true);
              }}
            />
          ) : (
            <div className='fileIcon-wrapper'>
              <FileText size={70} />
            </div>
          )}
        </div>
        <div className='right-details'>
          <div className='contant'>
            <h5 className='title'>{uploadTitle || 'Upload profile picture'}</h5>
            <p className='text'>
              {uploadSubtitle ||
                'The profile picture must be uploaded in JPG, GIF or PNG.'}
            </p>
          </div>
          <div className='image-upload-wrapper'>
            <Button
              tag={Label}
              className='upload-btn'
              color='primary'
              disabled={loading}
            >
              {loading && <Spinner size='sm mr-2' />}
              Upload
              <Input
                type='file'
                onChange={uploadImage}
                hidden
                accept='image/*'
              />
            </Button>
            <Button
              className='reset-btn'
              color='secondary'
              onClick={handleImageReset}
              disabled={resetLoading}
            >
              {resetLoading && <Spinner size='sm mr-2' />}
              Reset
            </Button>
          </div>
        </div>
      </div>
      {errors &&
      errors?.[filename] &&
      errors?.[filename]?.type === 'fileSize' ? (
        <span className='text-danger block' style={{ fontSize: '0.857rem' }}>
          {`File upload max upto ${fileSize} mb`}
        </span>
      ) : (
        errors?.[filename]?.type === 'fileType' && (
          <span className='text-danger block' style={{ fontSize: '0.857rem' }}>
            {`You can only upload valid file(s).`}
          </span>
        )
      )}
    </>
  );
};

export default ImageUpload;
