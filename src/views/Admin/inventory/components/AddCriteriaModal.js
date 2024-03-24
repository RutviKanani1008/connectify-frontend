import { Button, Form, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { SaveButton } from "../../../../@core/components/save-button";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from '@components/form-fields';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { required } from "../../../../configs/validationConstant";
import { useCheckCriteriaIsExist, useCreateCriteria, useUpdateCriteria } from "../hooks/InventoryProductCriteriaApi";
import { getCurrentUser } from "../../../../helper/user.helper";
import { useEffect } from "react";

const availableFieldType = [
    {
      label: 'Text',
      value: 'text',
    },
    {
      label: 'Dropdown',
      value: 'select',
    }
];

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

const AddCriteriaModal = ({ addModal, setAddModal,  currentCriteriaDetail, getCriteria}) => {
    const {
    control: fieldControl,
    getValues,
    setError,
    reset,
    handleSubmit: fieldHandleSubmit,
    formState: { errors: fieldErrors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(fieldScheme),
     defaultValues: currentCriteriaDetail,
  });
  const { createCriteria, isLoading: createCriteriaLoading } =
    useCreateCriteria();
  const { updateCriteria, isLoading: updateCriteriaLoading } =
    useUpdateCriteria();
  const { checkCriteriaIsExist, isLoading: checkIsCriteiaLoading } =
    useCheckCriteriaIsExist();
  const user = getCurrentUser();

  useEffect(() => {
    reset(currentCriteriaDetail);
  }, [currentCriteriaDetail]);

  const handleFieldSubmit = async(values) => {
      if (getValues('label') && getValues('label') !== currentCriteriaDetail.label) {
      const { error } = await checkCriteriaIsExist({
        label: values?.label?.replace(/ /g, '-').toLowerCase(),
      });

      if (error === 'Criteria Field already exists.') {
        setError(
          `label`,
          { type: 'focus', message: `Label name is already exist.` },
          { shouldFocus: true }
        );
        return;
      }
      }
    const rawData = JSON.parse(JSON.stringify(values));
    rawData.company = user.company._id;

    if (currentCriteriaDetail._id) {
      const { error } = await updateCriteria(
        currentCriteriaDetail._id,
        rawData,
        'Update Criteria...'
      );
      if (!error) {
        setAddModal({ toggle: false });
        getCriteria()
      }
    } else {
      const { error } = await createCriteria(rawData, 'Save Criteria Field...');   
       if (!error) {
        setAddModal({ toggle: false });
        getCriteria()
      }
     
    }
  };
  const fieldType = useWatch({
    control: fieldControl,
    name: `type`,
  });

  return (
    <>
      <Modal
        isOpen={addModal.toggle}
        toggle={() => setAddModal({toggle: false})}
        className='modal-dialog-centered add-update-field-modal'
        backdrop='static'
        size='lg'
      >
        <ModalHeader  toggle={() => setAddModal({toggle: false})}>
         Product Criteria Fields
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
               
              />
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
            {fieldType?.value === 'select' && (
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
                name='placeholder'
                placeholder='Enter Placeholder Name'
                type='text'
                errors={fieldErrors}
                control={fieldControl}
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Form
            onSubmit={fieldHandleSubmit(handleFieldSubmit)}
            autoComplete='off'
          >
            <SaveButton
              width='100%'
              type='submit'
              name='Save'
              loading={
                createCriteriaLoading ||
                updateCriteriaLoading ||
                checkIsCriteiaLoading
              }
            ></SaveButton>
          </Form>
          <Button color='danger' onClick={() => setAddModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
)
}

export default AddCriteriaModal