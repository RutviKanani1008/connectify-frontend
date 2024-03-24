/* eslint-disable no-unused-vars */
// ** React Imports
import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'reactstrap';
import { CheckCircle, Delete, Trash2 } from 'react-feather';

// ** Third Party Packages
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Constants
import { required } from '../../../../../../configs/validationConstant';

// ** Services
import { useMapImapFolder } from '../../services/mailProviderFolder.service';
import { useGetConnectedSmtpAccounts } from '../../hooks/useEmailService';

// ** Components
import { FormField } from '../../../../../../@core/components/form-fields';
import { SaveButton } from '../../../../../../@core/components/save-button';
import AddNewFolderModal from './AddNewFolderModal';

const validationSchema = yup.object().shape({
  Inbox: yup.object().required(required('inbox')).nullable(),
});

const AddFoldersForm = ({ formState, setFormState, onFinalSubmit }) => {
  // ** States **
  const [isOpen, setIsOpen] = useState(false);
  const [initialFolders, setInitialFolders] = useState(
    Object.keys(formState.folderInfo).map((f) => ({ name: f }))
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { email, mailFolders } = formState.connectionInfo;

  // ** API Services **
  const { mapImapFolder, isLoading } = useMapImapFolder();
  const { getConnectedSmtpAccounts, isLoading: getAccountsLoading } =
    useGetConnectedSmtpAccounts();

  useEffect(() => {
    reset(formState.folderInfo);
  }, [formState]);

  const onAddNewFolder = (folderName) => {
    setInitialFolders((prev) => [...prev, { name: folderName, isNew: true }]);
  };

  const onRemoveFolder = (idx) => {
    setInitialFolders((prev) => prev.filter((_, fId) => fId !== idx));
  };

  const onSubmit = async (values) => {
    // Only Selected
    const selectedFolders = Object.keys(values)
      .map((val) => ({ key: val, value: values[val]?.value || '' }))
      .reduce((p, c) => ({ ...p, [c.key]: c.value }), {});

    const body = { email, mailFolders: selectedFolders };

    const { error } = await mapImapFolder(body);

    if (!error) {
      await getConnectedSmtpAccounts();
      setFormState((prev) => ({ ...prev, folderInfo: values }));
      onFinalSubmit();
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className='map-mailbox-folder-wrapper'>
          <div className='inner-wrapper'>
            <div className='smtp__imap__success'>
              <CheckCircle /> Your SMTP / IMAP credentials verified succesfully.
              Please map your mailbox folders using below settings.
            </div>

            <Row>
              {initialFolders.map((folder, idx) => (
                <Col
                  key={folder.name}
                  md={6}
                  sm={6}
                  lg={6}
                  className={`mb-1 ${folder.isNew && 'with-delete-btn'}`}
                >
                  <FormField
                    name={folder.name}
                    label={
                      folder.name.charAt(0).toUpperCase() + folder.name.slice(1)
                    }
                    isClearable
                    placeholder='Select Folder'
                    type='select'
                    control={control}
                    errors={errors}
                    options={mailFolders}
                  />
                  {folder.isNew && (
                    <div
                      className='delete-btn-wrapper'
                      onClick={() => onRemoveFolder(idx)}
                    >
                      <Trash2 />
                    </div>
                  )}
                </Col>
              ))}
              <Col md={12} sm={12} lg={12} className='mt-1'>
                <Button color='primary' onClick={() => setIsOpen(true)}>
                  + Add New
                </Button>
              </Col>
            </Row>
          </div>
        </div>
        <div className='footer__btns'>
          <SaveButton
            loading={isLoading || getAccountsLoading}
            disabled={isLoading || getAccountsLoading}
            color='primary'
            name={'Submit'}
            type='submit'
          />
        </div>
      </Form>
      <AddNewFolderModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        prevFolders={initialFolders}
        addNewFolder={onAddNewFolder}
      />
    </>
  );
};

export default AddFoldersForm;
