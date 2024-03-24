import React, {
  Fragment,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DIRECT_MAIL_DYNAMIC_VARS } from '../constant';

const DirectMailPrint = forwardRef((props, ref) => {
  const {
    contacts = [],
    body,
    type,
    postcardBack,
    postcardFront,
    header,
    footer,
  } = props;
  DirectMailPrint.displayName = 'DirectMailPrint';

  //   ** State **
  const [headerFooterHeight, setHeaderFooterHeight] = useState({
    headerHeight: '0px',
    footerHeight: '0px',
  });

  useEffect(() => {
    const cssPagedMedia = (function () {
      const style = document.createElement('style');
      document.head.appendChild(style);
      return function (rule) {
        style.innerHTML = rule;
      };
    })();
    cssPagedMedia.size = function () {
      cssPagedMedia(
        `@page {size:796.8px 1123.2px !important;  margin: 0px 0px 0px 0px !important; padding: 0px 0px 0px 0px !important;}`
      );
    };
    cssPagedMedia?.size('landscape');
    return () => {
      cssPagedMedia.size = function () {
        cssPagedMedia('@page {size: 595px 842px !important;}');
      };
      cssPagedMedia?.size('landscape');
    };
  }, []);

  useEffect(() => {
    const targetNode = ref.current;
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
    // Create a MutationObserver instance
    const observer = new MutationObserver(mutationCallback);
    // Start observing the target node for DOM mutations
    observer.observe(targetNode, { childList: true, subtree: true });
    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  const bodyArray = useMemo(() => {
    return body?.split(
      `<div class="loyal-pageBreak">------------- Page Break -------------</div>`
    );
  }, [body]);

  return (
    <div ref={ref}>
      {contacts.map((contact, index) => {
        return type === 'letter' ? (
          bodyArray?.map((html, innerIndex) => {
            DIRECT_MAIL_DYNAMIC_VARS.forEach((obj) => {
              html = html?.replaceAll(
                `<span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"${obj.value}\">@${obj.label}</a></span>`,
                `<span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"${
                  obj.value
                }\">${contact?.[obj.value] || ''}</a></span>`
              );
              html = html?.replaceAll(
                `<span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"${obj.value}\"><span style="color: rgb(0, 0, 0); text-decoration: inherit;">@${obj.label}</span></a></span>`,
                `<span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"${
                  obj.value
                }\">${contact?.[obj.value] || ''}</a></span>`
              );
            });

            return (
              <div
                className='direct-mail-print-ll'
                key={`${index}_${innerIndex}`}
              >
                <div className='direct-mail-print'>
                  <Fragment>
                    {header && (
                      <div className='direct-mail-letter-header template-header'>
                        <div
                          className='direct-mail-letter-header-cn'
                          dangerouslySetInnerHTML={{ __html: header }}
                        ></div>
                        {/* <div className='dm-letter-bottom'>Header</div> */}
                      </div>
                    )}
                    <div
                      className='direct-mail-letter-contant'
                      style={{
                        paddingTop: headerFooterHeight.headerHeight,
                        paddingBottom: headerFooterHeight.footerHeight,
                      }}
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
                        {/* <div className='dm-letter-bottom'>Footer</div> */}
                      </div>
                    )}
                  </Fragment>
                </div>
              </div>
            );
          })
        ) : (
          <div className='direct-mail-postcard-print-wrapper' key={index}>
            {postcardFront && (
              <div className='logo-wrapper'>
                <img
                  style={{ width: '100%' }}
                  src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${postcardFront}`}
                ></img>
              </div>
            )}
            {postcardBack && (
              <div className='logo-wrapper'>
                <img
                  style={{ width: '100%' }}
                  src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${postcardBack}`}
                ></img>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default DirectMailPrint;
