import { Fragment } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { SaveButton } from '@components/save-button';

const ViewContactDetail = (props) => {
  const {
    openViewDetailModal,
    setOpenViewDetailModal,
    contactDetail,
    currentViewContact,
    currentPipeline,
    companyStages,
    viewContact,
  } = props;
  return (
    <>
      <Modal
        isOpen={openViewDetailModal}
        toggle={() => setOpenViewDetailModal(!openViewDetailModal)}
        className='modal-dialog-centered pipline-contact-info-modal'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => setOpenViewDetailModal(!openViewDetailModal)}
        >
          {'Contact Info'}
        </ModalHeader>
        <ModalBody>
          {contactDetail &&
            currentViewContact &&
            contactDetail.length > 0 &&
            contactDetail.map((contact, index) => {
              if (contact._id === currentViewContact) {
                const currentContactPipeline = contact.pipelineDetails.find(
                  (pipeline) => pipeline.pipeline.id === currentPipeline.id
                );
                const stageName = companyStages?.lanes?.find(
                  (stage) => stage._id === currentContactPipeline?.status?.id
                );
                return (
                  <Fragment key={index}>
                    <div className='contact-info-wrapper'>
                      <div className='contact-info-box'>
                        <div className='label'>First Name:</div>
                        <div className='value'>
                          {contact.firstName ? contact.firstName : '-'}
                        </div>
                      </div>
                      <div className='contact-info-box'>
                        <div className='label'>Last Name:</div>
                        <div className='value'>
                          {contact.lastName ? contact.lastName : '-'}
                        </div>
                      </div>
                      <div className='contact-info-box'>
                        <div className='label'>Email:</div>
                        <div className='value'>
                          {contact.email ? contact.email : '-'}
                        </div>
                      </div>
                      <div className='contact-info-box'>
                        <div className='label'>Phone:</div>
                        <div className='value'>
                          {contact.phone ? contact.phone : '-'}
                        </div>
                      </div>
                      <div className='contact-info-box'>
                        <div className='label'>Address Line 1:</div>
                        <div className='value'>
                          {contact.address1 ? contact.address1 : '-'}
                        </div>
                      </div>
                      <div className='contact-info-box'>
                        <div className='label'>Current Status:</div>
                        <div className='value'>{stageName?.title || '-'}</div>
                      </div>
                    </div>
                    <div className='save-btn-wrapper text-center mt-2'>
                      <SaveButton
                        name={'View Contact'}
                        width='200'
                        onClick={viewContact}
                      />
                    </div>
                  </Fragment>
                );
              }
            })}
        </ModalBody>
      </Modal>
    </>
  );
};

export default ViewContactDetail;
