import React, { Fragment, forwardRef } from 'react';
import { Col, Row } from 'reactstrap';
import { renderFile } from './EmailTemplatePreviewModal';
import moment from 'moment';

const ContactNotePrint = forwardRef((props, ref) => {
  const { selectedNote, user } = props;

  ContactNotePrint.displayName = 'ContactNotePrint';

  return (
    <div ref={ref} className='print-note-details m-2'>
      <Row>
        {selectedNote.length > 0 &&
          selectedNote.map((note, key) => {
            return (
              <Fragment key={key}>
                <div className='ms-1 me-1 contact-note mt-2' key={key}>
                  <div className='h4 mb-2 text-primary'>{note?.title}</div>
                  {note?.attachments?.length > 0 && (
                    <>
                      <div className='mt-1 file__drop__zone_wp'>
                        <Fragment>
                          <Row>
                            {note?.attachments?.map((file, index) => {
                              return (
                                <Col
                                  md='1'
                                  key={index}
                                  className='file__card m-1'
                                >
                                  <div className=''>
                                    <div className='mb-1'>
                                      <div className='d-flex justify-content-center file__preview__wp'>
                                        <div className='mt-1 file__preview__sm'>
                                          {renderFile(
                                            `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              );
                            })}
                          </Row>
                        </Fragment>
                      </div>
                    </>
                  )}
                  <span>
                    {note?.note ? (
                      <>
                        <p
                          id='tooltipContainer'
                          dangerouslySetInnerHTML={{
                            __html: note?.note,
                          }}
                        ></p>
                      </>
                    ) : (
                      ''
                    )}
                  </span>
                  <span className='text-primary name'>
                    {note?.updatedBy?.firstName} {note?.updatedBy?.lastName}
                  </span>{' '}
                  |{' '}
                  <span className='text-primary'>
                    {moment(note?.updatedAt || new Date()).format(
                      `${user?.company?.dateFormat || 'MM/DD/YYYY'}, HH:mm A`
                    )}
                  </span>{' '}
                </div>
              </Fragment>
            );
          })}
      </Row>
    </div>
  );
});

export default ContactNotePrint;
