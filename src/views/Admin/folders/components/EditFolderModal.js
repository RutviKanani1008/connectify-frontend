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
import { useCreateFolder, useUpdateFolder } from '../../groups/hooks/groupApis';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useEffect } from 'react';

const validationSchema = yup.object().shape({
  folderName: yup.string().required(required('Name')),
});

const EditFolderModal = ({
  updateFolderDetail,
  closeFolderModal,
  openFolderModal,
  // selectedGroup,
  setCurrentFolders,
  currentFolders,
  type = 'tags',
  contactId,
  modelType = 'Contacts',
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const user = useSelector(userData);
  const { createFolder, isLoading: createLoading } = useCreateFolder();

  useEffect(() => {
    if (updateFolderDetail && updateFolderDetail?._id !== 'newFolder') {
      reset(updateFolderDetail);
    }
  }, [updateFolderDetail]);
  const { updateFolder, isLoading: updateFolderLoading } = useUpdateFolder();

  const onSubmit = async (values) => {
    const formValue = JSON.parse(JSON.stringify(values));
    formValue.company = user?.company?._id;
    formValue.folderFor = type;
    formValue.order = 0;

    if (contactId && modelType) {
      formValue.model = modelType;
      formValue.modelRecordId = contactId;
    }

    if (updateFolderDetail?._id === 'newFolder') {
      const { data, error } = await createFolder(formValue);

      if (!error) {
        const tempFolder = JSON.parse(JSON.stringify(currentFolders));
        tempFolder.splice(1, 0, data);
        setCurrentFolders(tempFolder);
        reset({});
        closeFolderModal();
      }
    } else {
      if (formValue.folderName !== updateFolderDetail?.folderName) {
        delete formValue.folderId;

        if (updateFolderDetail?._id) {
          const { data, error } = await updateFolder(
            updateFolderDetail?._id,
            formValue
          );
          if (!error) {
            const tempFolder = JSON.parse(JSON.stringify(currentFolders));
            tempFolder.map((folder, index) => {
              if (folder?._id === updateFolderDetail?._id) {
                tempFolder[index] = {
                  ...folder,
                  folderName: data.folderName,
                  folderId: data?.folderId,
                };
              }
            });
            setCurrentFolders(tempFolder);
            reset({});
            closeFolderModal();
          }
        }
      } else {
        reset({});
        closeFolderModal();
      }
    }
  };

  const ModalFooter1 = () => {
    return (
      <SaveButton
        loading={updateFolderLoading || createLoading}
        disabled={updateFolderLoading || createLoading}
        width='100px'
        color='primary'
        name={'Submit'}
        type='submit'
      ></SaveButton>
    );
  };

  return (
    <Modal
      isOpen={openFolderModal}
      toggle={() => {
        reset({});
        closeFolderModal();
      }}
      fade={false}
      className='modal-dialog-centered modal-dialog-mobile create-update-folder-name'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          reset({});
          closeFolderModal();
        }}
      >
        {updateFolderDetail?._id === 'newFolder'
          ? 'Create a Folder'
          : 'Update Folder Name'}
      </ModalHeader>
      <ModalBody className=''>
        <>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className=''>
              <Col md={12} sm={12} lg={12}>
                <FormField
                  name='folderName'
                  label='Folder Name'
                  placeholder='Folder name'
                  type='text'
                  errors={errors}
                  control={control}
                />
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

export default EditFolderModal;
