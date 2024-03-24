import { useForm } from 'react-hook-form';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import { useMultipleGroupChange } from '../hooks/contactsApi';
import { GroupsFormField } from './GroupsFormField';

export const ContactGroupChange = (props) => {
  const {
    openChangeGroupModal,
    handleCloseContactGroupChangeModal,
    selectedContacts,
    selectedRowsFilters,
    selectedRowLength,
  } = props;
  const { changeContactGroups, isLoading } = useMultipleGroupChange();

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });

  const handleOnSubmitGroupChange = async (values) => {
    const tempValues = JSON.parse(JSON.stringify(values));

    if (
      tempValues &&
      (tempValues.group === undefined ||
        tempValues.group === null ||
        tempValues.group === '')
    ) {
      setError(
        'group',
        { type: 'focus', message: 'Please select group' },
        { shouldFocus: true }
      );
      return;
    }
    if (tempValues?.group?.id) {
      tempValues.group = tempValues?.group?.id;
    }
    if (tempValues?.status?.id) {
      tempValues.status = tempValues?.status?.id;
    }
    if (tempValues?.category?.id) {
      tempValues.category = tempValues?.category?.id;
    }
    if (tempValues?.tags?.length) {
      tempValues.tags = tempValues?.tags?.map((tag) => tag.id);
    }
    if (tempValues?.pipelineDetails?.length) {
      tempValues.pipelineDetails = tempValues?.pipelineDetails?.map(
        (pipeline) => {
          if (pipeline?.pipeline?.id) {
            pipeline.pipeline = pipeline?.pipeline?.id;
          }
          if (pipeline?.status?.id) {
            pipeline.status = pipeline?.status?.id;
          }
          return pipeline;
        }
      );
    }
    tempValues.contacts = selectedContacts;
    tempValues.contactFilters = selectedRowsFilters;

    const { error } = await changeContactGroups(tempValues);
    if (!error) {
      handleCloseContactGroupChangeModal(true);
    }
  };
  return (
    <>
      <Modal
        isOpen={openChangeGroupModal}
        toggle={() => {
          handleCloseContactGroupChangeModal();
        }}
        className='modal-dialog-centered'
        backdrop='static'
        size='xl'
      >
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(handleOnSubmitGroupChange)}
          autoComplete='off'
        >
          <ModalHeader
            toggle={() => {
              handleCloseContactGroupChangeModal();
            }}
          >
            <>{selectedRowLength} Contacts will be moved</>
          </ModalHeader>
          <ModalBody>
            <div>
              <GroupsFormField
                setValue={setValue}
                watch={watch}
                control={control}
                errors={errors}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <SaveButton
              name='Submit'
              width='150px'
              type='submit'
              loading={isLoading}
            />
            <Button
              color='danger'
              onClick={() => {
                handleCloseContactGroupChangeModal();
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
};
