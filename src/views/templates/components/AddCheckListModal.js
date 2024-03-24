import { useEffect, useState } from 'react';

import * as yup from 'yup';
import {
  Button,
  // Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  // Row,
} from 'reactstrap';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { SaveButton } from '@components/save-button';
import { FormField } from '@components/form-fields';
import ChecklistDetailFromFields from './ChecklistDetailFromFields';

import { useSaveChecklistTemplate } from '../hooks/checklistApis';
import { yupResolver } from '@hookform/resolvers/yup';

import { required } from '../../../configs/validationConstant';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import { useCreateFolder } from '../../Admin/groups/hooks/groupApis';
import ChecklistDetailFromFieldsView from './ChecklistDetailFromView';

const checklistSchema = yup.object().shape({
  name: yup.string().required(required('Name')),
  checklist: yup
    .array()
    .of(
      yup.object().shape({
        title: yup.string().required('Title Required').nullable(),
      })
    )
    .required('Must have fields')
    .min(1, 'Minimum of 1 field'),
});

const AddCheckListModal = ({
  contactId,
  data,
  isOpen,
  setIsOpen,
  handleCloseChecklistAddModal,
  checklistId,
  getChecklistTemplatesAPI,
  currentFolders,
  setCurrentFolders,
  openFolderId,
  defaultFolder = null,
  isViewOnly = false,
  modelType = 'Contacts',
}) => {
  // ** hooks
  const {
    control,
    handleSubmit,
    register,
    reset,
    getValues,
    formState: { errors },
    setValue,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      checklist: [{ checked: false, title: '', details: '', sort: 0 }],
      allChecklistsDetails: [
        { checked: false, title: '', details: '', sort: 0 },
      ],
      showCompleted: false,
    },
    resolver: yupResolver(checklistSchema),
  });

  const showCompletedWatch =
    useWatch({ control, name: 'showCompleted' }) || false;

  const user = useSelector(userData);
  const [currentChecklistDetails, setCurrentChecklistDetails] = useState();
  const { fields, append, remove } = useFieldArray({
    control,
    shouldUnregister: true,
    name: 'checklist',
  });

  const { createChecklistTemplate, isLoading: addLoading } =
    useSaveChecklistTemplate();
  const { createFolder } = useCreateFolder();

  useEffect(() => {
    if (checklistId) {
      const editChecklistDetail = data.find((obj) => obj._id === checklistId);
      let currentTagFolder = null;
      if (editChecklistDetail?.folder) {
        currentTagFolder = currentFolders?.find(
          (folder) => folder?._id === editChecklistDetail?.folder
        );
      }
      if (editChecklistDetail) {
        reset({
          name: editChecklistDetail.name,
          checklist: editChecklistDetail.checklist,
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
        setCurrentChecklistDetails({
          name: editChecklistDetail.name,
          checklist: editChecklistDetail.checklist,
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
    }
  }, [checklistId]);

  useEffect(() => {
    if (defaultFolder) {
      reset({
        folder: defaultFolder,
        checklist: [{ checked: false, title: '', details: '', sort: 0 }],
      });
    }
  }, [defaultFolder]);

  const handleUpdateFolderTotalCounts = (folderId) => {
    setCurrentFolders((prev) => {
      return prev.map((obj) =>
        String(obj._id) === String(folderId) ||
        (folderId === null && String(obj?._id) === 'unassigned')
          ? {
              ...obj,
              totalData: obj?.totalData + 1,
            }
          : { ...obj }
      );
    });
  };

  const onSubmit = async (values) => {
    const body = {};
    body.checklist = values.checklist;
    body.name = values.name;
    body.folder = values.folder?.value || null;

    if (contactId) {
      body.contact = contactId;
    }

    if (checklistId && checklistId !== 'add') {
      body._id = checklistId;
    }

    const { data, error } = await createChecklistTemplate(body);
    if (data && !error) {
      handleUpdateFolderTotalCounts(body.folder);
      handleCloseChecklistAddModal();
      setIsOpen(!isOpen);
      getChecklistTemplatesAPI({ _id: openFolderId ? openFolderId : null });
    }
  };

  const handleSortFields = (fieldsDetails) => {
    const tempFields = JSON.parse(JSON.stringify(fieldsDetails));
    tempFields?.map((field, index) => {
      field.sort = index;
      return field;
    });
    setValue('checklist', tempFields);
  };

  const handleFolderValue = async (value) => {
    const tempFolders = JSON.parse(JSON.stringify(currentFolders));
    const isFolderExist = tempFolders.find(
      (folder) => folder?._id === value?.value
    );
    if (!isFolderExist) {
      const obj = {};
      obj.folderName = value.value;
      obj.company = user?.company?._id;
      obj.folderFor = 'checklist';
      if (contactId) {
        obj.model = modelType;
        obj.modelRecordId = contactId;
      } else {
        obj.model = null;
        obj.modelRecordId = null;
      }
      obj.order = 0;
      const { data, error } = await createFolder(obj);
      if (!error) {
        tempFolders?.push({ ...data, totalData: 0 });
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
      isOpen={isOpen}
      toggle={() => {
        // handleCloseChecklistAddModal();
      }}
      size='lg'
      className={`modal-dialog-centered add-checklist-modal view-checklist-modal modal-dialog-mobile`}
      fade={false}
    >
      <ModalHeader
        toggle={() => {
          handleCloseChecklistAddModal();
        }}
      >
        {isViewOnly
          ? 'View Checklist'
          : checklistId === 'add'
          ? 'Add Checklist'
          : 'Update Checklist'}
      </ModalHeader>
      <ModalBody>
        {isViewOnly ? (
          <>
            <div className='folder-template-names-wrapper'>
              <div className='data-row'>
                <span className='label'>Folder:</span>
                <span className='value'>
                  {currentChecklistDetails?.folder?.label || '-'}
                </span>
              </div>
              <div className='data-row'>
                <span className='label'>Template Name:</span>
                <span className='value'>
                  {currentChecklistDetails?.name || '-'}
                </span>
              </div>
            </div>
            <ChecklistDetailFromFieldsView
              currentChecklistDetails={currentChecklistDetails}
            />
          </>
        ) : (
          <>
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(onSubmit)}
              autoComplete='off'
            >
              <div className='mb-1'>
                <FormField
                  disabled={isViewOnly}
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
                />
              </div>
              <div className='mb-1'>
                <FormField
                  disabled={isViewOnly}
                  name='name'
                  label='Template Name'
                  placeholder='Template Name'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </div>
              <ChecklistDetailFromFields
                fields={fields}
                setValue={setValue}
                handleSortFields={handleSortFields}
                errors={errors}
                control={control}
                register={register}
                getValues={getValues}
                append={append}
                remove={remove}
                disabled={isViewOnly}
                showCompletedWatch={showCompletedWatch}
              />
            </Form>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            handleCloseChecklistAddModal();
          }}
        >
          Cancel
        </Button>
        {!isViewOnly && (
          <SaveButton
            onClick={handleSubmit(onSubmit)}
            width='90px'
            type='submit'
            loading={addLoading}
            name={checklistId !== 'add' ? 'Update' : 'Save'}
          />
        )}
      </ModalFooter>
    </Modal>
  );
};

export default AddCheckListModal;
