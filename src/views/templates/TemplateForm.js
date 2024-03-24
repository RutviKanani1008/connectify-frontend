// ==================== Packages =======================
import '@src/assets/scss/file-manager.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Modal, ModalHeader } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// ====================================================
import { FormField } from '@components/form-fields';
import { required } from '../../configs/validationConstant';
import { SaveButton } from '@components/save-button';
import EmailEditor from './EmailEditor';
import {
  useCheckTemplateAvailable,
  useSaveTemplate,
} from './hooks/templateApis';
import { useSelector } from 'react-redux';
import { userData } from '../../redux/user';
import { useCreateFolder } from '../Admin/groups/hooks/groupApis';

const emailSchema = yup.object().shape({
  name: yup.string().required(required('Template Name')),
  subject: yup.string().required(required('Subject')),
});

const smsSchema = yup.object().shape({
  name: yup.string().required(required('Template Name')),
  body: yup.string().required('Message Required.').max(160),
});

export const TemplateForm = ({
  isOpen,
  setIsOpen,
  templateType,
  onSave,
  setEditItem,
  values = null,
  availableFolderDetails = [],
  setAvailableFolderDetails = () => {},
  defaultFolder = null,
}) => {
  const childRef = useRef();

  // ============================== states ============================
  const [defaultValues, setDefaultValues] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // ========================== Hooks =========================
  const {
    control,
    handleSubmit,
    register,
    reset,
    getValues,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(templateType === 'sms' ? smsSchema : emailSchema),
    defaultValues: useMemo(() => {
      return defaultValues;
    }, [defaultValues]),
  });
  const user = useSelector(userData);

  // ========================== Custom Hooks =========================
  const { checkEmailTemplate, checkSmsTemplate } = useCheckTemplateAvailable();
  const { saveSmsTemplate, saveEmailTemplate } = useSaveTemplate();
  const { createFolder } = useCreateFolder();

  useEffect(() => {
    if (!isOpen) {
      setDefaultValues({});
      setEditItem(null);
      return;
    }
    let tempDefault = {};
    if (values) {
      const {
        name,
        subject,
        body,
        _id,
        jsonBody,
        htmlBody,
        tags,
        folder = null,
      } = values;
      tempDefault = {
        _id,
        name,
        subject,
        body,
        templateType,
        jsonBody,
        htmlBody,
        tags,
        folder,
      };
    } else {
      tempDefault = {
        name: '',
        subject: '',
        body: '',
        templateType,
        tags: [],
        folder: null,
      };
    }
    reset(tempDefault);
    setDefaultValues(tempDefault);
  }, [isOpen]);

  useEffect(() => {
    if (defaultFolder) {
      reset({ folder: defaultFolder });
    }
  }, [defaultFolder]);

  const onSubmit = async (formValues) => {
    setSubmitLoading(true);
    try {
      const rBody = {
        ...values,
        ...formValues,
      };

      if (childRef.current) {
        const { design, html } = await childRef.current.getEditorData();
        if (design && html) {
          rBody.htmlBody = html;
          rBody.jsonBody = JSON.stringify(design);
        }
      }

      if (templateType === 'email') {
        if (!values) {
          const result = await checkEmailTemplate(formValues.name);
          if (result.error) {
            setSubmitLoading(false);
            return setError(
              `name`,
              { type: 'focus', message: result.error },
              { shouldFocus: true }
            );
          }
        }
        const { data, error } = await saveEmailTemplate({
          ...rBody,
          folder: formValues.folder?.value ? formValues.folder?.value : null,
        });
        setIsOpen(false);
        setSubmitLoading(false);
        if (!error) {
          onSave(data);
          setShowEditor(false);
        }
      } else if (templateType === 'sms') {
        if (!values) {
          const result = await checkSmsTemplate(formValues.name);
          if (result.error) {
            setSubmitLoading(false);
            return setError(
              `name`,
              { type: 'focus', message: result.error },
              { shouldFocus: true }
            );
          }
        }
        const { data, error } = await saveSmsTemplate(rBody);
        setIsOpen(false);
        setSubmitLoading(false);
        if (!error) {
          onSave(data);
        }
      }
    } catch (e) {
      setSubmitLoading(false);
      setIsOpen(false);
    }
  };

  let tags = getValues() && getValues()?.tags?.length ? getValues()?.tags : [];
  tags = tags.map((tag) => ({ name: `{{${tag}}}`, value: `{{${tag}}}` }));

  const handleFolderValue = async (value) => {
    try {
      if (value) {
        const tempFolders = JSON.parse(JSON.stringify(availableFolderDetails));
        const isFolderExist = tempFolders.find(
          (folder) => folder?._id === value?.value
        );
        if (!isFolderExist) {
          const obj = {};
          obj.folderName = value.value;
          obj.company = user?.company?._id;
          obj.folderFor = 'mass-email-template';
          obj.order = 0;
          const { data, error } = await createFolder(obj);
          if (!error) {
            tempFolders?.push(data);
            setAvailableFolderDetails(tempFolders);
            setValue('folder', {
              id: data?._id,
              value: data?._id,
              label: data?.folderName,
            });
          }
        }
      } else {
        setValue('folder', null);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        fade={false}
        className={`modal-dialog-centered email-editor-modal email-editor-modal-new modal-dialog-mobile`}
      >
        <ModalHeader
          toggle={() => {
            setIsOpen(!isOpen);
            setShowEditor(false);
          }}
        >
          {values ? 'Edit Template' : 'Add Template'}
        </ModalHeader>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSubmit)}
          autoComplete='off'
        >
          <div className='modal-body'>
            <div className='mb-1'>
              <FormField
                name='name'
                label='Template Name'
                placeholder='Template Name'
                type='text'
                errors={errors}
                control={control}
                {...register(`name`)}
              />
            </div>
            {templateType === 'email' && (
              <>
                <div className='mb-1'>
                  <FormField
                    name='folder'
                    placeholder='Select Folder'
                    label='Folder'
                    type='creatableselect'
                    errors={errors}
                    control={control}
                    isClearable={true}
                    options={availableFolderDetails
                      ?.filter((folder) => folder?._id !== 'unassigned')
                      ?.map((folder) => ({
                        id: folder?._id,
                        value: folder?._id,
                        label: folder?.folderName,
                      }))}
                    onChange={(value) => {
                      handleFolderValue(value);
                    }}
                  />
                </div>
                <div className='mb-1'>
                  <FormField
                    name='subject'
                    label='Subject'
                    placeholder='Subject'
                    type='text'
                    errors={errors}
                    control={control}
                    {...register(`subject`)}
                  />
                </div>
                <div>
                  <a
                    role='button'
                    onClick={() => setShowEditor(true)}
                    className='create-template-btn'
                  >
                    {values ? 'Edit Template' : 'Create Template'}
                  </a>
                </div>
              </>
            )}

            {templateType === 'sms' && (
              <div className='mt-2 mb-2'>
                <FormField
                  name='body'
                  label='Message'
                  placeholder='Enter Message'
                  type='textarea'
                  errors={errors}
                  control={control}
                  {...register(`body`)}
                />
              </div>
            )}

            {showEditor && templateType === 'email' && (
              <EmailEditor
                ref={childRef}
                values={getValues()}
                tags={tags}
                showSaveBtn={false}
              />
            )}
          </div>

          <div className='modal-footer'>
            <SaveButton
              width='100px'
              className=''
              type='submit'
              loading={submitLoading}
              name={values ? 'Update' : 'Save'}
            />
          </div>
        </Form>
      </Modal>
    </>
  );
};
