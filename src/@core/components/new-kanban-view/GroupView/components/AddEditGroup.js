import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';

import { SaveButton } from '../../../save-button';
import { userData } from '../../../../../redux/user';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import {
  createGroup as createGroupAPI,
  updateGroup as updateGroupAPI,
} from '../../../../../api/groups';

const AddEditGroup = ({ id, open, setOpen, data, setRefreshData }) => {
  const user = useSelector(userData);

  // ** State **
  const [submitLoading, setSubmitLoading] = useState(false);
  const [groupName, setGroupName] = useState({ text: '', error: null });

  useEffect(() => {
    if (id) {
      setGroupName((prev) => ({ ...prev, text: data?.groupName || '' }));
    }
  }, [id, data]);

  const createGroup = async () => {
    setSubmitLoading(true);
    if (id) {
      if (groupName?.text === data?.groupName) {
        setGroupName({ text: '', error: null });
        return setOpen(false);
      }

      const obj = {};
      obj.groupName = groupName?.text;
      obj.active = data?.active;
      obj.company = data?.company;
      obj.type = 'name';

      const { error, data: groupData } = await updateGroupAPI(id, obj);
      if (error || groupData.response_type === 'error') {
        const errorMsg = error || groupData.message;
        setGroupName((prev) => ({ ...prev, error: errorMsg }));
        showToast(TOASTTYPES.error, '', errorMsg);
      } else {
        showToast(TOASTTYPES.success, '', 'Group Updated Successfully');
        setGroupName({ text: '', error: null });
        setOpen(false);
        setRefreshData(true);
      }
      setSubmitLoading(false);
    } else {
      const obj = {};
      obj.groupName = groupName.text;
      obj.active = true;
      obj.company = user.company._id;

      const { error, data: groupData } = await createGroupAPI(obj);
      if (error || groupData.response_type === 'error') {
        const errorMsg = error || groupData.message;
        setGroupName((prev) => ({ ...prev, error: errorMsg }));
        showToast(TOASTTYPES.error, '', errorMsg);
      } else {
        showToast(TOASTTYPES.success, '', 'Group added successfully!');
        setGroupName({ text: '', error: null });
        setOpen(false);
        setRefreshData(true);
      }
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <Modal
        isOpen={open}
        toggle={() => setOpen(!open)}
        className='modal-dialog-centered add-contact-group-modal'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setGroupName({ text: '', error: null });
            setOpen(false);
          }}
        >
          {id ? 'Update Group' : 'Add Group'}
        </ModalHeader>
        <ModalBody>
          <div className='mb-1'>
            <Input
              label='Group Name'
              name='group'
              placeholder='Group Name'
              type='text'
              value={groupName.text}
              onChange={(e) => {
                setGroupName({ text: e.target.value, error: null });
              }}
            />
            {groupName.error ? (
              <>
                <div className='mt-1 text-danger'>
                  {groupName.error || 'Please Enter Group Name.'}
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <SaveButton
            color='primary'
            loading={submitLoading}
            name={id ? 'Update Group' : 'Add Group'}
            onClick={() => {
              if (groupName.text === '') {
                setGroupName((prev) => ({
                  ...prev,
                  error: 'Please Enter Group Name.',
                }));
              } else {
                createGroup();
              }
            }}
            width={id ? '40%' : '32%'}
          ></SaveButton>
          <Button
            color='danger'
            onClick={() => {
              setGroupName({ text: '', error: null });
              setOpen(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddEditGroup;
