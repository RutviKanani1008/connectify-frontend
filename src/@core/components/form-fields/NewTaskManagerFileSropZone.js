// ** React Imports
import { useState, Fragment, useEffect } from 'react';
import { isArray } from 'lodash';

// ** Reactstrap Imports
import {
  // Card,
  // CardBody,
  Button,
  Spinner,
  // Row,
  // Col,
  UncontrolledTooltip,
  Input,
} from 'reactstrap';

// ** Third Party Imports
import UILoader from '@components/ui-loader';
import { useDropzone } from 'react-dropzone';
import {
  DownloadCloud,
  XCircle,
  Video,
  Eye,
  Edit2,
  Save,
  Download,
  Paperclip,
  Trash,
} from 'react-feather';
import {
  convertHeicFile,
  downloadBlobFile,
  getFileType,
  supportedTypes,
} from '../../../helper/common.helper';
import FilePreviewModal from './FilePreviewModal';
import pdfIcon from '../../../assets/images/icons/file-icons/pdf.png';
import csvIcon from '../../../assets/images/icons/file-icons/csv.png';
import docIcon from '../../../assets/images/icons/file-icons/doc.png';

export const renderFile = (url) => {
  const fileType = getFileType(url);
  switch (fileType) {
    case 'image':
      return <img src={url} />;
    case 'video':
      return (
        <div className='video-icon-wrapper'>
          <Video size='50' src={url} />
        </div>
      );
    case 'document':
      return <img src={docIcon} />;
    case 'pdf':
      return <img src={pdfIcon} />;
    case 'csv':
      return <img src={csvIcon} />;
  }
};

