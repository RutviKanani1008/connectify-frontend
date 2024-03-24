// ==================== Packages =======================
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Eye } from 'react-feather';
import { useForm } from 'react-hook-form';
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
import { SaveButton } from '../../../../../@core/components/save-button';
// ====================================================
import {
  useGetScheduledSMSDetail,
  useUpdateScheduledSMS,
} from '../service/scheduledMassSMS.services';
import ContactListingAccordionView from './ContactListingAccordionView';
import { selectBadge } from './ScheduledMassSMSCard';
import { FormField } from '@components/form-fields';
import { useGetMassSMSTemplatesAsOptions } from '../../../../templates/service/smsTemplate.services';

const ScheduledSMSEditViewModal = ({
  editViewModal,
  setEditViewModal,
  getScheduledSMSList,
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
  const { getScheduledSMS, isLoading, scheduledSMSDetail, contacts } =
    useGetScheduledSMSDetail({ reset });
  const { updateScheduledSMS, isLoading: updateLoading } =
    useUpdateScheduledSMS({
      setEditViewModal,
      id: editViewModal.id,
      getScheduledSMSList,
    });
  const { getSMSTemplates, smsTemplates } = useGetMassSMSTemplatesAsOptions();

  useEffect(() => {
    if (editViewModal.id) {
      getSMSTemplates();
      getScheduledSMS(editViewModal.id, editViewModal.mode);
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

  return (
    <>
      <Modal
        isOpen={editViewModal.isOpen}
        toggle={() => {
          setEditViewModal({ isOpen: false, mode: '', id: '' });
        }}
        backdrop='static'
        className='modal-dialog-centered email-template-preview'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            setEditViewModal({ isOpen: false, mode: '', id: '' });
          }}
        >
          {editViewModal.mode === 'edit'
            ? 'Edit Scheduled Mass SMS'
            : 'Scheduled Mass SMS'}
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
                      options={smsTemplates}
                    />
                  </Col>
                </Row>
              ) : null}
              <div className='form-boarder scheduled-detail-wp'>
                <Row className='mb-1'>
                  <Col sm='12' md='6' lg='4'>
                    <div className='d-flex scheduled-mail-view-info'>
                      <div className='scheduled-mail-view-info-child first'>
                        <span className='h5'>Scheduled Job Name</span>
                      </div>
                      <div className='scheduled-mail-view-info-child second'>
                        <span className='text-primary fw-bold '>
                          {scheduledSMSDetail?.scheduledJobName}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col sm='12' md='6' lg='4'>
                    <div className='d-flex scheduled-mail-view-info'>
                      <div className='scheduled-mail-view-info-child first'>
                        <span className='h5'>Mass SMS Title</span>
                      </div>
                      <div className='scheduled-mail-view-info-child second'>
                        <span className='text-primary fw-bold '>
                          {scheduledSMSDetail?.massSMSId?.saveAs
                            ? scheduledSMSDetail?.massSMSId?.title
                            : '--'}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col sm='12' md='6' lg='4'>
                    <div className='d-flex scheduled-mail-view-info'>
                      <div className='scheduled-mail-view-info-child first'>
                        <span className='h5'>Status</span>
                      </div>
                      <div className='scheduled-mail-view-info-child second'>
                        <Badge
                          color={`light-${selectBadge(
                            scheduledSMSDetail.status
                          )}`}
                          pill
                        >
                          {scheduledSMSDetail.status?.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col sm='12' md='6' lg='4'>
                    <div className='d-flex scheduled-mail-view-info'>
                      <div className='scheduled-mail-view-info-child first'>
                        <span className='h5'>Total number of contacts</span>
                      </div>
                      <div className='scheduled-mail-view-info-child second'>
                        <span className='text-primary fw-bold '>
                          {scheduledSMSDetail?.contacts?.length}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col sm='12' md='6' lg='4'>
                    <div className='d-flex scheduled-mail-view-info'>
                      <div className='scheduled-mail-view-info-child first'>
                        <span className='h5'>Scheduled Date Time</span>
                      </div>
                      <div className='scheduled-mail-view-info-child second'>
                        <span className='text-primary fw-bold '>
                          {scheduledSMSDetail?.scheduledTime
                            ? moment(
                                new Date(scheduledSMSDetail?.scheduledTime)
                              ).format('DD-MM-YY hh:mm A')
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col sm='12' md='6' lg='4'>
                    <div className='d-flex align-items-center scheduled-mail-view-info'>
                      <div className='scheduled-mail-view-info-child first'>
                        <span className='h5 mb-0'>Template</span>
                      </div>
                      <div className='scheduled-mail-view-info-child second d-flex align-items-center'>
                        <span className='text-primary fw-bold template-title'>
                          {scheduledSMSDetail?.template?.name} Preview
                        </span>
                        <Eye
                          color='#a3db59'
                          size={15}
                          className='cursor-pointer ms-1'
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
                  </Col>
                </Row>
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
            Close
          </Button>
          {editViewModal.mode === 'edit' ? (
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(updateScheduledSMS)}
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

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal}
        toggle={() => {
          setPreviewModal(false);
        }}
        className='modal-dialog-centered sms-template-preview'
        size='sm'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setPreviewModal(false);
          }}
        >
          {scheduledSMSDetail?.template?.name} Preview
        </ModalHeader>
        <ModalBody>
          <div className='mb-2'>
            {scheduledSMSDetail?.template?.body ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: scheduledSMSDetail?.template?.body,
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
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ScheduledSMSEditViewModal;
