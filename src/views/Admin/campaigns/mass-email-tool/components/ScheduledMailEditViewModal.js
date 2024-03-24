// ==================== Packages =======================
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Eye } from 'react-feather';
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Row,
  Badge,
  UncontrolledTooltip,
  Form,
} from 'reactstrap';

// ====================================================
import { useGetMassMailTemplatesAsOptions } from '../../../../templates/service/mailTemplate.services';
import { FormField } from '@components/form-fields';
import {
  useGetScheduledMailDetail,
  useUpdateScheduledMail,
} from '../service/scheduledMassEmail.services';
import { selectBadge } from './ScheduledMassEmailCard';
import { useForm } from 'react-hook-form';
import ContactListingAccordionView from '../../mass-sms-tool/components/ContactListingAccordionView';
import { SaveButton } from '../../../../../@core/components/save-button';

const ScheduledMailEditViewModal = ({
  editViewModal,
  setEditViewModal,
  getScheduledMails,
}) => {
  // ==========================  Hooks =========================
  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  });
  // ============================== States ============================
  const [open, setOpen] = useState(['1', '2']);
  const [previewModal, setPreviewModal] = useState(false);

  // ========================== Custom Hooks =========================
  const { getScheduledMail, isLoading, scheduledMailDetail, contacts } =
    useGetScheduledMailDetail({
      reset,
    });
  const { updateScheduledMail, isLoading: updateLoading } =
    useUpdateScheduledMail({
      setEditViewModal,
      id: editViewModal.id,
      getScheduledMails,
    });

  const { getMailTemplateOptions, mailTemplatesOptions } =
    useGetMassMailTemplatesAsOptions();

  useEffect(() => {
    if (editViewModal.id) {
      getMailTemplateOptions();
      getScheduledMail(editViewModal.id, editViewModal.mode);
    }
  }, [editViewModal.id]);

  const toggle = (id) => {
    const tempOpen = [...open];
    if (tempOpen.includes(id)) {
      const index = tempOpen.indexOf(id);
      if (index > -1) {
        tempOpen.splice(index, 1);
      }
    } else {
      tempOpen.push(id);
    }
    setOpen(tempOpen);
  };

  // const selectedContacts = contacts.filter((obj) => obj.selected);
  // const otherContacts = contacts.filter((obj) => !obj.selected);

  return (
    <>
      <Modal
        isOpen={editViewModal.isOpen}
        toggle={() => {
          setEditViewModal({ isOpen: false, mode: '', id: '' });
        }}
        backdrop='static'
        className='modal-dialog-centered scheduled-mass-email-view-modal modal-dialog-mobile'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            setEditViewModal({ isOpen: false, mode: '', id: '' });
          }}
        >
          Scheduled Mass Email
        </ModalHeader>
        <ModalBody className='scheduled__view__modal__body'>
          {isLoading ? (
            <div className='d-flex align-items-center justify-content-center h-100'>
              <Spinner />
            </div>
          ) : (
            <div>
              {editViewModal.mode === 'edit' ? (
                <Row className='mb-2'>
                  <Col lg='3' md='4' sm='6'>
                    <FormField
                      name='scheduledJobName'
                      label='Title'
                      placeholder='Scheduled job Title'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </Col>
                  <Col lg='3' md='4' sm='6'>
                    <FormField
                      label='Template'
                      name='template'
                      placeholder='Select SMS template'
                      type='select'
                      errors={errors}
                      control={control}
                      options={mailTemplatesOptions}
                    />
                  </Col>
                </Row>
              ) : null}
              <div className='details-wrapper'>
                <div className='details-box'>
                  <div className='inner-wrapper'>
                    <h4 className='label'>Scheduled Job Name</h4>
                    <div className='value'>
                      <p className='text'>
                        {scheduledMailDetail?.scheduledJobName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='details-box'>
                  <div className='inner-wrapper'>
                    <h4 className='label'>Mass Email Title</h4>
                    <div className='value'>
                      <p className='text'>
                        {scheduledMailDetail?.massEmailId?.saveAs
                          ? scheduledMailDetail?.massEmailId?.title
                          : '--'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='details-box'>
                  <div className='inner-wrapper'>
                    <h4 className='label'>Status</h4>
                    <div className='value'>
                      <Badge
                        color={`${selectBadge(scheduledMailDetail.status)}`}
                        pill
                      >
                        {scheduledMailDetail.status?.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className='details-box'>
                  <div className='inner-wrapper'>
                    <h4 className='label'>Total number of contacts</h4>
                    <div className='value'>
                      <p className='text'>
                        {scheduledMailDetail?.contacts?.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='details-box'>
                  <div className='inner-wrapper'>
                    <h4 className='label'>Scheduled Date Time</h4>
                    <div className='value'>
                      <p className='text'>
                        {scheduledMailDetail?.scheduledTime
                          ? moment(
                              new Date(scheduledMailDetail?.scheduledTime)
                            ).format('DD-MM-YY hh:mm A')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='details-box'>
                  <div className='inner-wrapper'>
                    <h4 className='label'>Template</h4>
                    <div className='value'>
                      <div className='template-value-wrapper'>
                        <p className='text'>
                          {scheduledMailDetail?.template?.name}
                          Preview
                        </p>
                        <div className='preview-icon'>
                          <Eye
                            // color='#000000'
                            size={15}
                            className='cursor-pointer'
                            onClick={() => {
                              setPreviewModal(true);
                            }}
                            id='viewTemplate'
                          />
                          <UncontrolledTooltip
                            placement='top'
                            autohide={true}
                            target='viewTemplate'
                          >
                            View Template
                          </UncontrolledTooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ContactListingAccordionView
                isLoading={isLoading}
                open={open}
                toggle={toggle}
                contacts={contacts}
                mode={editViewModal.mode}
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              setEditViewModal({ isOpen: false, mode: '', id: '' });
            }}
          >
            Cancel
          </Button>
          {editViewModal.mode === 'edit' ? (
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(updateScheduledMail)}
              autoComplete='off'
            >
              <SaveButton
                loading={updateLoading}
                disabled={isLoading || updateLoading}
                width='180px'
                outline={true}
                type='submit'
                color='primary'
                name={'Update'}
                className='align-items-center justify-content-center'
              ></SaveButton>
            </Form>
          ) : null}
        </ModalFooter>
      </Modal>

      {/* Preview modal */}
      <Modal
        isOpen={previewModal}
        toggle={() => {
          setPreviewModal(false);
        }}
        className='modal-dialog-centered email-template-preview'
        size='xl'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setPreviewModal(false);
          }}
        >
          {scheduledMailDetail?.template?.name} Preview
        </ModalHeader>
        <ModalBody>
          <div className='mb-2'>
            {scheduledMailDetail?.template?.htmlBody ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: scheduledMailDetail?.template?.htmlBody,
                }}
              ></div>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              setPreviewModal(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ScheduledMailEditViewModal;
