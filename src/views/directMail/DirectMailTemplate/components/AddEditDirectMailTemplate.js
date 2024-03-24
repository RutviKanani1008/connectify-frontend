/* eslint-disable no-unused-vars */
import '@src/assets/scss/file-manager.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Label, Spinner, UncontrolledTooltip } from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import _ from 'lodash';
import {
  useAddDirectMailTemplateMutation,
  useLazyGetDirectMailTemplateQuery,
  useUpdateDirectMailTemplateMutation,
} from '../../../../redux/api/directMailTemplateApi';
import UILoader from '../../../../@core/components/ui-loader';
import { SaveButton } from '@components/save-button';
import { required } from '../../../../configs/validationConstant';
import { FormField } from '../../../../@core/components/form-fields';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { Printer, Settings, X } from 'react-feather';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { getFileName } from '../../../../helper/common.helper';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';
import { NodeSelection } from '@syncfusion/ej2-react-richtexteditor';
import {
  DIRECT_MAIL_DYNAMIC_VARS,
  POST_CARD_SIZE_OPTION,
  POST_CARD_WIDTH_HEIGH,
  TEMPLATE_TYPE_OPTION,
} from '../constant';
import {
  useCreateFolder,
  useGetFolders,
} from '../../../Admin/groups/hooks/groupApis';
import DirectMailPrint from './DirectMailPrint';

import { handlePrintHelper } from '../helper';
import { useReactToPrint } from 'react-to-print';

const directMailTemplateSchema = yup.object().shape({
  name: yup.string().required(required('Template Name')),
});

