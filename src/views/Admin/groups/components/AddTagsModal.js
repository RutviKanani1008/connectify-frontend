// ** Reactstrap Imports
import {
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';

// ** Third Party Components
import { useForm } from 'react-hook-form';

// ** custom components
import { FormField } from '@components/form-fields';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { required } from '../../../../configs/validationConstant';
import { SaveButton } from '../../../../@core/components/save-button';
import {
  useCreateFolder,
  useCreateTag,
  useUpdateTag,
} from '../hooks/groupApis';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useEffect } from 'react';

const validationSchema = yup.object().shape({
  tagName: yup.string().required(required('Name')),
  // folder: yup
  //   .object()
  //   .shape({
  //     label: yup.string().required('Required'),
  //     value: yup.string().required('Required'),
  //   })
  //   .nullable()
  //   .required('Select folder'),
});

const AddTagsModal = ({
  closeTagsModal,
  openTagModal,
  currentFolders,
  setCurrentFolders,
  selectedGroup,
  isUpdateTag,
  setCurrentFolderTags,
  currentFolderTags,
  currentOpenFolder,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    // getValues,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const user = useSelector(userData);

  useEffect(() => {
    if (isUpdateTag) {
      const currentTagFolder = currentFolders?.find(
        (folder) => folder?._id === isUpdateTag?.folder
      );
      reset({
        tagName: isUpdateTag?.tagName,
        folder:
          currentTagFolder &&
          currentTagFolder?._id &&
          currentTagFolder?.folderName
            ? {
                id: currentTagFolder?._id,
                value: currentTagFolder?._id,
                label: currentTagFolder?.folderName,
              }
            : null,
      });
    }
  }, [isUpdateTag]);

  const { createFolder } = useCreateFolder();
  const { createTag, isLoading: createTaskOptionLoading } = useCreateTag();
  const { updateTag, isLoading: updateTaskOptionLoading } = useUpdateTag();
  const onSubmit = async (values) => {
    const formValue = JSON.parse(JSON.stringify(values));
    formValue.folder = formValue?.folder?.value;

    let res = null;
    if (!isUpdateTag) {
      formValue.active = true;
      formValue.company = user.company._id;
      formValue.groupId = selectedGroup?.value || '';
      res = await createTag(formValue);
    } else {
      formValue.active = isUpdateTag?.active;
      formValue.company = isUpdateTag?.company;
      formValue.groupId = isUpdateTag?.groupId;
      formValue.type = 'updateName';
      res = await updateTag(isUpdateTag?._id, formValue);
    }
    const { data, error } = res;
    if (!error) {
      if (isUpdateTag) {
        let tempTags = JSON.parse(JSON.stringify(currentFolderTags));
        tempTags.map((tag, index) => {
          if (tag?._id === isUpdateTag?._id) {
            tempTags[index] = data;
          }
        });
        const matchData =
          currentOpenFolder === 'unassigned' ? null : currentOpenFolder;
        tempTags = tempTags.filter((tag) => tag?.folder === matchData);
        setCurrentFolderTags(tempTags);
      } else {
        if (
          currentOpenFolder === formValue.folder ||
          (currentOpenFolder === 'unassigned' && !formValue.folder)
        ) {
          const tempTags = JSON.parse(JSON.stringify(currentFolderTags));
          tempTags.push(data);
          setCurrentFolderTags(tempTags);
        }
      }
      reset({});
      closeTagsModal();
    }
  };

  const ModalFooter1 = () => {
    return (
      <SaveButton
        loading={createTaskOptionLoading || updateTaskOptionLoading}
        disabled={createTaskOptionLoading || updateTaskOptionLoading}
        width='100px'
        color='primary'
        name={'Submit'}
        type='submit'
      ></SaveButton>
    );
  };

  const handleFolderValue = async (value) => {
    const tempFolders = JSON.parse(JSON.stringify(currentFolders));
    const isFolderExist = tempFolders.find(
      (folder) => folder?._id === value?.value
    );
    if (!isFolderExist) {
      const obj = {};
      obj.company = user?.company?._id;
      obj.folderFor = 'tags';
      obj.folderName = value.value;
      obj.model = 'group';
      obj.modelRecordId = selectedGroup?.value;

      const { data, error } = await createFolder(obj);
      if (!error) {
        tempFolders?.push(data);
        setCurrentFolders(tempFolders);
        setValue('folder', {
          id: data?._id,
          value: data?._id,
          label: data?.folderName,
        });
      }
    }
  };

  return (
    <Modal
      isOpen={openTagModal}
      toggle={() => {
        reset({});
        closeTagsModal();
      }}
      className='modal-dialog-centered add-contact-tag-modal modal-dialog-mobile'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          reset({});
          closeTagsModal();
        }}
      >
        {isUpdateTag ? 'Update Tag' : 'Add Tag'}
      </ModalHeader>
      <ModalBody className=''>
        <>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className=''>
              <Col md={12} sm={12} lg={12}>
                <FormField
                  name='tagName'
                  label='Tag Name'
                  placeholder='tag name'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </Col>
            </Row>
            <Row className='mt-1'>
              <Col md={12} sm={12} lg={12}>
                <FormField
                  name='folder'
                  placeholder='Select Folder'
                  label='Folder'
                  type='creatableselect'
                  errors={errors}
                  control={control}
                  options={currentFolders
                    ?.filter((folder) => folder._id !== 'unassigned')
                    ?.map((folder) => ({
                      id: folder?._id,
                      value: folder?._id,
                      label: folder?.folderName,
                    }))}
                  onChange={(value) => {
                    handleFolderValue(value);
                  }}
                />{' '}
              </Col>
            </Row>
          </Form>
        </>
      </ModalBody>

      <ModalFooter>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalFooter1 />
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default AddTagsModal;
