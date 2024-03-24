import { Fragment } from 'react';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { FormField } from '@components/form-fields';
import NoRecordFound from '../../data-table/NoRecordFound';
import Avatar from '@components/avatar';

const DefaultAvatarFromContact = (props) => {
  const { currentMember } = props;
  const userName =
    currentMember?.firstName || currentMember?.lastName
      ? `${currentMember?.firstName} ${currentMember?.lastName}`
      : currentMember?.email;
  return (
    <>
      <Avatar
        id={`avatar_${currentMember._id}`}
        color={'light-primary'}
        content={userName}
        initials
      />
    </>
  );
};
const AddContactModal = (props) => {
  const {
    addStage,
    clearAddMemberModal,
    type,
    handleSubmit,
    addMemberIntoStage,
    fetchMemberLoader,
    availableCompanyMember,
    setValue,
    availableTypes,
    errors,
    control,
  } = props;

  return (
    <Modal
      isOpen={addStage}
      toggle={() => {
        clearAddMemberModal();
      }}
      className='modal-dialog-centered add-new-contact-contact-pipline-modal'
      backdrop='static'
    >
      <ModalHeader toggle={() => clearAddMemberModal()}>
        Add New {type === availableTypes.contact ? 'Contact' : 'Member'} into{' '}
        {type === availableTypes.contact ? 'Contact' : 'Member'} Pipeline
      </ModalHeader>
      <ModalBody>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(addMemberIntoStage)}
          autoComplete='off'
        >
          {fetchMemberLoader ? (
            <>
              <div className='mb-2 mt-2 text-center'>
                <Spinner color='primary' />
              </div>
            </>
          ) : availableCompanyMember && availableCompanyMember.length > 0 ? (
            availableCompanyMember.map((member, index) => {
              return (
                <Fragment key={index}>
                  <div className='contact-box'>
                    <div className='inner-wrapper'>
                      <div className='img-wrapper'>
                        {member && member.userProfile ? (
                          <img
                            src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${member?.userProfile}`}
                            width='50'
                            alt=''
                          />
                        ) : (
                          <>
                            <DefaultAvatarFromContact currentMember={member} />
                          </>
                        )}
                      </div>
                      <div className='details'>
                        <h3 className='title'>{`${member?.firstName} ${member?.lastName}`}</h3>
                        <div className='email'>{`${member?.email}`}</div>
                      </div>
                      <FormField
                        type='checkbox'
                        error={errors}
                        control={control}
                        name={member._id}
                        onChange={(e) => {
                          setValue(`${member._id}`, e.target.checked);
                        }}
                      />
                    </div>
                  </div>
                </Fragment>
              );
            })
          ) : availableCompanyMember.length === 0 ? (
            <NoRecordFound />
          ) : null}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color='danger' onClick={() => clearAddMemberModal()}>
          Cancel
        </Button>
        <Form onSubmit={handleSubmit(addMemberIntoStage)} autoComplete='off'>
          {availableCompanyMember.length !== 0 ? (
            <Button color='primary'>Add</Button>
          ) : null}
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default AddContactModal;
