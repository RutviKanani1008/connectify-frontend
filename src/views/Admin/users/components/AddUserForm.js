// ==================== Packages =======================
import * as yup from 'yup';
import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Col, Form, UncontrolledTooltip } from 'reactstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import { Edit2, X } from 'react-feather';
import _ from 'lodash';

import { store } from '../../../../redux/store';
import { required } from '../../../../configs/validationConstant';
import { uploadFile, useRemoveAttachment } from '../../../../api/auth';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import {
  useCreateUser,
  useGetPermission,
  useUpdateUser,
} from '../hooks/userApis';

import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import AddPermissions from '../../contact/components/AddPermissions';
import AddRoles from '../../contact/components/AddRoles';
import ImageUpload from '../../../../@core/components/form-fields/ImageUpload';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import moment from 'moment';
import parser from 'html-react-parser';
import { Icon } from '@iconify/react';
import PinnedNotesModal from '../../company/components/PinnedNotesModal';
import { scrollToTop } from '../../../../helper/common.helper';
import NoteActionDropdown from '../../company/components/NoteAction';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';

const companyScheme = yup.object().shape({
  email: yup.string().email().required(required('Email')),
});

const AddUserForm = ({
  userDetails,
  initialValue,
  permissionsObj,
  setPermissionsObj,
  fileUploadURL,
  setFileUploadURL,
}) => {
  // ** Redux **
  const storeState = store.getState();
  const user = storeState.user.userData;

  // ** Hooks **
  const params = useParams();
  const history = useHistory();
  const currentUser = useSelector(userData);

  // ** states **
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [currentEditNoteIdx, setCurrentEditNoteIdx] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [openPinnedModal, setOpenPinnedModal] = useState(false);
  const [oldPermissionObj, setOldPermissionsObj] = useState(permissionsObj);
  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();
  const { createUser, isLoading: createUserLoading } = useCreateUser();
  const { updateUser, isLoading: updateUserLoading } = useUpdateUser();
  const { getPermission } = useGetPermission();
  const { removeAttachment } = useRemoveAttachment();

  // ** Form **
  const {
    control,
    handleSubmit,
    register,
    getValues,
    watch,
    reset,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(companyScheme),
    defaultValues: initialValue,
  });

  const role = watch('role');

  useEffect(() => {
    // current logged-in user redirected to profile
    if (params.id === user?._id) {
      history.push(`${basicRoute}/profile/personal-information`);
    }
  }, [params]);

  useEffect(() => {
    if (role && role === 'admin') {
      const tempPermissionsObj = {};
      availablePermissions.forEach((obj) => {
        tempPermissionsObj[obj.slug] = true;
        obj?.children?.forEach((obj) => {
          tempPermissionsObj[obj.slug] = true;
        });
      });
      setOldPermissionsObj(permissionsObj);
      setPermissionsObj(tempPermissionsObj);
    } else if (role === 'user') {
      if (params.id !== 'add') {
        const userPermissions = userDetails?.permissions;
        if (userPermissions) {
          const tempPermissionsArray = { ...permissionsObj };
          Object.keys(tempPermissionsArray).forEach((key) => {
            if (userPermissions?.includes(key))
              tempPermissionsArray[key] = true;
            else tempPermissionsArray[key] = false;
          });
          setPermissionsObj(tempPermissionsArray);
        }
      } else {
        setPermissionsObj(oldPermissionObj);
      }
    }
  }, [role, availablePermissions]);

  useEffect(() => {
    reset(initialValue);

    /* Set Initial Notes */
    if (initialValue.notes && _.isArray(initialValue.notes)) {
      setNotes(initialValue.notes);
    }
  }, [initialValue]);

  const getPermissionsData = async () => {
    const { data, error } = await getPermission();
    if (!error) {
      setAvailablePermissions(data);
    }
  };

  useEffect(() => {
    getPermissionsData();
  }, []);

  const handleDeleteFileFromS3 = async () => {
    await removeAttachment({
      attachmentUrl: [fileUploadURL],
      ...(params.id !== 'add' && {
        modelDetail: {
          model: 'users',
          id: params.id,
        },
      }),
    });
  };

  const handleImageReset = async () => {
    if (fileUploadURL) {
      await handleDeleteFileFromS3();
    }
    setFileUploadURL(false);
    setValue('userProfile', null);
  };

  const handlePermission = (checked, slug, isParent = false) => {
    const tempPermissionsArray = { ...permissionsObj };
    if (isParent) {
      const parentData = availablePermissions?.find(
        (obj) => obj?.slug === slug
      );
      tempPermissionsArray[parentData?.slug] = checked;
      parentData?.children?.forEach((obj) => {
        tempPermissionsArray[obj?.slug] = checked;
      });
    } else {
      tempPermissionsArray[slug] = checked;
    }
    setPermissionsObj(tempPermissionsArray);
  };

  const userProfileUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `${user.company._id}/profile-pictures`);
    formData.append('image', file);

    if (params.id !== 'add') {
      formData.append('model', 'users');
      formData.append('field', 'userProfile');
      formData.append('id', params.id);
      formData.append('type', 'userProfile');
    }
    setImageUploading(true);
    if (fileUploadURL) {
      formData.append('removeAttachments', [fileUploadURL]);
    }
    uploadFile(formData).then((res) => {
      if (res.error) {
        setImageUploading(false);
      } else {
        if (res?.data?.data) {
          setFileUploadURL(res?.data?.data);
          setValue('userProfile', res?.data?.data);
          clearErrors('userProfile');
        }
        setImageUploading(false);
      }
    });
  };

  const addNote = () => {
    const noteText = currentNote;

    if (currentUser) {
      const updatedBy = currentUser;
      const updatedAt = new Date();
      let updatedNotes = [...notes];
      if (currentEditNoteIdx !== null) {
        updatedNotes = notes.map((note, noteId) =>
          noteId === currentEditNoteIdx
            ? { text: noteText, updatedBy, updatedAt, isPinned: note.isPinned }
            : note
        );
        setCurrentEditNoteIdx(null);
      } else {
        updatedNotes = [
          ...notes,
          { text: noteText, updatedBy, updatedAt, isPinned: false },
        ];
      }
      setNotes(updatedNotes);
      setCurrentNote('');
    }
  };

  const removeNote = (pos) => {
    if (currentEditNoteIdx === pos) {
      setCurrentEditNoteIdx(null);
      setCurrentNote('');
    }
    setNotes((n) => n.filter((_, idx) => idx !== pos));
  };

  const editNote = (pos) => {
    setCurrentNote(notes[pos].text);
    setCurrentEditNoteIdx(pos);
  };

  const pinNote = (pos) => {
    const newNotes = notes.map((note, idx) => {
      return idx === pos ? { ...note, isPinned: true } : note;
    });
    setNotes(newNotes);
  };

  const unpinNote = (pos) => {
    const newNotes = notes.map((note, idx) => {
      return idx === pos ? { ...note, isPinned: false } : note;
    });
    setNotes(newNotes);
  };

  const onSubmit = async (data) => {
    const permissions = _.isArray(user.permissions) ? user.permissions : [];

    const rawData = JSON.parse(JSON.stringify(data));
    rawData.permissions = Object.keys(permissionsObj)
      .filter(
        (key) =>
          (permissionsObj[key] === true && user.role === 'superadmin') ||
          (permissionsObj[key] === true && permissions.includes(key))
      )
      .map((key) => key);

    rawData.company = user.company._id;

    rawData.userProfile = fileUploadURL;

    rawData.notes = notes.map((n) => ({
      text: n.text,
      updatedAt: n.updatedAt,
      updatedBy: n.updatedBy._id,
      isPinned: n.isPinned,
    }));

    if ((rawData?.permissions || []).includes('task-manager')) {
      rawData.taskManagerUsers = rawData['task-users'];
      delete rawData['task-users'];
    }

    if (params.id !== 'add') {
      rawData.active = userDetails.active || false;
      const { error } = await updateUser(
        params.id,
        rawData,
        'Updating User...'
      );

      if (!error) {
        if (history?.location?.status?.from) {
          history.push(history?.location?.status?.from);
        } else {
          scrollToTop();
        }
      }
    } else {
      const { error, data } = await createUser(rawData, 'Creating User...');
      if (!error) {
        if (history?.location?.status?.from) {
          history.push(history?.location?.status?.from);
        } else {
          history.push(`${basicRoute}/users/${data?._id}`);
        }
      }
    }
  };

  return (
    <div className=''>
      <Form
        className='company-detail-row'
        onSubmit={handleSubmit(onSubmit)}
        autoComplete='off'
      >
        <div className='company-info full-width'>
          <div className='inner-scroll-wrapper fancy-scrollbar'>
            <h4 className='section-title-second-heading'>User Form</h4>
            <div className='auth-login-form mt-2'>
              <div className='mb-1'>
                <ImageUpload
                  url={
                    fileUploadURL &&
                    fileUploadURL !== 'false' &&
                    `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
                  }
                  handleUploadImage={userProfileUpload}
                  handleImageReset={handleImageReset}
                  loading={imageUploading}
                  supportedFileTypes={['jpg', 'jpeg', 'svg', 'png', 'heic']}
                  setError={setError}
                  filename='userProfile'
                  errors={errors}
                />
              </div>
              <div className='row'>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      name='firstName'
                      label='First Name'
                      placeholder='First Name'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      name='lastName'
                      label='Last Name'
                      placeholder='Last Name'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      type='text'
                      label='Email'
                      name='email'
                      placeholder='john@example.com'
                      errors={errors}
                      control={control}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      type='phone'
                      label='Phone Number'
                      name='phone'
                      placeholder='Phone Number'
                      errors={errors}
                      control={control}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      label='Address Line 1'
                      placeholder='Address Line 1'
                      type='text'
                      errors={errors}
                      control={control}
                      name='address1'
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      label='Address 2'
                      placeholder='Address 2'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`address2`)}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      type='text'
                      label='City'
                      name='city'
                      placeholder='City'
                      errors={errors}
                      control={control}
                      {...register(`city`)}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      type='text'
                      label='State'
                      name='state'
                      placeholder='State'
                      errors={errors}
                      control={control}
                      {...register(`state`)}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      label='Country'
                      placeholder='country'
                      type='text'
                      name='country'
                      errors={errors}
                      control={control}
                      {...register(`country`)}
                    />
                  </div>
                </Col>
                <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                  <div className='mb-1'>
                    <FormField
                      type='text'
                      label='Zip'
                      placeholder='Zip'
                      errors={errors}
                      control={control}
                      {...register(`zip`)}
                    />
                  </div>
                </Col>
              </div>
            </div>
            <AddPermissions
              permissionsObj={permissionsObj}
              watch={watch}
              getValues={getValues}
              setValue={setValue}
              control={control}
              errors={errors}
              handlePermission={handlePermission}
              showTaskUsers={true}
              availablePermissions={availablePermissions}
            />
            <AddRoles errors={errors} control={control} getValues={getValues} />
          </div>
          <div className='submit-btn-fixed-wrapper'>
            <div className='d-flex align-items-center justify-content-center'>
              <SaveButton
                width='230px'
                className='mt-1 align-items-center justify-content-center btn btn-primary'
                type='submit'
                loading={createUserLoading || updateUserLoading}
                name={params.id !== 'add' ? 'Update User' : 'Create User'}
              ></SaveButton>
            </div>
          </div>
        </div>
        {false && (
          <div className='add-notes-sec'>
            <div className='inner-scroll-wrapper fancy-scrollbar'>
              <div className='header-action'>
                <h4 className='section-title-second-heading'>Add Notes</h4>
                {notes.filter((note) => note.isPinned).length ? (
                  <a
                    role='button'
                    className='view-pinned-note-btn'
                    onClick={() => setOpenPinnedModal(true)}
                  >
                    View Pinned Notes
                  </a>
                ) : null}
              </div>
              <div className='fixed-add-note'>
                <SyncfusionRichTextEditor
                  key={`bulk_contact_note`}
                  onChange={(e) => {
                    setCurrentNote(e.value);
                  }}
                  value={currentNote}
                />
                <div className='button-wrapper'>
                  <SaveButton
                    color='primary'
                    type='button'
                    onClick={addNote}
                    loading={false}
                    name={
                      currentEditNoteIdx !== null ? 'Update Note' : 'Add Note'
                    }
                    width='200px'
                    className='align-items-center justify-content-center'
                    disabled={!currentNote}
                  />
                </div>
              </div>
              <div className='note-listing-wrapper fancy-scrollbar'>
                {notes.filter((n) => !n.isPinned).length > 0 ? (
                  notes.map((note, key) => {
                    return (
                      !note.isPinned && (
                        <div className='notes-card-box' key={key}>
                          <div className='text'>
                            {note.text ? parser(note.text) : ''}
                          </div>
                          <div className='author-date-name'>
                            <span className='author-name'>
                              {note?.updatedBy?.firstName}{' '}
                              {note?.updatedBy?.lastName}
                            </span>
                            <span className='date'>
                              {moment(note?.updatedAt || new Date()).format(
                                `${
                                  user?.company?.dateFormat || 'MM/DD/YYYY'
                                }, HH:mm A`
                              )}
                            </span>
                          </div>
                          <div className='action-btn-wrapper'>
                            <div style={{ display: 'none' }}>
                              <div className='d-inline-block'>
                                <UncontrolledTooltip target='pin-note'>
                                  Pin Note
                                </UncontrolledTooltip>
                                <div
                                  id='pin-note'
                                  className='action-btn pin-btn'
                                >
                                  <Icon
                                    className='cursor-pointer'
                                    icon='material-symbols:push-pin'
                                    width={'20'}
                                    onClick={() => pinNote(key)}
                                  />
                                </div>
                              </div>
                              <div className='action-btn delete-btn'>
                                <X
                                  className={`text-primary ${
                                    currentEditNoteIdx !== key
                                      ? 'cursor-pointer'
                                      : 'cursor-not-allowed'
                                  } `}
                                  size={20}
                                  onClick={() => removeNote(key)}
                                />
                              </div>
                              <div className='action-btn edit-btn'>
                                <Edit2
                                  // className={`cursor-pointer ${
                                  //   currentEditNoteIdx !== key
                                  //     ? 'text-primary'
                                  //     : 'text-green'
                                  // } `}
                                  className={`cursor-pointer ${
                                    currentEditNoteIdx !== key ? '' : ''
                                  } `}
                                  size={18}
                                  // color={
                                  //   currentEditNoteIdx === key ? 'green' : '#a3db59'
                                  // }
                                  onClick={() => {
                                    if (currentEditNoteIdx !== key) {
                                      setCurrentEditNoteIdx(key);
                                      setCurrentNote(notes[key]['text']);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <NoteActionDropdown
                              editNote={editNote}
                              noteIdx={key}
                              pinNote={pinNote}
                              removeNote={removeNote}
                            />
                          </div>
                        </div>
                      )
                    );
                  })
                ) : (
                  <div className='no-data-wrapper'>
                    <div className='icon-wrapper'>
                      <svg
                        version='1.1'
                        id='Layer_1'
                        x='0px'
                        y='0px'
                        viewBox='0 0 204 204'
                      >
                        <path
                          style={{ fill: 'var(--primaryColor)' }}
                          d='M169.2,80.2c0,4.2-1.9,7-5.2,8.1c-3.1,1.1-6.4,0.1-8.5-2.5c-1.5-1.8-1.7-3.9-1.7-6.1
                          c0-14.9,0-29.7,0-44.6c0-5.4-1.7-10-6-13.5c-2.8-2.2-6.1-3.2-9.6-3.2c-31.3,0-62.6-0.1-94,0c-8.6,0-14.9,6.1-15.5,14.6
                          c0,0.6-0.1,1.3-0.1,1.9c0,44.3,0,88.5,0,132.8c0,5.5,1.7,10,6.1,13.4c2.9,2.3,6.4,3.2,10,3.2c8.3,0,16.5,0,24.8,0
                          c3.6,0,6.4,2,7.4,5.3c1,3,0.1,6.5-2.5,8.2c-1.5,1-3.4,1.7-5.1,1.7c-8.5,0.2-16.9,0.1-25.4,0.1C27,199.8,13,186,13.1,168
                          c0.2-25.4,0.1-50.8,0.1-76.3c0-19,0-37.9,0-56.9c0-12.1,5-21.4,15.4-27.5c3.2-1.9,7-2.6,10.6-3.8c0.5-0.2,1-0.3,1.5-0.4h101.1
                          c0.9,0.2,1.7,0.4,2.6,0.6c14.8,3,24.7,15.3,24.8,30.8C169.3,49.7,169.2,64.9,169.2,80.2z M189.5,130c0,7-2.3,12.5-6.8,17
                          c-13.8,13.8-27.6,27.6-41.5,41.4c-1.3,1.3-3.1,2.3-4.9,2.8c-9.6,2.8-19.3,5.4-29,8.1c-4.9,1.3-9-0.5-10.2-4.8
                          c-0.4-1.6-0.4-3.5,0-5.1c2.8-9.8,5.8-19.5,8.9-29.2c0.5-1.6,1.5-3.2,2.7-4.3c13.7-13.8,27.5-27.6,41.3-41.3
                          c6.6-6.5,14.6-8.7,23.5-5.9c8.7,2.8,13.9,8.9,15.8,17.9C189.4,127.9,189.4,129.3,189.5,130z M159.3,148.6
                          c-3.6-3.6-7.2-7.2-11.1-11.1c-0.3,0.5-0.6,1.1-1.1,1.6c-7,7-13.9,14.2-21.1,21c-4.1,3.9-7.1,8.1-8.1,13.6c-0.4,2.3-1.3,4.6-2.1,7.2
                          c4.9-1.4,9.5-2.6,14-3.9c1-0.3,2-0.9,2.7-1.6c8.6-8.6,17.2-17.2,25.9-25.8C158.6,149.3,159,148.9,159.3,148.6z M173.9,128.7
                          c-0.8-3.1-3-5-6.1-5.7c-3-0.6-6.1,0.8-7.9,3.6c3.5,3.5,7,7.1,10.6,10.6C173.3,135.2,174.7,132.4,173.9,128.7z M130.2,49.2
                          c-13,0-26,0-39,0H81c-9.7,0-19.3,0-29,0c-4.9,0-8.4,3.6-8,8.3c0.3,4.3,3.6,7.1,8.5,7.1c25.8,0,51.6,0,77.4,0c0.5,0,1,0,1.5,0
                          c3.7-0.3,6.6-3.2,6.9-6.8C138.8,52.8,135.3,49.2,130.2,49.2z M130,79.9c-25.9,0-51.7,0-77.6,0c-0.5,0-1,0-1.5,0.1
                          c-3.6,0.4-6.4,3-6.8,6.5c-0.6,4.9,2.8,8.8,8,8.8c13,0,26,0,39,0h15.2c8.1,0,16.1,0,24.2,0c4.7,0,8-3.4,8-7.8
                          C138.3,83,134.9,79.9,130,79.9z M99.4,110.7c-7.9-0.1-15.9,0-23.8,0c-7.9,0-15.7,0-23.6,0c-4.2,0-7.4,2.6-7.9,6.3
                          c-0.8,4.9,2.7,9,7.8,9c7.9,0.1,15.9,0,23.8,0c7.9,0,15.7,0,23.6,0c4.2,0,7.4-2.6,7.9-6.3C107.9,114.7,104.5,110.7,99.4,110.7z'
                        />
                      </svg>
                    </div>
                    <p className='text'>No any notes added</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Form>
      <div className='submit-btn-fixed-wrapper responsive-show'>
        <div className='d-flex align-items-center justify-content-center'>
          <SaveButton
            width='230px'
            className='mt-1 align-items-center justify-content-center btn btn-primary'
            type='submit'
            loading={createUserLoading || updateUserLoading}
            name={params.id !== 'add' ? 'Update User' : 'Create User'}
          ></SaveButton>
        </div>
      </div>
      <PinnedNotesModal
        isOpen={openPinnedModal}
        onClose={() => {
          setOpenPinnedModal(false);
        }}
        notes={notes}
        unpinNote={unpinNote}
      />
    </div>
  );
};

export default AddUserForm;
