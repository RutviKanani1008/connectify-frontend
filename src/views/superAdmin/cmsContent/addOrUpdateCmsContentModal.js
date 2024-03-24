import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import { useEffect, useRef, useState } from 'react';
import { SaveButton } from '../../../@core/components/save-button';
import { selectThemeColors } from '../../../utility/Utils';
import Select from 'react-select';
import { usePostCmsContent, useUpdateCmsContent } from './hooks/useApis';
import {
  pageGroupComponent,
  pageGroupOptions,
} from '../../forms/component/OptionComponent';
import { FormField } from '../../../@core/components/form-fields';
import SyncfusionRichTextEditor from '../../../components/SyncfusionRichTextEditor';
import { useDispatch } from 'react-redux';
import {
  storeAddCmsPageContent,
  storeCmsPageContent,
} from '../../../redux/cmsContent';

const validationSchema = yup.object().shape({
  content: yup.string().nullable().required(required('Content')),
  title: yup.string().nullable().required(required('Title')),
});

export const CmsContentModal = (props) => {
  const {
    isModalShow,
    handleCloseModal,
    availablePages,
    currentCmsContent,
    availableCmsContent,
    addOrUpdateCmsContent,
    setAddOrUpdateCmsContent,
  } = props;
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  // ** Ref **
  const editorRef = useRef(null);
  const dispatch = useDispatch();
  const { addCmsContent, isLoading: addCmsContentLoading } =
    usePostCmsContent();
  const { updateCmsContent, isLoading: updateCmsContentLoading } =
    useUpdateCmsContent();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (currentCmsContent) {
      reset(currentCmsContent);
    }
  }, [currentCmsContent]);

  useEffect(() => {
    handleSetPages();
  }, [availablePages]);

  const handleSetPages = () => {
    const tempOptions = [];
    availablePages.forEach((parentPage) => {
      const options = [];
      const obj = {};
      obj['label'] = parentPage?.pageName;
      if (parentPage?.allowCms) {
        options.push({
          ...parentPage,
          label: parentPage?.pageName,
          value: parentPage?._id,
        });
      }
      if (parentPage.children.length) {
        parentPage.children
          ?.sort((a, b) => a?.order - b?.order)
          ?.forEach((child) => {
            if (child?.allowCms) {
              options.push({
                ...child,
                label: child?.pageName,
                value: child?._id,
              });
            }
          });
      }
      obj['options'] = options;
      tempOptions.push(obj);
      // }
    });
    setPages(tempOptions);
  };

  const onSubmit = async (values) => {
    if (values.page?._id) {
      values.page = values.page?._id;
    }
    if (currentCmsContent) {
      const { data, error } = await updateCmsContent(
        currentCmsContent._id,
        values
      );
      if (!error) {
        dispatch(storeCmsPageContent({ pageId: data.page.pageId, data }));
        handleCloseModal(data);
      }
    } else {
      const { data, error } = await addCmsContent(values);
      if (!error) {
        dispatch(storeAddCmsPageContent(data));

        handleCloseModal(data);
      }
    }
  };

  const pageWatch = useWatch({
    control,
    name: `page`,
  });

  const handleChangePage = (selectedOption) => {
    const isExist = availableCmsContent.find(
      (cmsContent) => cmsContent?.page?._id === selectedOption?._id
    );

    if (isExist) {
      setAddOrUpdateCmsContent({
        ...addOrUpdateCmsContent,
        cmsContent: {
          ...isExist,
          page: {
            ...isExist.page,
            label: isExist.page?.pageName,
            value: isExist?.page?._id,
          },
        },
      });
    } else {
      setAddOrUpdateCmsContent({
        ...addOrUpdateCmsContent,
        cmsContent: null,
      });
      reset({});
      setValue('page', selectedOption);
    }
  };

  return (
    <>
      <Modal
        isOpen={isModalShow}
        toggle={() => handleCloseModal()}
        className='modal-dialog-centered user-guide-modal'
        backdrop='static'
        size='xl'
      >
        <ModalHeader toggle={() => handleCloseModal()}>CMS Content</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-2'>
              <Label>Select Page</Label>
              <Select
                key={pageWatch}
                styles={{
                  singleValue: (base) => ({
                    ...base,
                    display: 'flex',
                    alignItems: 'center',
                  }),
                }}
                id='page'
                name='page'
                value={pageWatch}
                defaultValue={getValues('page')}
                options={pages}
                theme={selectThemeColors}
                className={`react-select ${
                  errors?.['page']?.message ? 'is-invalid' : ''
                }`}
                classNamePrefix='custom-select'
                onChange={(data) => {
                  handleChangePage(data);
                }}
                components={{
                  Group: pageGroupOptions,
                  GroupHeading: pageGroupComponent,
                }}
              />
            </div>
            <div className='mb-2'>
              <FormField
                name='title'
                label='Title'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
            <div className='mb-2'>
              <Label>Content</Label>{' '}
              <SyncfusionRichTextEditor
                editorRef={editorRef}
                onChange={(e) => {
                  setValue('content', e.value);
                }}
                value={getValues('content')}
              />
              {errors?.content && (
                <span className='form-error'>{errors.content?.message}</span>
              )}
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <SaveButton
              loading={addCmsContentLoading || updateCmsContentLoading}
              disabled={addCmsContentLoading || updateCmsContentLoading}
              width='100px'
              color='primary'
              name={'Submit'}
              type='submit'
            ></SaveButton>
          </Form>
          <Button color='danger' onClick={() => handleCloseModal()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
