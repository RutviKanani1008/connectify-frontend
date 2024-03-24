import React, { Fragment, useEffect, useState } from 'react';
// ** React Imports
import { useParams, Link } from 'react-router-dom';

// ** Styles
import '@styles/react/pages/page-authentication.scss';
import UILoader from '@components/ui-loader';
import { decrypt, downloadFile, getFileType } from '../../helper/common.helper';
import { useGetNoteDetail } from './hooks/useShareNoteApi';
import { Button, Label } from 'reactstrap';
import { renderFile } from '../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { ArrowRight, Download, Eye } from 'react-feather';
import FilePreviewModal from '../../@core/components/form-fields/FilePreviewModal';
import moment from 'moment';
import Avatar from '../../@core/components/avatar';
import defaultAvatar from '@src/assets/images/avatars/avatar-blank.png';
import { useSelector } from 'react-redux';
import { userData } from '../../redux/user';
import NoRecordFound from '../../@core/components/data-table/NoRecordFound';

const SharedNote = () => {
  // const { executeRecaptcha } = useGoogleReCaptcha();
  const params = useParams();
  const user = useSelector(userData);
  // const history = useHistory();
  const [currentNoteDetail, setCurrentNoteDetail] = useState(null);
  const { getNote, isLoading: noteDetailLoading } = useGetNoteDetail();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const [isPrivareNote, setIsPrivateNote] = useState(false);

  const availableModelNames = {
    user: 'Users',
    contact: 'Contacts',
  };

  useEffect(() => {
    if (params.id) {
      getNoteDetails();
    }
  }, [params]);

  const getNoteDetails = async () => {
    const noteDetails = JSON.parse(decrypt(params.id));
    if (noteDetails && Object.keys(noteDetails).length) {
      const noteKey = Object.keys(noteDetails)[0];
      if (
        (noteKey === 'user' || noteKey === 'contact') &&
        (noteDetails?.linkType === 'public-link' ||
          (noteDetails?.linkType === 'private-link' && user?._id))
      ) {
        const { data, error } = await getNote(noteDetails[noteKey], {
          modelName: availableModelNames[noteKey],
        });
        if (!error) {
          setCurrentNoteDetail(data);
        }
      } else {
        setIsPrivateNote(true);
        // console.log('NOOOOOO');
      }
    }
  };

  const handleFileClick = (file) => {
    setCurrentPreviewFile(file?.baseUrl);
    setPreviewModalOpen(true);
  };

  const handleFileDownloadClick = (file) => {
    downloadFile(`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.fileUrl}`);
  };

  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewFile(null);
  };

  const redirectToNote = () => {
    window.open(
      `${window.location.origin}/${currentNoteDetail?.createdBy?.role}/${
        currentNoteDetail?.modelName === 'Contacts' ? 'contact' : 'users'
      }/${currentNoteDetail?.modelId}/notes?folder=${
        currentNoteDetail?.folder ? currentNoteDetail?.folder : 'unassigned'
      }&note=${currentNoteDetail?._id}`,
      '_blank'
    );
  };

  return (
    <div className='single-note-page'>
      <div className='single-note-inner-page'>
        <UILoader blocking={noteDetailLoading} className=''>
          <div>
            {!noteDetailLoading && currentNoteDetail ? (
              <>
                {/* Company Details */}
                <div className='company-details'>
                  {currentNoteDetail.company?.companyLogo ? (
                    <>
                      <Avatar
                        img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${currentNoteDetail.company?.companyLogo}`}
                        imgHeight='32'
                        imgWidth='32'
                        content={`${currentNoteDetail.company?.name}`}
                        initials
                      />
                    </>
                  ) : (
                    <Avatar
                      color={'light-primary'}
                      content={`${currentNoteDetail.company?.name}`}
                      initials
                    />
                  )}
                  <Label>{currentNoteDetail.company?.name}</Label>
                  <Button
                    style={{ width: '230px' }}
                    color='primary'
                    onClick={() => {
                      redirectToNote();
                    }}
                  >
                    View in Connectify CRM <ArrowRight size={15} />
                  </Button>
                </div>
                {/* Note Title */}
                <h2 className='note-title'>{currentNoteDetail?.title}</h2>
                <div className='note-author-time'>
                  {currentNoteDetail?.updatedBy?.userProfile &&
                  currentNoteDetail?.updatedBy?.userProfile !== false &&
                  currentNoteDetail?.updatedBy?.userProfile !== null &&
                  currentNoteDetail?.updatedBy?.userProfile !== undefined ? (
                    <>
                      <Avatar
                        img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${currentNoteDetail?.updatedBy?.userProfile}`}
                        imgHeight='32'
                        imgWidth='32'
                        content={`${currentNoteDetail?.updatedBy?.firstName} ${currentNoteDetail?.updatedBy?.lastName}`}
                        initials
                      />
                    </>
                  ) : (currentNoteDetail?.updatedBy?.firstName ||
                      currentNoteDetail?.updatedBy?.lastName) &&
                    (currentNoteDetail?.updatedBy?.firstName !== '' ||
                      currentNoteDetail?.updatedBy?.lastName) ? (
                    <>
                      <Avatar
                        color={'light-primary'}
                        content={`${currentNoteDetail?.updatedBy?.firstName} ${currentNoteDetail?.updatedBy?.lastName}`}
                        initials
                      />
                    </>
                  ) : (
                    <>
                      <Avatar
                        img={defaultAvatar}
                        imgHeight='32'
                        imgWidth='32'
                      />
                    </>
                  )}
                  <div className='right-details'>
                    <span className='author-name'>
                      {currentNoteDetail?.updatedBy?.firstName}{' '}
                      {currentNoteDetail?.updatedBy?.lastName}
                    </span>
                    <span className='note-titme'>
                      {moment(
                        currentNoteDetail?.createdAt || new Date()
                      ).format(`${'MM/DD/YYYY'} | HH:mm A`)}
                    </span>
                  </div>
                </div>

                <div className='note-discription'>
                  {currentNoteDetail?.note ? (
                    <>
                      <p
                        id='tooltipContainer'
                        dangerouslySetInnerHTML={{
                          __html: currentNoteDetail?.note,
                        }}
                      ></p>
                    </>
                  ) : (
                    ''
                  )}
                </div>
                {currentNoteDetail?.attachments?.length > 0 && (
                  <>
                    <div className='attachment-wrapper'>
                      {currentNoteDetail?.attachments?.map((file, index) => {
                        return (
                          <Fragment key={index}>
                            <div className='file__card'>
                              <div className='inner-border-wrapper'>
                                <div className='inner-wrapper'>
                                  <div className='file__preview'>
                                    {renderFile(
                                      `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`
                                    )}
                                  </div>
                                  <div
                                    className='overlay cursor-pointer'
                                    onClick={() => {
                                      handleFileClick({
                                        name: file.fileName,
                                        type: getFileType(file?.fileUrl),
                                        url: `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`,
                                        baseUrl: `${file?.fileUrl}`,
                                      });
                                    }}
                                  >
                                    <div className='action-btn-wrapper'>
                                      <div className='action-btn view-btn'>
                                        <Eye color='#ffffff' />
                                      </div>
                                      <div className='action-btn download-btn'>
                                        <Download
                                          color='#ffffff'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleFileDownloadClick(file);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Fragment>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {isPrivareNote ? (
                  <>
                    <div className='private-note'>
                      <p className='normal-text'>
                        This is private note, please{' '}
                        <Link
                          className='login-link'
                          to='/login'
                          onClick={() => {
                            localStorage.setItem(
                              'redirectUrl',
                              window.location.href
                            );
                          }}
                        >
                          Login
                        </Link>{' '}
                        to view this note
                      </p>
                      <div className='private-note-img'>
                        <img src='/images/private-note.png' alt='' />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {!noteDetailLoading && !currentNoteDetail && (
                      <>
                        <NoRecordFound />
                      </>
                    )}
                  </>
                )}
              </>
            )}
            <FilePreviewModal
              visibility={previewModalOpen}
              url={currentPreviewFile}
              toggleModal={handleResetDocumentPreview}
              title='File Upload Preview'
            />
            <div className='powered-by'>
              <div className='inner-wrapper'>
                <p className='powered-by-text'>Powered by Connectify CRM</p>
                <div className='logo-wrapper'>
                  <a
                    className='logo-link'
                    href='https://xyz.com/'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <svg
                      version='1.1'
                      id='Layer_1'
                      x='0px'
                      y='0px'
                      viewBox='0 0 491.2 233.9'
                    >
                      <path
                        style={{ fill: '#8DC247' }}
                        d='M432.3,161.6v23c0,2.9,0.5,5.6,1.6,8.2c1.1,2.6,2.5,4.8,4.5,6.7c1.9,1.9,4.1,3.4,6.7,4.5
c2.6,1.1,5.3,1.7,8.2,1.7h5.2v23.5h-5.2c-6.2,0-12-1.2-17.4-3.5c-5.4-2.4-10.2-5.5-14.2-9.6c-4-4-7.2-8.8-9.5-14.2
c0-0.1-0.1-0.2-0.1-0.2c0,0.1-0.1,0.2-0.1,0.2c-2.3,5.4-5.5,10.2-9.5,14.2c-4,4-8.8,7.2-14.2,9.6c-5.4,2.3-11.2,3.5-17.4,3.5h-61.6
c-6.2,0-12-1.2-17.4-3.5c-5.4-2.4-10.2-5.5-14.2-9.6c-4-4-7.2-8.8-9.5-14.2c-2.3-5.4-3.4-11.2-3.4-17.4v-52.9
c10.6,8,23.5,6.5,23.5,6.5c0,0.2,0,1.2,0,1.4c0,0,0,0,0,0v44.9c0,2.9,0.6,5.6,1.7,8.2c1.1,2.6,2.6,4.8,4.5,6.7
c1.9,1.9,4.1,3.4,6.6,4.5c2.5,1.1,5.2,1.7,8.1,1.7h7.9v-42h23.4v42h30c3,0,5.8-0.6,8.4-1.7s4.8-2.6,6.7-4.5c1.9-1.9,3.4-4.1,4.5-6.7
c1.1-2.6,1.6-5.3,1.6-8.2c0-5.3-1.7-9.9-5-13.8l-5.4-6.4c-2,3-4.3,5.9-6.8,8.7c-2.5,2.7-5.3,5.1-8.4,7.2s-6.4,3.7-10.1,4.9
c-3.6,1.2-7.6,1.8-12,1.8v-23.3c2.9,0,5.6-0.7,8.2-2c2.5-1.3,4.7-3.1,6.6-5.4c1.9-2.2,3.4-4.8,4.5-7.6c1.1-2.8,1.7-5.7,1.7-8.6h0
v-4.6c9.7,5.9,25.6,4,25.6,4c0.3,0.3,0.5,0.6,0.5,0.6h0l14.8,17.1c1,1.4,2,2.8,2.9,4.2v-58.5h23.5v35.2h26.2v23.5H432.3z'
                      />
                      <g>
                        <circle
                          style={{ fill: '#8DC247' }}
                          cx='328.9'
                          cy='146.9'
                          r='12.2'
                        />
                      </g>
                      <path
                        style={{ fill: '#221F1F' }}
                        d='M370,32.1v26.7c0.2-1.6,0.2-3.3,0.2-5V32.1H370z M242,80.1c0,5.3,0.8,10.4,2.5,15.2V64.6
C242.9,69.5,242,74.7,242,80.1z M344.6,31.7v0.3H370v-0.3H344.6z M242,80.1c0,5.3,0.8,10.4,2.5,15.2V64.6
C242.9,69.5,242,74.7,242,80.1z'
                      />
                      <path
                        style={{ fill: '#221F1F' }}
                        d='M392.6,103.1c-3.2,0-6.1-0.6-8.8-1.8c-2.7-1.2-5.1-2.8-7.2-4.9s-3.7-4.5-4.9-7.2
c-1.2-2.8-1.8-5.7-1.8-8.9V32.1h-25.6v21.7c0,3.2-0.6,6.2-1.8,9c-1.2,2.6-2.7,4.9-4.6,6.9c-0.6-3.1-1.6-6-2.8-8.9
c-2.6-5.8-6-11-10.4-15.3c-4.4-4.4-9.5-7.8-15.5-10.3s-12.2-3.7-18.9-3.7s-13,1.3-18.8,3.8s-11,6-15.4,10.4
c-4.4,4.4-7.8,9.6-10.3,15.5c-0.5,1.2-0.9,2.3-1.3,3.5V31.8h-25.5V80c0,3-0.6,5.9-1.8,8.6c-1.2,2.7-2.8,5.1-4.9,7.2
c-2,2.1-4.5,3.7-7.2,4.9c-2.8,1.2-5.7,1.8-8.9,1.8s-6.1-0.6-8.8-1.7c-2.7-1.1-5.1-2.7-7.2-4.8c-2.1-2-3.7-4.4-4.9-7.2
c-1.2-2.7-1.9-5.6-2-8.8V31.8h-25.2v28.3c-2.5-5.2-5.7-9.9-9.7-13.9c-4.4-4.3-9.5-7.8-15.3-10.2c-5.9-2.5-12.1-3.7-18.8-3.7
c-6.7,0-12.9,1.3-18.7,3.8c-5.8,2.5-10.9,6-15.2,10.3c-4.3,4.4-7.8,9.5-10.2,15.4c-2.5,5.9-3.7,12.2-3.7,18.8
c0,6.7,1.3,12.9,3.8,18.7c0.6,1.3,1.2,2.6,1.9,3.8h-9.7c-3.1,0-6.1-0.6-8.8-1.8c-2.7-1.2-5.1-2.8-7.2-4.9c-2-2-3.7-4.5-4.9-7.2
c-1.2-2.8-1.8-5.7-1.8-8.9V4.6H4.5v75.7c0,6.7,1.2,12.9,3.7,18.8c2.5,5.9,5.9,11,10.2,15.3c4.4,4.3,9.5,7.8,15.3,10.3
c5.9,2.5,12.1,3.8,18.8,3.8h53.1c6.4-0.1,12.5-1.3,18.1-3.8c5.8-2.5,10.8-6,15.1-10.3c4.3-4.3,7.7-9.5,10.2-15.3
c0.6-1.4,1.1-2.8,1.5-4.2c0.4,1.3,0.9,2.5,1.5,3.8c2.6,5.8,6.1,10.9,10.5,15.2c4.4,4.3,9.5,7.8,15.4,10.3c5.9,2.5,12.1,3.8,18.8,3.8
c4,0,7.9-0.5,11.8-1.5c3.9-1,7.4-2.5,10.7-4.4c0,0.7,0,1.1,0,1.8h0v55.9c0,3.3-0.7,6.3-1.9,9.1c-1.2,2.8-2.9,5.2-5,7.3
c-2.1,2.1-4.6,3.7-7.3,4.9c-2.8,1.2-5.8,1.7-9.1,1.7c-3.1,0-6.1-0.6-8.8-1.8c-2.7-1.2-5.1-2.9-7.2-5c-2.1-2.1-3.7-4.6-4.8-7.3
c-1.1-2.8-1.7-5.8-1.7-9.1c0-5.6,1.8-10.5,5.4-14.9l27.7-32.2l-32.4-0.8l-13,14.9c-0.5,0.9-1,1.5-1.5,2c-0.5,0.5-1,1-1.5,1.6
c-3.1,4-5.6,8.5-7.4,13.5c-1.8,5-2.7,10.3-2.7,15.9c0,6.6,1.2,12.9,3.7,18.8c2.5,5.9,5.9,11,10.2,15.4c4.3,4.4,9.4,7.9,15.2,10.4
c5.8,2.5,12,3.8,18.5,3.8c6.6,0.1,12.9-1.1,18.8-3.6c5.9-2.5,11-6,15.4-10.3c4.4-4.4,7.9-9.5,10.5-15.4c2.6-5.9,3.9-12.2,4.1-18.8
v-55.6h0c0-0.6,0.1-1.1,0.1-1.7v-27c0.4,1.2,0.9,2.4,1.4,3.6c2.6,5.8,6.1,11,10.5,15.4c4.4,4.4,9.6,7.8,15.5,10.3
c5.2,2.2,10.8,3.4,16.8,3.7l0.1,0h1.3c0.3,0,0.6,0,0.9,0c0.4,0,0.8,0,1.1,0h6.8v-5.7c0-3.2,0.6-6.1,1.8-8.9c1.2-2.7,2.9-5.2,4.9-7.2
c2.1-2.1,4.5-3.7,7.3-4.9c0.2-0.1,0.3-0.1,0.5-0.2v21.3c0,0,0,0,0,0v4.8h25.4V99.4c0.4-0.2,0.8-0.3,1.3-0.5c2.4-1,4.6-2.1,6.8-3.5
c0.4,1.2,0.8,2.4,1.3,3.6c2.5,5.9,5.9,11,10.2,15.3c4.4,4.3,9.5,7.8,15.3,10.3c5.9,2.5,12.1,3.8,18.8,3.8h10.7v-25.4H392.6z
 M125.5,89.1c-1.2,2.8-2.8,5.3-4.9,7.3c-2.1,2-4.5,3.7-7.2,4.9c-2.8,1.2-5.7,1.8-8.9,1.8s-6.1-0.6-8.9-1.7c-2.8-1.1-5.2-2.7-7.2-4.8
c-2.1-2-3.7-4.4-4.9-7.2c-1.2-2.7-1.8-5.6-1.8-8.8c0-3.1,0.6-6.1,1.8-8.9c1.2-2.8,2.8-5.2,4.9-7.3c2-2.1,4.4-3.8,7.2-5
c2.7-1.2,5.6-1.8,8.8-1.8c3.1,0,6.1,0.6,8.9,1.7c2.8,1.2,5.2,2.8,7.3,4.8c2.1,2.1,3.8,4.4,5,7.2c1.2,2.7,1.8,5.6,1.8,8.8
S126.7,86.2,125.5,89.1z M303,78c-5.9,2.5-11.1,5.9-15.5,10.3c-3.4,3.4-6.2,7.2-8.5,11.5c-1.8-1-3.4-2.2-4.8-3.6
c-2.1-2.1-3.7-4.5-4.9-7.2c-1.2-2.7-1.8-5.7-1.8-8.9s0.6-6.2,1.8-9c1.2-2.8,2.9-5.3,4.9-7.4s4.5-3.8,7.2-5c2.8-1.2,5.7-1.8,8.9-1.8
c3.2,0,6.1,0.6,9,1.7c2.8,1.2,5.3,2.8,7.4,4.8c2.1,2.1,3.8,4.5,5,7.2c0.6,1.4,1.1,2.8,1.4,4.3C309.6,75.6,306.3,76.6,303,78z'
                      />
                      <circle
                        style={{ fill: '#221F1F' }}
                        cx='477.2'
                        cy='217.8'
                        r='12.2'
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </UILoader>
      </div>
    </div>
  );
};

export default SharedNote;
