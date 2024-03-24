// ==================== Packages =======================
import '@src/assets/scss/file-manager.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Form, Label, Row, UncontrolledTooltip } from 'reactstrap';
import { useForm, useWatch } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { Printer, Settings, X } from 'react-feather';

import { required } from '../../../configs/validationConstant';
import {
  useAddEnvelopeMutation,
  useLazyGetEnvelopeQuery,
  useUpdateEnvelopeMutation,
} from '../../../redux/api/envelopeApi';
import EnvelopePreview from './components/EnvelopePreview';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import UILoader from '../../../@core/components/ui-loader';
import classNames from 'classnames';
import AccordionWrapper from './components/AccordionWrapper';
import {
  DUMMY_ENVELOPE,
  ENVELOPE_SIZE_MAPPER,
  ENVELOPE_SIZE_OPTION,
} from './constant';
import { NodeSelection } from '@syncfusion/ej2-react-richtexteditor';
import { handlePrintHelper } from './helper';

const envelopeSchema = yup.object().shape({
  name: yup.string().required(required('Template Name')),
  body: yup.string().required(required('Envelope Body')).nullable(),
});

const AddEditEnvelop = () => {
  // ** Hooks Vars **
  const history = useHistory();
  const params = useParams();

  // ** Hooks **
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(envelopeSchema),
  });

  // ** Watcher
  const body = useWatch({ control, name: 'body' });
  const margin = useWatch({ control, name: 'margin' });
  const width = useWatch({ control, name: 'width' });
  const height = useWatch({ control, name: 'height' });
  const envelopeSize = useWatch({ control, name: 'envelopeSize' });

  // ** States **
  const [showSetting, setShowSetting] = useState(false);

  // ** Ref **
  const envelopeEditorRef = useRef();

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();

  //** APIS **
  const [addEnvelope, { isLoading: addLoading }] = useAddEnvelopeMutation();
  const [updateEnvelope, { isLoading: updateLoading }] =
    useUpdateEnvelopeMutation();
  const [getEnvelope, { isFetching }] = useLazyGetEnvelopeQuery();

  useEffect(() => {
    if (params?.id !== 'add') {
      getEnvelope({
        id: params.id,
        params: {
          select: '_id,name,body',
        },
      }).then((response) => {
        if (response?.data?.data) {
          const {
            name,
            body: { body, margin, height, width, envelopeSize },
          } = response.data.data;
          reset({
            name,
            body,
            margin,
            height,
            width,
            envelopeSize: envelopeSize
              ? ENVELOPE_SIZE_OPTION.find((obj) => obj.value === envelopeSize)
              : null,
          });
        }
      });
    } else {
      setValue('margin', '20');
      setValue('height', '100');
      setValue('width', '100');
    }
  }, [params?.id]);

  const onSubmit = async (values) => {
    const { name, margin, height, width, envelopeSize, body } = values;
    const bodyObj = {
      name,
      body: {
        envelopeSize: envelopeSize?.value || null,
        body,
        margin,
        height,
        width,
      },
    };
    if (params?.id !== 'add') {
      const result = await updateEnvelope({
        id: params?.id,
        data: { ...bodyObj, _id: params?.id },
      });
      if (result?.data?.data) {
        history.push(`${basicRoute}/envelope`);
      }
    } else {
      const result = await addEnvelope({
        data: bodyObj,
      });
      if (result?.data?.data) {
        history.push(`${basicRoute}/envelope`);
      }
    }
  };

  const selection = new NodeSelection();
  const insertField = () => {
    envelopeEditorRef.current?.contentModule.getEditPanel?.().focus();
    const range = selection.getRange(document);
    const saveSelection = selection.save(range, document);
    saveSelection?.restore();
    envelopeEditorRef.current?.executeCommand('insertHTML', DUMMY_ENVELOPE);
    envelopeEditorRef.current?.formatter.saveData?.();
  };

  const heightInPx = useMemo(() => {
    return envelopeSize
      ? `${ENVELOPE_SIZE_MAPPER[envelopeSize.value].height}px`
      : `${Math.round((+height * 500) / 100)}px`;
  }, [height, envelopeSize?.value]);

  const widthInPx = useMemo(() => {
    return envelopeSize
      ? `${ENVELOPE_SIZE_MAPPER[envelopeSize.value].width}px`
      : `${Math.round((+width * 1177) / 100)}px`;
  }, [width, envelopeSize?.value]);

  return (
    <UILoader blocking={isFetching}>
      <div className='envelope-page'>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSubmit)}
          autoComplete='off'
        >
          <div className='envelope-page-header'>
            <div className='left'>
              <div
                id={'goback'}
                className='back-arrow'
                onClick={() => history.goBack()}
              >
                <UncontrolledTooltip placement='top' target={`goback`}>
                  Go Back
                </UncontrolledTooltip>
              </div>
              <h2 className='title'>
                {params?.id !== 'add' ? 'Edit ' : 'Add'} Envelope
              </h2>
            </div>
            <div className='right'>
              <div
                className='action-btn print-btn'
                onClick={() => {
                  handlePrintHelper({
                    body,
                    heightInPx,
                    widthInPx,
                    marginInPx: margin,
                  });
                }}
              >
                <Printer size={15} id='print_btn' />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target='print_btn'
                >
                  Print
                </UncontrolledTooltip>
              </div>
              <SaveButton
                width='100px'
                className='update-save-btn'
                type='submit'
                loading={addLoading || updateLoading}
                name={params?.id !== 'add' ? 'Update' : 'Save'}
              />
            </div>
          </div>
          <div className='envelope-body'>
            <div
              className={classNames('envelope-setting-form-wrapper', {
                active: showSetting,
              })}
            >
              <button
                type='button'
                className='button-sticky'
                onClick={() => setShowSetting(true)}
              >
                <Settings />
              </button>
              <div className='envelope-setting-box-cn'>
                <div className='preview-enable-header'>
                  <h2 className='title'>Envelope setting</h2>
                  <button
                    type='button'
                    className='close-btn'
                    onClick={() => {
                      setShowSetting(false);
                    }}
                  >
                    <X />
                  </button>
                </div>
                <div className='preview-enable-body'>
                  <div className='scroll-wrapper fancy-scrollbar'>
                    <div className='top-header-envelope-add'>
                      <div className='left'>
                        <Row className=''>
                          <Col md={6}>
                            <FormField
                              name='name'
                              label='Template Name'
                              placeholder='Enter Template Name'
                              type='text'
                              errors={errors}
                              control={control}
                            />
                          </Col>
                          <Col md={6}>
                            <FormField
                              isClearable
                              menuPosition='absolute'
                              label='Envelope Size'
                              name='envelopeSize'
                              type='select'
                              errors={errors}
                              control={control}
                              options={ENVELOPE_SIZE_OPTION}
                            />
                          </Col>
                        </Row>
                      </div>
                      <div className='right'>
                        <Button
                          className='sample-envelope-btn'
                          color='primary'
                          type='button'
                          onClick={() => {
                            insertField();
                            setValue('margin', '20');
                            setValue('height', '100');
                            setValue('width', '100');
                          }}
                        >
                          Add sample envelope
                        </Button>
                        <span className='info' id='sample-envelope-note'>
                          <span className='dot'></span>
                          <span className='line'></span>
                        </span>
                        <UncontrolledTooltip
                          placement='top'
                          target={`sample-envelope-note`}
                        >
                          This is a sample envelope template, after adding it
                          you can change it as per your need
                        </UncontrolledTooltip>
                      </div>
                    </div>
                    <AccordionWrapper
                      className='accordian-loyal-box envelope-design-setting'
                      defaultOpen
                      title='Envelope Design Setting'
                    >
                      <div className='accordian-loyal-body'>
                        <div className='accordian-loyal-body-inner'>
                          <div className='range-row'>
                            <div className='range-col'>
                              <div className='inner-wrapper'>
                                <Label>Margin</Label>
                                <div className='range-slider-wrapper'>
                                  <span className='value'>0px</span>
                                  <FormField
                                    name='margin'
                                    type='range'
                                    errors={errors}
                                    control={control}
                                    min='0'
                                    max='50'
                                    value={margin || '0'}
                                  />
                                  <span className='value'>{margin}px</span>
                                </div>
                              </div>
                            </div>
                            <>
                              <div
                                className={`range-col ${
                                  envelopeSize && 'disable-sec'
                                }`}
                              >
                                <div className='inner-wrapper'>
                                  <Label>Width</Label>
                                  <div className='range-slider-wrapper'>
                                    <span className='value'>0%</span>
                                    <FormField
                                      name='width'
                                      type='range'
                                      errors={errors}
                                      control={control}
                                      min='0'
                                      max='100'
                                      value={width || '0'}
                                    />
                                    <span className='value'>{width}%</span>
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`range-col ${
                                  envelopeSize && 'disable-sec'
                                }`}
                              >
                                <div className='inner-wrapper'>
                                  <Label>Height </Label>
                                  <div className='range-slider-wrapper'>
                                    <span className='value'>0%</span>
                                    <FormField
                                      name='height'
                                      type='range'
                                      errors={errors}
                                      control={control}
                                      min='0'
                                      max='100'
                                      value={height || '0'}
                                    />
                                    <span className='value'>{height}%</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          </div>
                          {envelopeSize && (
                            <>
                              <div className='fixed-width-note'>
                                <span className='label'>Note:</span>
                                <span className='value'>
                                  Remove default envelope size to enable custom
                                  width & height
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </AccordionWrapper>
                  </div>
                </div>
              </div>
            </div>
            {errors?.body?.message && (
              <div className='invalid-feedback' style={{ display: 'block' }}>
                {errors.body.message}
              </div>
            )}
            <div className='envelope-preview-wrapper'>
              <EnvelopePreview
                body={body}
                width={width}
                height={height}
                padding={margin}
                setValue={setValue}
                envelopeSize={envelopeSize?.value}
                envelopeEditorRef={envelopeEditorRef}
              />
            </div>
          </div>
        </Form>
      </div>
    </UILoader>
  );
};

export default AddEditEnvelop;
