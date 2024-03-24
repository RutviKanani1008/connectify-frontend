import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useLazyGetDirectMailTemplateQuery } from '../../../../redux/api/directMailTemplateApi';
import UILoader from '../../../../@core/components/ui-loader';

const DirectMailTemplatePreviewModal = ({
  isOpen,
  setIsOpen,
  currentTemplate,
}) => {
  const { name, _id } = currentTemplate;

  //   ** State **
  const [headerFooterHeight, setHeaderFooterHeight] = useState({
    headerHeight: '0px',
    footerHeight: '0px',
  });

  // ** Ref **
  const targetRef = useRef(null);

  const [getDirectMailTemplate, { isFetching, currentData }] =
    useLazyGetDirectMailTemplateQuery();

  const body = currentData?.data?.body;
  const header = currentData?.data?.header;
  const footer = currentData?.data?.footer;
  const type = currentData?.data?.type;
  const postcardBack = currentData?.data?.postcardBack;
  const postcardFront = currentData?.data?.postcardFront;

  useEffect(() => {
    getDirectMailTemplate({ id: _id });
  }, []);

  const bodyArray = useMemo(() => {
    return body?.split(
      `<div class="loyal-pageBreak">------------- Page Break -------------</div>`
    );
  }, [body]);

  useEffect(() => {
    const targetNode = targetRef.current;
    // Callback function to be executed when a mutation occurs
    const mutationCallback = () => {
      const headerHeight = `${
        document.getElementsByClassName('template-header')?.[0]?.offsetHeight ||
        0
      }px`;
      const footerHeight = `${
        document.getElementsByClassName('template-footer')?.[0]?.offsetHeight ||
        0
      }px`;
      setHeaderFooterHeight({
        footerHeight,
        headerHeight,
      });
    };
    const observer = new MutationObserver(mutationCallback);
    if (targetNode) {
      // Create a MutationObserver instance
      // Start observing the target node for DOM mutations
      observer.observe(targetNode, { childList: true, subtree: true });
    }
    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, [isFetching]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(false)}
      className='modal-dialog-centered directmail-preview-modal modal-dialog-mobile'
      size='lg'
      backdrop='static'
    >
      <ModalHeader toggle={() => setIsOpen(false)}>{name} Preview</ModalHeader>
      <ModalBody>
        <UILoader blocking={isFetching}>
          <div className='direct-mail-preview-wrapper' ref={targetRef}>
            {!isFetching && (
              <div className='scroll-wrapper fancy-scrollbar'>
                {type === 'letter' ? (
                  bodyArray.map((html, index) => (
                    <div className='direct-mail-print-ll' key={index}>
                      <div className='direct-mail-print'>
                        {header && (
                          <div className='direct-mail-letter-header template-header'>
                            <div
                              className='direct-mail-letter-header-cn'
                              dangerouslySetInnerHTML={{ __html: header }}
                            ></div>
                          </div>
                        )}
                        <div
                          style={{
                            paddingTop: headerFooterHeight.headerHeight,
                            paddingBottom: headerFooterHeight.footerHeight,
                          }}
                          className='direct-mail-letter-contant'
                        >
                          <div
                            className='inner-wrapper'
                            dangerouslySetInnerHTML={{ __html: html }}
                          ></div>
                        </div>
                        {footer && (
                          <div className='direct-mail-letter-footer template-footer'>
                            <div
                              className='direct-mail-letter-footer-cn'
                              dangerouslySetInnerHTML={{ __html: footer }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className='page-wrapper postcard'>
                      <div className='page-wrapper-height'>
                        <div className='page-wrapper-height-inner'>
                          <span className='view-label'>Front View</span>
                          {postcardFront && (
                            <div className='logo-wrapper'>
                              <img
                                style={{ width: '100%' }}
                                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${postcardFront}`}
                              ></img>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='page-wrapper postcard'>
                      <div className='page-wrapper-height'>
                        <div className='page-wrapper-height-inner'>
                          <span className='view-label'>Back View</span>
                          {postcardBack && (
                            <div className='logo-wrapper'>
                              <img
                                style={{ width: '100%' }}
                                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${postcardBack}`}
                              ></img>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </UILoader>
      </ModalBody>
      <ModalFooter>
        <Button color='danger' onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DirectMailTemplatePreviewModal;
