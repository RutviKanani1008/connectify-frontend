// ==================== Packages =======================
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
// ====================================================
import { FormField } from '@components/form-fields';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { useFieldArray, useForm } from 'react-hook-form';
import { sendTestSmsTemplate } from '../../../api/smsTemplates';
import { Minus } from 'react-feather';

const SendTestSMSModal = ({
  openSmsModal,
  setCurrentTemplates,
  setOpenSmsModal,
  currentTemplates,
}) => {
  // ========================== Hooks =========================
  const defaultValues = {
    phoneNumbers: [{ number: '' }],
  };

  const {
    control,
    watch,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    shouldUnregister: true,
    name: 'phoneNumbers',
  });

  const phoneNumbers = watch('phoneNumbers');

  const validateContact = (contact) => {
    return contact.match(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    );
  };

  const sendSmsTemplate = () => {
    if (!phoneNumbers) return;

    const allContactsNumbers = phoneNumbers?.map((contact) => contact.number);

    allContactsNumbers.forEach((contact, index) => {
      const sameContactId = allContactsNumbers
        .filter((_, idx) => idx !== index)
        .findIndex((item) => item === contact);

      if (!validateContact(contact)) {
        setError(
          `phoneNumbers[${index}].number`,
          { type: 'focus', message: 'Invalid Number' },
          { shouldFocus: true }
        );
      } else if (sameContactId > -1) {
        setError(
          `phoneNumbers[${sameContactId}].number`,
          { type: 'focus', message: 'Contacts must be unique' },
          { shouldFocus: true }
        );
      }
    });

    if (Object.keys(errors).find((err) => err === 'phoneNumbers')) return;

    if (allContactsNumbers.length) {
      const body = {};
      const item = currentTemplates;
      const bodyContent = item.body;
      body.receiverContacts = allContactsNumbers;
      body.templateType = item.templateType;
      body.templateId = item._id;
      body.company = item.company;
      body.message = bodyContent;
      const toastId = showToast(TOASTTYPES.loading, '', 'Sending SMS...');
      sendTestSmsTemplate(body).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(TOASTTYPES.success, toastId, 'SMS send Successfully!');
        }
      });
      setOpenSmsModal(!openSmsModal);
      setCurrentTemplates(false);
      reset(defaultValues);
    }
  };

  return (
    <Modal
      isOpen={openSmsModal}
      toggle={() => {
        setCurrentTemplates(false);
        setOpenSmsModal(!openSmsModal);
      }}
      className='modal-dialog-centered send-SMS-modal modal-dialog-mobile'
      backdrop='static'
      fade={false}
    >
      <ModalHeader
        toggle={() => {
          setCurrentTemplates(false);
          setOpenSmsModal(!openSmsModal);
        }}
      >
        Send test SMS
      </ModalHeader>
      <ModalBody>
        <>
          <Label className='form-label max-w-90'>Phone Number</Label>
          {fields.map((member, index) => {
            return (
              <div key={member.id} className='repeated-number'>
                <FormField
                  key={`phoneNumbers[${index}].number`}
                  type='phone'
                  name={`phoneNumbers[${index}].number`}
                  placeholder='Phone Number'
                  errors={errors}
                  control={control}
                />
                <Button
                  className={`remove-minus-btn ${
                    index ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  outline
                  color='primary'
                  onClick={() => index && remove(index)}
                >
                  <Minus size={15} />
                </Button>

                {errors['phoneNumbers']?.[index]?.number ? (
                  <div className='text-danger'>
                    {errors['phoneNumbers']?.[index]?.number.message}
                  </div>
                ) : null}
              </div>
            );
          })}
          <div>
            <Button
              className='add-more-btn'
              width='100%'
              onClick={() => append({ number: '' })}
            >
              + Add More
            </Button>
          </div>
        </>
      </ModalBody>
      <ModalFooter>
        <Button color='primary' onClick={sendSmsTemplate}>
          Send
        </Button>
        <Button
          color='danger'
          onClick={() => {
            setCurrentTemplates(false);
            setOpenSmsModal(!openSmsModal);
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SendTestSMSModal;