const NewTaskManagerFileDropZone = ({
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
  changeUploadFileName,
  labelName,
  errors = false,

  // showAttachmentsButton = false,
  // fileRowSize = 1,
}) => {
  // ** State
  const [files, setFiles] = useState([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const [updateImageName, setUpdateImageName] = useState(false);
  const [convertLoader, setConvertLoader] = useState(false);

  const getFileExtenstion = (currentFile) => {
    const tempFile = currentFile.split('.');
    const fileType = tempFile[tempFile.length - 1];
    return fileType?.toLowerCase();
  };
  const isValidFile = (currentFile) => {
    return supportedTypes.includes(getFileExtenstion(currentFile));
  };
  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    accept,
    onDrop: async (acceptedFiles) => {
      if (fileSize) {
        let isError = false;
        acceptedFiles?.forEach((file) => {
          if (fileSize < Math.round(file?.size / 100) / 10000) {
            if (setError) {
              setError(
                fieldName,
                {
                  type: 'fileSize',
                  message: `File upload max upto ${fileSize} mb`,
                },
                { shouldFocus: true }
              );
              isError = true;
            }
          }
          if (!isValidFile(file.name)) {
            if (setError) {
              setError(
                fieldName,
                {
                  type: 'fileType',
                  message: `${getFileExtenstion(
                    file.name
                  )} is not a valid file.`,
                },
                { shouldFocus: true }
              );
              isError = true;
            }
          }
        });
        if (isError) {
          return false;
        } else {
          if (filesUpload) {
            const filesToUpload = [...files];

            for (const file of acceptedFiles) {
              if (file.path?.includes('.heic')) {
                setConvertLoader(true);

                /* Convert HEIC Into JPG */
                const convertedFile = await convertHeicFile(file);
                /* */

                setConvertLoader(false);
                filesToUpload.push(convertedFile || file);
              } else {
                filesToUpload.push(file);
              }
            }

            filesUpload(filesToUpload);
          }
        }
      }
    },
  });

  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewFile(null);
  };

  useEffect(() => {
    if (fileURLArray?.length > 0) {
      setUpdateImageName(false);
      let tempFiles = [];
      fileURLArray?.forEach((url) => {
        tempFiles = [
          ...tempFiles,
          {
            name: url?.fileName || '',
            type: getFileType(url.fileUrl),
            url: url.fileUrl.startsWith('https')
              ? url.fileUrl
              : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${url.fileUrl}`,
            baseUrl: `${url.fileUrl}`,
          },
        ];
      });
      setFiles(tempFiles);
    } else {
      setFiles(fileURLArray);
    }
  }, [fileURLArray]);

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

  const handleFileClick = (file) => {
    setCurrentPreviewFile(file?.baseUrl);
    setPreviewModalOpen(true);
  };
  const handleFileDownloadClick = (file) => {
    downloadBlobFile(
      `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.baseUrl}`
    );
  };
  return (
    <div className='custom-fileupload'>
      <UILoader blocking={loading} loader={<></>}>
        <div className='inner-wrapper'>
          {(multiple || (!multiple && files?.length === 0)) && (
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} disabled={disabled} />
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
                <p className='text-secondary'>
                  {fileSize && <>Maximum file size is {fileSize} mb</>}
                </p>
                {(loading || convertLoader) && <Spinner />}
              </div>
              {/* {showAttachmentsButton && ( */}
              <div className='ln-btn'>
                {loading || convertLoader ? <Spinner /> : <Paperclip />}
                <span className='text'>
                  {labelName ? labelName : 'Add Attachment'}
                </span>
              </div>
              {errors?.[fieldName] ? (
                <span
                  className='text-danger block'
                  style={{ fontSize: '0.857rem' }}
                >
                  {errors?.[fieldName]?.message || `Something went wrong`}
                </span>
              ) : null}
              {/* )} */}
            </div>
          )}
          {files.length ? (
            <Fragment>
              <div className='attachment-wrapper'>
                {files.map((file, index) => (
                  <div
                    className='file__card'
                    // md={fileRowSize}
                    key={index}
                  >
                    <div className='inner-border-wrapper'>
                      <div className='inner-wrapper'>
                        <div className='file__preview'>
                          {renderFile(file.url)}
                        </div>
                        <div className='overlay cursor-pointer'>
                          <div className='action-btn-wrapper'>
                            <div className='action-btn view-btn'>
                              <Eye
                                color='#ffffff'
                                onClick={() => {
                                  handleFileClick(file);
                                }}
                              />
                            </div>
                            <div className='action-btn download-btn'>
                              <Download
                                color='#ffffff'
                                onClick={() => {
                                  handleFileDownloadClick(file);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='close-btn'>
                        <XCircle
                          className='close__icon cursor-pointer'
                          color='red'
                          onClick={() => handleRemoveFile(index)}
                          size={24}
                        />
                      </div>
                      <div className='image__edit__wp'>
                        {updateImageName?.index === index ? (
                          <Input
                            className='file__edit__field'
                            label='File Name'
                            name='fileName'
                            placeholder='File Name'
                            type='text'
                            bsSize={'sm'}
                            value={updateImageName?.name || ''}
                            onChange={(e) => {
                              setUpdateImageName({
                                ...updateImageName,
                                name: e.target.value,
                              });
                            }}
                            invalid={!updateImageName?.name}
                          />
                        ) : (
                          <>
                            <p id={`file-name${index}`} className='file-name'>
                              {file.name}
                            </p>
                            <UncontrolledTooltip
                              placement='top'
                              target={`file-name${index}`}
                            >
                              {file.name}
                            </UncontrolledTooltip>
                          </>
                        )}
                        {updateImageName?.index !== index ? (
                          <>
                            <div className='edit-btn'>
                              <Edit2
                                size={15}
                                className={`cursor-pointer text-primary`}
                                onClick={() => {
                                  setUpdateImageName({ ...file, index });
                                }}
                                id={`edit_${index}`}
                              />
                            </div>
                            <UncontrolledTooltip
                              placement='top'
                              autohide={true}
                              target={`edit_${index}`}
                            >
                              Edit File Name
                            </UncontrolledTooltip>
                          </>
                        ) : (
                          <>
                            <div className='save-btn'>
                              <Save
                                size={15}
                                className='cursor-pointer text-primary'
                                onClick={() => {
                                  if (updateImageName?.name !== '') {
                                    changeUploadFileName(updateImageName);
                                  }
                                }}
                              />
                            </div>
                            <UncontrolledTooltip
                              placement='top'
                              autohide={true}
                              target={`edit_${index}`}
                            >
                              Save File Name
                            </UncontrolledTooltip>
                          </>
                        )}
                      </div>
                      <div className='action-btn-wrapper'>
                        {updateImageName?.index !== index ? (
                          <>
                            <div
                              className='action-btn edit-btn'
                              onClick={() => {
                                setUpdateImageName({ ...file, index });
                              }}
                            >
                              <Edit2
                                size={15}
                                className={`cursor-pointer`}
                                id={`edit_${index}`}
                              />
                            </div>
                            <UncontrolledTooltip
                              placement='top'
                              autohide={true}
                              target={`edit_${index}`}
                            >
                              Edit File Name
                            </UncontrolledTooltip>
                          </>
                        ) : (
                          <>
                            <div
                              className='action-btn save-btn'
                              onClick={() => {
                                if (updateImageName?.name !== '') {
                                  changeUploadFileName(updateImageName);
                                }
                              }}
                            >
                              <Save size={15} className='cursor-pointer' />
                            </div>
                            <UncontrolledTooltip
                              placement='top'
                              autohide={true}
                              target={`edit_${index}`}
                            >
                              Save File Name
                            </UncontrolledTooltip>
                          </>
                        )}
                        <div
                          className='action-btn view-btn'
                          onClick={() => {
                            handleFileClick(file);
                          }}
                        >
                          <Eye />
                        </div>
                        <div
                          className='action-btn download-btn'
                          onClick={() => {
                            handleFileDownloadClick(file);
                          }}
                        >
                          <Download />
                        </div>
                        <div
                          className='action-btn delete-btn'
                          onClick={() => handleRemoveFile(index)}
                        >
                          <Trash
                            className='close__icon cursor-pointer'
                            size={24}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {multiple && (
                <div className='d-flex justify-content-center mt-1 remove-all-btn'>
                  <Button
                    className=''
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
          <FilePreviewModal
            visibility={previewModalOpen}
            url={currentPreviewFile}
            toggleModal={handleResetDocumentPreview}
            title='File Upload Preview'
          />
        </div>
      </UILoader>
    </div>
  );
};

export default NewTaskManagerFileDropZone;
