// ==================== Packages =======================
import '@src/assets/scss/file-manager.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Modal, ModalHeader } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// ====================================================
import { FormField } from '@components/form-fields';
import { required } from '../../../configs/validationConstant';
import { SaveButton } from '@components/save-button';
import EmailEditor from './EmailEditor';
import {
  useCheckTemplateAvailable,
  useSaveTemplate,
} from './hooks/templateApis';

const emailSchema = yup.object().shape({
  name: yup
    .string()
    .required(required('Template Name'))
    .max(160)
    .matches(/\S/, 'Message must contain non-whitespace characters'),
  subject: yup
    .string()
    .required(required('Subject'))
    .max(160)
    .matches(/\S/, 'Message must contain non-whitespace characters'),
});

const smsSchema = yup.object().shape({
  name: yup
    .string()
    .required(required('Template Name'))
    .max(160)
    .matches(/\S/, 'Message must contain non-whitespace characters'),
  body: yup
    .string()
    .required('Message Required.')
    .max(160)
    .matches(/\S/, 'Message must contain non-whitespace characters'),
});

export const TemplateForm = ({
  isOpen,
  setIsOpen,
  templateType,
  onSave,
  setEditItem,
  values = null,
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
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(templateType === 'sms' ? smsSchema : emailSchema),
    defaultValues: useMemo(() => {
      return defaultValues;
    }, [defaultValues]),
  });
  // ========================== Custom Hooks =========================
  const { checkEmailTemplate, checkSmsTemplate } = useCheckTemplateAvailable();
  const { saveSmsTemplate, saveEmailTemplate } = useSaveTemplate();

  useEffect(() => {
    if (!isOpen) {
      setDefaultValues({});
      setEditItem(null);
      return;
    }
    let tempDefault = {};
    if (values) {
      const { name, subject, body, _id, jsonBody, htmlBody, tags } = values;
      tempDefault = {
        _id,
        name,
        subject,
        body,
        templateType,
        jsonBody,
        htmlBody,
        tags,
      };
    } else {
      tempDefault = { name: '', subject: '', body: '', templateType, tags: [] };
    }
    reset(tempDefault);
    setDefaultValues(tempDefault);
  }, [isOpen]);

  const onSubmit = async (formValues) => {
    setSubmitLoading(true);
    try {
      const rBody = { ...values, ...formValues };

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
        const { data, error } = await saveEmailTemplate(rBody);
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
