import { Fragment } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { SaveButton } from '@components/save-button';
import { useSelector } from 'react-redux';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { userData } from '../../../../redux/user';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const ViewContact = (props) => {
  const { openViewDetailModal, setOpenViewDetailModal, currentViewContact } =
    props;
  const user = useSelector(userData);
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();

  const navigateContactDetail = () => {
    if (user.role === 'superadmin' || user.role === 'grandadmin') {
      history.push(`${basicRoute}/${currentViewContact._id}`);
    } else {
      history.push(`${basicRoute}/contact/${currentViewContact._id}`);
    }
  };

  return (
    <>
      <Modal
        isOpen={openViewDetailModal}
        toggle={() => setOpenViewDetailModal(!openViewDetailModal)}
        className='modal-dialog-centered pipline-contact-info-modal modal-dialog-mobile'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => setOpenViewDetailModal(!openViewDetailModal)}
        >
          {'Contact Info'}
        </ModalHeader>
        <ModalBody>
          {currentViewContact && (
            <Fragment>
              <div className='contact-info-box'>
                {currentViewContact?.userProfile && (
                  <img
                    className='rounded me-50'
                    src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${currentViewContact?.userProfile}`}
                    alt='User Profile'
                    height={100}
                    width={100}
                  />
                )}
              </div>
              <div className='contact-info-wrapper'>
                <div className='contact-info-box'>
                  <div className='label'>First Name:</div>
                  <div className='value'>
                    {currentViewContact.firstName
                      ? currentViewContact.firstName
                      : '-'}
                  </div>
                </div>
                <div className='contact-info-box'>
                  <div className='label'>Last Name:</div>
                  <div className='value'>
                    {currentViewContact.lastName
                      ? currentViewContact.lastName
                      : '-'}
                  </div>
                </div>
                <div className='contact-info-box'>
                  <div className='label'>Email:</div>
                  <div className='value'>
                    {currentViewContact.email ? currentViewContact.email : '-'}
                  </div>
                </div>
                <div className='contact-info-box'>
                  <div className='label'>Phone:</div>
                  <div className='value'>
                    {currentViewContact.phone ? currentViewContact.phone : '-'}
                  </div>
                </div>
              </div>
              <div className='save-btn-wrapper text-center mt-2'>
                <SaveButton
                  name={'View Contact'}
                  width='200'
                  onClick={navigateContactDetail}
                />
              </div>
            </Fragment>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default ViewContact;
