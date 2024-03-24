import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import * as yup from 'yup';
import { FormField } from '@components/form-fields';

import { SaveButton } from '@components/save-button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../../configs/validationConstant';
import { logger } from '../../../../../utility/Utils';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { useUpdateQuoteStatus } from '../hooks/quoteApis';
import { useUpdateInvoiceStatus } from '../../Invoice/hooks/invoiceApis';
import { getCurrentUser } from '../../../../../helper/user.helper';
import StatusNotes from '../../Invoice/components/StatusNotes';

const billStatusHistoryScheme = yup.object().shape({
  note: yup.string().required(required('Note')),
});

const ChangeBillStatusHistoryModal = ({
  openModal,
  setOpenModal,
  type,
  status,
  recordId,
  setStatusHistoryData,
  setData,
  notes,
}) => {
  const user = getCurrentUser();

  // ** hooks **
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    ...(status !== 'Deny' && {
      resolver: yupResolver(billStatusHistoryScheme),
    }),
  });

  // ** states **

  // ** custom hooks **
  const { updateQuoteStatus, isLoading: quoteStatusLoading } =
    useUpdateQuoteStatus();
  const { updateInvoiceStatus, isLoading: invoiceStatusLoading } =
    useUpdateInvoiceStatus();

  const onSubmit = async (values) => {
    try {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you want to change status?',
      });
      if (result.value) {
        const { note } = values;
        if (type === 'Invoice') {
          const { error, data } = await updateInvoiceStatus(recordId, {
            note,
            status,
            currentUserId: user._id,
            companyId: user.company._id,
          });
          if (!error && data) {
            if (data.length) {
              setData((pre) => ({ ...pre, notes: data }));
            } else {
              if (data?.statusHistoryResult) {
                setData((pre) => ({ ...pre, status }));
                setStatusHistoryData((prev) => [
                  data.statusHistoryResult,
                  ...prev,
                ]);
              }
              if (data?.notes) {
                setData((pre) => ({ ...pre, notes: data?.notes }));
              }
            }
            setOpenModal(false);
          }
        } else {
          const { error, data } = await updateQuoteStatus(recordId, {
            note,
            status,
            currentUserId: user._id,
            companyId: user.company._id,
          });
          if (!error && data) {
            if (data.length) {
              setData((pre) => ({ ...pre, notes: data }));
            } else {
              if (data?.statusHistoryResult) {
                setData((pre) => ({ ...pre, status }));
                setStatusHistoryData((prev) => [
                  data.statusHistoryResult,
                  ...prev,
                ]);
              }
              if (data?.notes) {
                setData((pre) => ({ ...pre, notes: data?.notes }));
              }
            }
            setOpenModal(false);
          }
        }
      }
    } catch (error) {
      logger(error);
    }
  };

  return (
    openModal && (
      <Modal
        isOpen={openModal}
        toggle={() => {
          setOpenModal(!openModal);
        }}
        className='modal-dialog-centered change__bill__status__history__modal_wp'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setOpenModal(!openModal);
          }}
        >
          {status}
        </ModalHeader>
        <ModalBody>
          {/* here put this statusHistoryData for the demo purpose */}
          {notes?.length > 0 && (
            <StatusNotes
              statusNotes={
                notes && notes.length > 0
                  ? notes.filter((n) => n.status === status)
                  : []
              }
            />
          )}
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <FormField
              name='note'
              label={status === 'Deny' ? 'Reason' : 'Note'}
              placeholder='Enter Description'
              type='textarea'
              errors={errors}
              control={control}
            />
          </Form>
        </ModalBody>
        <ModalFooter>
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <Button
              className='me-1'
              color='danger'
              onClick={() => {
                setOpenModal(!openModal);
              }}
            >
              Cancel
            </Button>
            <SaveButton
              loading={quoteStatusLoading || invoiceStatusLoading}
              width='150px'
              type='submit'
              name={'Submit'}
              className='align-items-center justify-content-center'
            ></SaveButton>
          </Form>
        </ModalFooter>
      </Modal>
    )
  );
};

export default ChangeBillStatusHistoryModal;