const AddEditDirectMailTemplate = () => {
  // ** Hooks Vars **
  const history = useHistory();
  const params = useParams();

  // ** Store Variables
  const user = useSelector(userData);
  const [availableFolderDetails, setAvailableFolderDetails] = useState([]);

  // ** Form **
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(directMailTemplateSchema),
    defaultValues: {
      type: 'letter',
      postCardSize: '4.25x6.25',
    },
  });
  // ** Watcher
  const type = useWatch({ control, name: 'type' });
  const postCardSize = useWatch({ control, name: 'postCardSize' });
  const body = useWatch({ control, name: 'body' });
  const header = useWatch({ control, name: 'header' });
  const footer = useWatch({ control, name: 'footer' });

  //   ** State **
  const [showSetting, setShowSetting] = useState(true);
  const [fileState, setFileState] = useState({
    front: '',
    back: '',
    frontLoading: false,
    backLoading: false,
  });
  // const [headerFooterHeight, setHeaderFooterHeight] = useState({
  //   headerHeight: '0px',
  //   footerHeight: '0px',
  // });

  const [headerFooterHeight, setHeaderFooterHeight] = useState({
    headerHeight: '0px',
    footerHeight: '0px',
  });

  // ** Ref **
  const editorRef = useRef(null);
  const templatePrintRef = useRef(null);
  const targetRef = useRef(null);

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();

  //** APIS **
  const [getDirectMailTemplate, { isFetching }] =
    useLazyGetDirectMailTemplateQuery();
  const [addDirectMailTemplate, { isLoading: addLoading }] =
    useAddDirectMailTemplateMutation();
  const [updateDirectMailTemplate, { isLoading: updateLoading }] =
    useUpdateDirectMailTemplateMutation();
  const { createFolder } = useCreateFolder();

  useEffect(() => {
    if (params?.id !== 'add') {
      getDirectMailTemplate({ id: params?.id }).then((response) => {
        const data = response?.data?.data;
        if (data) {
          const tempData = { ...data };
          if (tempData?.folder) {
            // const {} = data.folder;
            tempData.folder = {
              id: tempData?.folder?._id,
              value: tempData?.folder?._id,
              label: tempData?.folder?.folderName,
            };
          }
          reset(tempData);
          if (data.type === 'postcard') {
            setFileState((prev) => ({
              ...prev,
              front: data.postcardFront,
              back: data.postcardBack,
            }));
          }
        }
      });
    }
  }, []);

  const { getFolders } = useGetFolders();

  const getFoldersDetails = async () => {
    const { data, error } = await getFolders({
      company: user.company._id,
      folderFor: 'direct-mail-template',
    });

    if (!error && data) {
      setAvailableFolderDetails(data);
    }
  };

  useEffect(() => {
    getFoldersDetails();
  }, []);

  const onSubmit = async (values) => {
    if (values.type === 'postcard') {
      if (!fileState.front) {
        setError(
          'front',
          {
            type: 'focus',
            message: 'Postcard front image is required',
          },
          { shouldFocus: true }
        );
        return;
      }
      if (!fileState.back) {
        setError(
          'back',
          {
            type: 'focus',
            message: 'Postcard back image is required',
          },
          { shouldFocus: true }
        );
        return;
      }
      values.postcardFront = fileState.front;
      values.postcardBack = fileState.back;
    } else {
      if (!body) {
        setError(
          'body',
          {
            type: 'focus',
            message: 'Body is required.',
          },
          { shouldFocus: true }
        );
        return;
      }
    }
    clearErrors();
    if (params?.id !== 'add') {
      const result = await updateDirectMailTemplate({
        id: params?.id,
        data: {
          ...values,
          folder: values.folder?.value ? values.folder?.value : null,
        },
      });
      if (result?.data?.data) {
        history.push(`${basicRoute}/templates/direct-mail`);
      }
    } else {
      const result = await addDirectMailTemplate({
        data: {
          ...values,
          folder: values.folder?.value ? values.folder?.value : null,
        },
      });
      if (result?.data?.data) {
        history.push(`${basicRoute}/templates/direct-mail`);
      }
    }
  };

  const attachmentUpload = async (e, type) => {
    try {
      const { files } = e.target;
      const img = document.createElement('img');
      const selectedImage = files[0];
      const objectURL = URL.createObjectURL(selectedImage);
      img.onload = async function handleLoad() {
        const requiredWidth = POST_CARD_WIDTH_HEIGH[postCardSize].width;
        const requiredHeight = POST_CARD_WIDTH_HEIGH[postCardSize].height;
        const widthRatio = +postCardSize.split('x')[1];
        const heightRatio = +postCardSize.split('x')[0];

        if (img.width < requiredWidth || img.height < requiredHeight) {
          setError(type, {
            type: 'custom',
            message: `Expected at least ${requiredHeight}px in height and ${requiredWidth}px in width. Provided image was ${img.height} x ${img.width} px.`,
          });
        } else if (
          !(
            (img.height / img.width).toFixed(2) ===
            (heightRatio / widthRatio).toFixed(2)
          )
        ) {
          setError(type, {
            type: 'custom',
            message: `Expected height:width ratio of ${heightRatio}:${widthRatio}. Received ${img.width} by ${img.height}.`,
          });
        } else {
          clearErrors();
          let currentAllFileSize = 0;
          const formData = new FormData();
          formData.append('filePath', `${user?.company?._id}/envelope-log`);
          if (files && files.length) {
            Array.from(files).forEach((file) => {
              currentAllFileSize += file.size;
              formData.append('attachments', file);
            });
          }
          if (currentAllFileSize > 5 * 1024 * 1024) {
            setError(type, {
              type: 'custom',
              message: 'Please upload all attachments less than 5MB',
            });
            e.target.value = '';
          } else {
            if (type === 'front')
              setFileState((prev) => ({ ...prev, frontLoading: true }));
            else setFileState((prev) => ({ ...prev, backLoading: true }));
            const result = await uploadDocumentFileAPI(formData);
            if (type === 'front')
              setFileState((prev) => ({ ...prev, frontLoading: false }));
            else setFileState((prev) => ({ ...prev, backLoading: false }));
            e.target.value = '';
            if (
              result?.data &&
              _.isArray(result?.data.data) &&
              result?.data.data?.[0]
            ) {
              if (type === 'front')
                setFileState((prev) => ({
                  ...prev,
                  front: result?.data.data[0],
                }));
              else
                setFileState((prev) => ({
                  ...prev,
                  back: result?.data.data[0],
                }));
            }
          }
        }
        URL.revokeObjectURL(objectURL);
      };
      img.src = objectURL;
    } catch (error) {
      if (type === 'front')
        setFileState((prev) => ({ ...prev, frontLoading: false }));
      else setFileState((prev) => ({ ...prev, backLoading: false }));
      console.log('Error:attachmentUpload', error);
    }
  };

  const selection = new NodeSelection();
  const bodyArray = useMemo(() => {
    return (body || '').split(
      `<div class="loyal-pageBreak">------------- Page Break -------------</div>`
    );
  }, [body]);

  const insertField = () => {
    editorRef.current?.contentModule.getEditPanel?.().focus();
    const range = selection.getRange(document);
    const saveSelection = selection.save(range, document);
    saveSelection?.restore();
    editorRef.current?.executeCommand(
      'insertHTML',
      `<div class="loyal-pageBreak">------------- Page Break -------------</div><br>`
    );
    editorRef.current?.formatter.saveData?.();
  };

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
          obj.folderFor = 'direct-mail-template';
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
  const handlePrintNote = useReactToPrint({
    content: () => templatePrintRef.current,
  });

  useEffect(() => {
    const targetNode = targetRef.current;
    // Callback function to be executed when a mutation occurs
    const mutationCallback = () => {
      const headerHeight = `${
        document.getElementsByClassName('template-header')?.[0]?.offsetHeight ||
        0
      }px`;
      const footerHeight = `${
        document.getElementsByClassName('template-footer')?.[0]?.offsetHeight ||
        0
      }px`;
      setHeaderFooterHeight({
        footerHeight,
        headerHeight,
      });
    };
    // Create a MutationObserver instance
    const observer = new MutationObserver(mutationCallback);
    // Start observing the target node for DOM mutations
    observer.observe(targetNode, { childList: true, subtree: true });
    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className='direct-mail-preview-page'>
        <h3 className='page-title'>
          <div
            id={'goback'}
            className='back-arrow'
            onClick={() => history.goBack()}
          >
            <UncontrolledTooltip placement='top' target={`goback`}>
              Go Back
            </UncontrolledTooltip>
          </div>
          {params?.id !== 'add' ? 'Edit ' : 'Add'} Direct Mail{' '}
          <div
            className='action-btn print-btn'
            // onClick={() => {
            //   handlePrintHelper({
            //     body,
            //     footer,
            //     header,
            //     postcardFront: fileState.front,
            //     postcardBack: fileState.back,
            //     type,
            //     paddingTop: headerFooterHeight.headerHeight,
            //     paddingBottom: headerFooterHeight.footerHeight,
            //   });
            // }}
            onClick={() => handlePrintNote()}
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
        </h3>
        <div className='direct-mail-preview-scroll'>
          <div className='direct-mail-preview-wrapper'>
            <div className='scroll-wrapper fancy-scrollbar' ref={targetRef}>
              {type === 'letter' ? (
                bodyArray.map((html, index) => (
                  <div className='direct-mail-print-ll' key={index}>
                    <div className='direct-mail-print'>
                      {header && (
                        <div
                          className='direct-mail-letter-header template-header'
                          // id='template-header'
                        >
                          <div
                            className='direct-mail-letter-header-cn'
                            dangerouslySetInnerHTML={{ __html: header }}
                          ></div>
                          {/* <div className='dm-letter-bottom'>Header</div> */}
                        </div>
                      )}
                      <div
                        style={{
                          paddingTop: headerFooterHeight.headerHeight,
                          paddingBottom: headerFooterHeight.footerHeight,
                        }}
                        className='direct-mail-letter-contant'
                      >
                        <div
                          className='inner-wrapper'
                          dangerouslySetInnerHTML={{ __html: html }}
                        ></div>
                      </div>
                      {footer && (
                        <div
                          className='direct-mail-letter-footer template-footer'
                          // id='template-footer'
                        >
                          <div
                            className='direct-mail-letter-footer-cn'
                            dangerouslySetInnerHTML={{ __html: footer }}
                          ></div>
                          {/* <div className='dm-letter-bottom'>Footer</div> */}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className='page-wrapper postcard'>
                    <div className='page-wrapper-height'>
                      <div className='page-wrapper-height-inner'>
                        <span className='view-label'>Front View</span>
                        {fileState.front && (
                          <>
                            <div className='logo-wrapper'>
                              <img
                                style={{ width: '100%' }}
                                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileState.front}`}
                              ></img>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='page-wrapper postcard'>
                    <div className='page-wrapper-height'>
                      <div className='page-wrapper-height-inner'>
                        <span className='view-label'>Back View</span>
                        {fileState.back && (
                          <>
                            <div className='logo-wrapper'>
                              <img
                                style={{ width: '100%' }}
                                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileState.back}`}
                              ></img>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <UILoader blocking={isFetching}>
        <span
          className='addEdit-direct-mail-popup-overllay'
          style={{ display: 'none' }}
        ></span>
        <button
          style={{ display: 'none' }}
          className='direct-mail-setting-btn-sticky-mobile'
          type='button'
          onClick={() => setShowSetting(true)}
        >
          <Settings />
        </button>
        <Form
          className={classNames('auth-login-form addEdit-direct-mail-popup', {
            open: showSetting,
          })}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete='off'
        >
          <button
            className='button-sticky'
            type='button'
            onClick={() => setShowSetting(true)}
          >
            <Settings />
          </button>
          <div className='inner-wrapper'>
            <div className='top-header'>
              <h2 className='title'>
                {params?.id !== 'add' ? 'Edit ' : 'Add'} Direct Mail
              </h2>
              <button
                className='close-btn'
                type='button'
                onClick={() => setShowSetting(false)}
              >
                <X />
              </button>
            </div>
            <div className='scroll-wrapper hide-scrollbar'>
              <div className='mb-1'>
                <FormField
                  name='name'
                  label='Template Name'
                  placeholder='Enter Template Name'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </div>
              <div className='mb-1'>
                <FormField
                  name='description'
                  label='Description'
                  placeholder='Enter Description'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </div>
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
              <div>
                <FormField
                  label='Type'
                  type='radio'
                  control={control}
                  errors={errors}
                  key={type}
                  name='type'
                  options={TEMPLATE_TYPE_OPTION}
                  defaultValue={type}
                />
              </div>
              {type === 'postcard' && (
                <div>
                  <FormField
                    label='Size'
                    type='radio'
                    control={control}
                    errors={errors}
                    key={postCardSize}
                    name='postCardSize'
                    options={POST_CARD_SIZE_OPTION}
                    defaultValue={postCardSize}
                  />
                </div>
              )}
              {type === 'postcard' ? (
                <>
                  <div className='upload-file-wrapper'>
                    <Label>Front</Label>
                    <div className='fileUpload-custom'>
                      <div className='btn-wrapper'>
                        <input
                          type='file'
                          name='front'
                          onChange={(e) => attachmentUpload(e, 'front')}
                        />
                        <button className='uploadFile-btn' type='button'>
                          Upload File
                        </button>
                      </div>
                      <span className='file-name'>
                        {fileState.front
                          ? getFileName(fileState.front)
                          : 'No File Chosen'}
                      </span>
                      {fileState.frontLoading && <Spinner />}
                      {fileState.front && (
                        <button
                          type='button'
                          className='btn-close'
                          onClick={() =>
                            setFileState((prev) => ({ ...prev, front: '' }))
                          }
                        ></button>
                      )}
                    </div>
                    {errors?.front?.message && (
                      <div
                        className='invalid-feedback'
                        style={{ display: 'block' }}
                      >
                        {errors.front.message}
                      </div>
                    )}
                  </div>
                  <div className='upload-file-wrapper'>
                    <Label>Back</Label>
                    <div className='fileUpload-custom'>
                      <div className='btn-wrapper'>
                        <input
                          type='file'
                          name='back'
                          onChange={(e) => attachmentUpload(e, 'back')}
                        />
                        <button className='uploadFile-btn' type='button'>
                          Upload File
                        </button>
                      </div>
                      <span className='file-name'>
                        {fileState.back
                          ? getFileName(fileState.back)
                          : 'No File Chosen'}
                      </span>
                      {fileState.backLoading && <Spinner />}
                      {fileState.back && (
                        <button
                          type='button'
                          className='btn-close'
                          onClick={() =>
                            setFileState((prev) => ({ ...prev, back: '' }))
                          }
                        ></button>
                      )}
                    </div>
                    {errors?.back?.message && (
                      <div
                        className='invalid-feedback'
                        style={{ display: 'block' }}
                      >
                        {errors.back.message}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className='note-loyal'>
                    <span className='label'>Header:</span>
                  </div>
                  <div className='mb-1 letter-header-textEditor'>
                    <SyncfusionRichTextEditor
                      name='rte1'
                      list='#rte1_rte-edit-view'
                      editorRef={editorRef}
                      onChange={(e) => {
                        setValue('header', e.value);
                      }}
                      value={header}
                      mentionOption={DIRECT_MAIL_DYNAMIC_VARS}
                      mentionEnable
                    />
                  </div>
                  <div className='note-loyal'>
                    <span className='label'>Footer:</span>
                  </div>
                  <div className='mb-1 letter-footer-textEditor'>
                    <SyncfusionRichTextEditor
                      name='rte2'
                      list='#rte2_rte-edit-view'
                      editorRef={editorRef}
                      onChange={(e) => {
                        setValue('footer', e.value);
                      }}
                      value={footer}
                      mentionOption={DIRECT_MAIL_DYNAMIC_VARS}
                      mentionEnable
                    />
                  </div>
                  <div className='note-loyal'>
                    <span className='label'>Note:</span>
                    <span className='value'>
                      Use @ to add dynamic contact fields
                    </span>
                  </div>
                  <div className='mb-1'>
                    <SyncfusionRichTextEditor
                      name='rte3'
                      list='#rte3_rte-edit-view'
                      editorRef={editorRef}
                      onChange={(e) => {
                        setValue('body', e.value);
                      }}
                      value={body}
                      mentionOption={DIRECT_MAIL_DYNAMIC_VARS}
                      mentionEnable
                    />
                    <button
                      className='page-break-btn'
                      type='button'
                      onClick={insertField}
                    >
                      Insert Page Break
                    </button>
                    {errors?.body?.message && (
                      <div
                        className='invalid-feedback'
                        style={{ display: 'block' }}
                      >
                        {errors.body.message}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className='submit-btn-wrapper'>
              <SaveButton
                width='100px'
                className=''
                type='submit'
                loading={addLoading || updateLoading}
                name={params?.id !== 'add' ? 'Update' : 'Save'}
              />
            </div>
          </div>
        </Form>
      </UILoader>
      <DirectMailPrint
        body={body}
        type={type}
        header={header}
        footer={footer}
        postcardFront={fileState.front}
        postcardBack={fileState.back}
        ref={templatePrintRef}
        contacts={[{}]}
      />
    </>
  );
};

export default AddEditDirectMailTemplate;
