import React, { useState } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { useSelector, useDispatch } from 'react-redux';
import { storeUser, userData } from '../../../../redux/user';
import { createGroup, updateGroup } from '../../../../api/groups';
import { SaveButton } from '@components/save-button';

const AddGroupModal = ({
  groups,
  getRecords,
  openGroupModal,
  setOpenGroupModal,
  currentGroup,
  setCurrentGroup,
  isUpdateGroup,
  setIsUpdateGroup,
}) => {
  const [addOrUpdateGroupLoading, setAddOrUpdateGroupLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  const user = useSelector(userData);

  const dispatch = useDispatch();

  const createOrUpdateGroup = () => {
    setAddOrUpdateGroupLoading(true);
    if (isUpdateGroup) {
      const obj = {};
      obj.groupName = currentGroup.text;
      obj.company = user.company._id;
      obj.active = isUpdateGroup.active;
      obj.update = 'name';
      updateGroup(isUpdateGroup._id, obj)
        .then((res) => {
          if (res.error) {
            setShowError(true);
            setErrorMessage(res.error);
            showToast(TOASTTYPES.error, '', res.error);
          } else {
            showToast(TOASTTYPES.success, '', 'Group Updated Successfully');
            const temp = JSON.parse(JSON.stringify(groups));
            temp.map((group) => {
              if (group._id === isUpdateGroup._id && res?.data?.data) {
                const updateGroup = res.data.data;
                group.groupCode = updateGroup?.groupCode;
                group.groupName = updateGroup?.groupName;
              }
            });
            getRecords();
            const userObj = JSON.parse(JSON.stringify(user));
            userObj.group = temp;
            dispatch(storeUser(userObj));
            setOpenGroupModal(!openGroupModal);
            setCurrentGroup({ text: '' });
            setIsUpdateGroup(false);
            setErrorMessage(false);
            setShowError(false);
          }
          setAddOrUpdateGroupLoading(false);
        })
        .catch(() => {
          setAddOrUpdateGroupLoading(false);
        });
    } else {
      const obj = {};
      obj.groupName = currentGroup.text;
      obj.company = user.company._id;
      obj.active = true;

      createGroup(obj)
        .then((res) => {
          if (res.error) {
            setShowError(true);
            setErrorMessage(res.error);
            showToast(TOASTTYPES.error, '', res.error);
          } else {
            showToast(TOASTTYPES.success, '', 'Group Added Successfully');
            if (res?.data?.data) {
              if (user.group) {
                const userObj = JSON.parse(JSON.stringify(user));
                userObj.group.push(res.data.data);
                dispatch(storeUser(userObj));
              }
            }
            getRecords();
            setOpenGroupModal(!openGroupModal);
            setCurrentGroup({ text: '' });
            setIsUpdateGroup(false);
            setErrorMessage(false);
            setShowError(false);
          }
          setAddOrUpdateGroupLoading(false);
        })
        .catch(() => {
          setAddOrUpdateGroupLoading(false);
        });
    }
  };

  return (
    <Modal
      isOpen={openGroupModal}
      toggle={() => setOpenGroupModal(!openGroupModal)}
      className='modal-dialog-centered add-update-group-modal modal-dialog-mobile'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          setCurrentGroup({ text: '' });
          setOpenGroupModal(!openGroupModal);
          setIsUpdateGroup(false);
          setShowError(false);
        }}
      >
        {isUpdateGroup ? 'Update Group' : 'Add Group'}
      </ModalHeader>
      <ModalBody>
        <div className=''>
          <Input
            label='Group Name'
            name='group'
            placeholder='Group Name'
            type='text'
            value={currentGroup.text}
            onChange={(e) => {
              if (showError) {
                setShowError(false);
              }
              setCurrentGroup({
                text: e.target.value,
              });
            }}
          />
          {showError ? (
            <>
              <div className='mt-1 text-danger'>
                {errorMessage ? errorMessage : 'Please Enter Group Name.'}
              </div>
            </>
          ) : null}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            setCurrentGroup({ text: '' });
            setOpenGroupModal(!openGroupModal);
            setIsUpdateGroup(false);
            setShowError(false);
          }}
        >
          Cancel
        </Button>
        <SaveButton
          loading={addOrUpdateGroupLoading}
          name={isUpdateGroup ? 'Update Group' : 'Add Group'}
          width='150px'
          onClick={() => {
            if (currentGroup.text === '') {
              setShowError(true);
            } else {
              createOrUpdateGroup();
            }
          }}
        />
      </ModalFooter>
    </Modal>
  );
};

export default AddGroupModal;
