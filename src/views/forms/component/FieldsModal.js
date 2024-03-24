import {
  Button,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import { isArray } from 'lodash';
import { useEffect, useState } from 'react';
import { Info } from 'react-feather';

const fieldScheme = yup.object().shape({
  label: yup.string().required(required('Label')),
  type: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required()
    .nullable(),
});

export const mappedContacts = [
  {
    label: 'First Name',
    value: 'firstName',
    type: 'text',
  },
  {
    label: 'Last Name',
    value: 'lastName',
    type: 'text',
  },
  {
    label: 'Email',
    value: 'email',
    type: 'email',
  },
  {
    label: 'Website',
    value: 'website',
    type: 'text',
  },
  {
    label: 'Company Name',
    value: 'company_name',
    type: 'text',
  },
  {
    label: 'Phone Number',
    value: 'phone',
    type: 'phone',
  },
  {
    label: 'Address 1',
    value: 'address1',
    type: 'text',
  },
  {
    label: 'Address 2',
    value: 'address2',
    type: 'text',
  },
  {
    label: 'City',
    value: 'city',
    type: 'text',
  },
  {
    label: 'State',
    value: 'state',
    type: 'text',
  },
  {
    label: 'Country',
    value: 'country',
    type: 'text',
  },
  {
    label: 'Zip Code',
    value: 'zip',
    type: 'text',
  },
  {
    label: 'Custom Field',
    value: 'custom-field',
    showInAllField: true,
  },
];

export const availableRelatedFieldType = [
  {
    label: 'Group',
    value: 'groups',
  },
  {
    label: 'Status',
    value: 'status',
  },
  {
    label: 'Categories',
    value: 'categories',
  },
  {
    label: 'Tags',
    value: 'tags',
  },
];

const FieldModal = (props) => {
  const [isFormFieldUnique, setIsFormFieldUnique] = useState(true);
  const [mappedAvailableContactFields, setMappedAvailableContactFields] =
    useState([]);
  const {
    openModal,
    resetField,
    editFieldsId,
    onFieldSubmit,
    availableFieldType,
    register,
    fields,
  } = props;

  const {
    control: fieldControl,
    handleSubmit: fieldHandleSubmit,
    reset: fieldReset,
    getValues: getFieldValues,
    formState: { errors: fieldErrors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(fieldScheme),
    defaultValues: {
      type: '',
      label: '',
    },
  });

  const fieldType = useWatch({
    control: fieldControl,
    name: `type`,
  });

  useEffect(() => {
    if (editFieldsId) {
      fieldReset(editFieldsId);
    }
  }, [editFieldsId]);

  useEffect(() => {
    if (fields.length) {
      const tempMappedOption = [];
      fields.forEach((field) => {
        if (field?.mappedContactField?.value && field.id !== editFieldsId.id) {
          tempMappedOption.push(field.mappedContactField.value);
        }
      });
      setMappedAvailableContactFields(
        mappedContacts.filter(
          (field) =>
            !tempMappedOption.includes(field.value) || field.showInAllField
        )
      );
    } else {
      setMappedAvailableContactFields(mappedContacts);
    }
  }, [fields]);

  const uniqueFormFieldValidate = () => {
    const data = getFieldValues();
    if (isArray(fields)) {
      let remainingField = fields;
      if (editFieldsId) {
        remainingField = fields?.filter((a, i) => i !== editFieldsId);
      }
      if (remainingField?.find((obj) => obj?.label === data?.label)) {
        setIsFormFieldUnique(false);
        return;
      }
    }
    setIsFormFieldUnique(true);
    return false;
  };

  const handleFieldSubmit = (values) => {
    onFieldSubmit(values);
  };
  return (
    <>
      <Modal
        isOpen={openModal}
        toggle={() => resetField()}
        className='modal-dialog-centered add-update-field-modal modal-dialog-mobile'
        backdrop='static'
        size='lg'
      >
        <ModalHeader toggle={() => resetField()}>
          {editFieldsId === false ? 'Add Field' : 'Update Field'}
        </ModalHeader>
        <ModalBody>
          <Form
            className='auth-login-form'
            onSubmit={fieldHandleSubmit(handleFieldSubmit)}
            autoComplete='off'
          >
            <div className='form-field-group'>
              <Label for='fname'>Label</Label>
              <FormField
                name='label'
                placeholder='Enter field label'
                type='text'
                errors={fieldErrors}
                control={fieldControl}
                onChange={() => {
                  uniqueFormFieldValidate();
                }}
              />
              {!isFormFieldUnique && (
                <span
                  className='text-danger block'
                  style={{ fontSize: '0.857rem' }}
                >
                  This label is should be unique!
                </span>
              )}
            </div>
            <div className='form-field-group'>
              <Label for='fname'>Type</Label>
              <FormField
                placeholder='Enter field type'
                type='select'
                name='type'
                errors={fieldErrors}
                control={fieldControl}
                options={availableFieldType}
              />
            </div>
            {!['file'].includes(fieldType?.value) && (
              <div className='form-field-group'>
                <Label for='fname'>
                  Mapped to contact field
                  <Info
                    id={`mapped-to-contact-field`}
                    className='ms-1'
                    height={15}
                    width={15}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    target={`mapped-to-contact-field`}
                  >
                    You can map above field with one of the field of the
                    contact, so whenever someone submits the form contact with
                    mapped fields will be created.
                  </UncontrolledTooltip>
                </Label>
                <FormField
                  placeholder='Select contact field'
                  type='select'
                  name='mappedContactField'
                  errors={fieldErrors}
                  control={fieldControl}
                  options={mappedAvailableContactFields?.filter(
                    (field) =>
                      field.type === fieldType?.value || field.showInAllField
                  )}
                />
              </div>
            )}
            {['select', 'multiSelect'].includes(fieldType?.value) && (
              <div className='form-field-group'>
                <Label for='fname'>Options</Label>
                <FormField
                  placeholder='Enter field options'
                  type='creatableselect'
                  name='options'
                  errors={fieldErrors}
                  control={fieldControl}
                  isMulti={'true'}
                  options={[]}
                />
              </div>
            )}

            <div className='form-field-group'>
              <Label for='fname'>Placeholder</Label>
              <FormField
                placeholder='Enter Placeholder Name'
                type='text'
                errors={fieldErrors}
                control={fieldControl}
                {...register(`placeholder`)}
              />
            </div>

            <div className='form-field-group required-field-wrapper'>
              <FormField
                name='required'
                defaultValue={getFieldValues('required')}
                type='checkbox'
                errors={fieldErrors}
                control={fieldControl}
                {...register(`required`)}
              />
              <Label for='fname'>Required</Label>
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Form
            onSubmit={fieldHandleSubmit(handleFieldSubmit)}
            autoComplete='off'
          >
            <SaveButton
              disabled={!isFormFieldUnique}
              width='100%'
              type='submit'
              name={editFieldsId === false ? 'Add Field' : 'Update Field'}
            ></SaveButton>
          </Form>
          <Button color='danger' onClick={() => resetField()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default FieldModal;
