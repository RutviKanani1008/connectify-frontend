import { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

export const UserGuideModal = (props) => {
  const {
    showUserGuideModal,
    handleCloseUserGuideModal,
    currentPageUserGuide,
  } = props;
  const [playVideo, setPlayVideo] = useState({
    video: null,
    index: null,
  });

  const handlePlayVideo = (file, index) => {
    if (playVideo?.video) {
      const videoElements = document.querySelectorAll('video');
      videoElements[playVideo.index].pause();
    }
    setPlayVideo({
      video: file?._id,
      index,
    });
    const videoElements = document.querySelectorAll('video');
    videoElements[index].play();
  };
  return (
    <>
      <Modal
        isOpen={showUserGuideModal}
        toggle={() => handleCloseUserGuideModal()}
        className='modal-dialog-centered user-guide-preview-modal modal-dialog-mobile'
        backdrop='static'
        size='lg'
        fade={false}
      >
        <ModalHeader toggle={() => handleCloseUserGuideModal()}>
          {currentPageUserGuide?.page?.pageName || ''} User Guide
        </ModalHeader>
        <ModalBody>
          <div className='text-wrapper'>
            {currentPageUserGuide?.text ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: currentPageUserGuide?.text,
                }}
              ></div>
            ) : (
              ''
            )}
          </div>

          {currentPageUserGuide?.imageAttchments?.length > 0 && (
            <>
              <div className='attachment-wrapper'>
                {currentPageUserGuide?.imageAttchments?.map((file, index) => {
                  return (
                    <div className='img-wrapper' key={index}>
                      <img
                        src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className='video-wrapper'>
            {currentPageUserGuide?.videoAttchments?.length > 0 && (
              <>
                <div className='attachment-wrapper'>
                  {currentPageUserGuide?.videoAttchments?.map((file, index) => {
                    return (
                      <>
                        <div className='video-box' key={index}>
                          <div className='cover-wrapper'>
                            <video
                              width='320'
                              height='240'
                              controls
                              onPause={() => {
                                if (playVideo?.video === file?._id) {
                                  setPlayVideo({
                                    video: null,
                                    index: null,
                                  });
                                }
                              }}
                            >
                              <source
                                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`}
                                type='video/mp4'
                              />
                            </video>
                            {playVideo?.video === file?._id ? (
                              <></>
                            ) : (
                              <>
                                <div className='overllay-wrapper'></div>
                                <button
                                  className='video-play-button'
                                  onClick={() => {
                                    handlePlayVideo(file, index);
                                  }}
                                >
                                  <span></span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
