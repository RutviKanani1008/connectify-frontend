// ==================== Packages =======================
import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
// ====================================================

import { Plus } from 'react-feather';
import { UserGuideModal } from './addOrUpdateUserGuildModal';
import {
  useDeleteUserGuide,
  useGetPages,
  useGetUserGuide,
} from './hooks/userApis';
import ItemTable from '../../../@core/components/data-table';
import useUserGuideColumn from './useUserColumns';
import { showWarnAlert } from '../../../helper/sweetalert.helper';

const userGuide = () => {
  // ========================== Hooks =================================

  // ========================== states ================================
  const [availablePages, setAvailablePages] = useState([]);
  const [availableUserGuide, setAvailableUserGuide] = useState([]);
  const [addOrUpdateUserGuide, setAddOrUpdateUserGuide] = useState({
    userGuide: null,
    isModalOpen: false,
  });

  // ========================== Custom Hooks ==========================
  const { getPages } = useGetPages();
  const { getUserGuide, isLoading: userGuideLoading } = useGetUserGuide();
  const { deleteUserGuide } = useDeleteUserGuide();

  const getAvailablePages = async () => {
    const { data, error } = await getPages();
    if (!error) {
      setAvailablePages(data);
    }
  };

  const getAvailableUserGuide = async () => {
    const { data, error } = await getUserGuide();
    if (!error) {
      setAvailableUserGuide(data);
    }
  };

  useEffect(() => {
    getAvailablePages();
    getAvailableUserGuide();
  }, []);

  const handleDeleteUserGuide = async (userGuideId) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this User guide?',
    });

    if (result.value) {
      const { error } = await deleteUserGuide(
        userGuideId,
        'Delete User Guide..'
      );
      if (!error) {
        if (Array.isArray(availableUserGuide)) {
          setAvailableUserGuide(
            availableUserGuide?.filter((obj) => obj?._id !== userGuideId)
          );
        }
      }
    }
  };

  const { columns } = useUserGuideColumn({
    setAddOrUpdateUserGuide,
    handleDeleteUserGuide,
  });

  const header = () => {
    return (
      <div className='card-header-with-buttons card-header'>
        <h4 className='title card-title'>User Guide</h4>
        <div className='button-wrapper'>
          <Button
            className='d-inline-flex'
            color='primary'
            onClick={handelAddNewItem}
          >
            <Plus size={15} />
            <span className='align-middle ms-50'>{'Add User Guide'}</span>
          </Button>
        </div>
      </div>
    );
  };

  const handelAddNewItem = () => {
    setAddOrUpdateUserGuide({
      isModalOpen: true,
      userGuide: null,
    });
  };

  const handleCloseGuideModal = (data = null) => {
    if (data) {
      if (addOrUpdateUserGuide.userGuide) {
        setAvailableUserGuide(
          availableUserGuide.map((userGuide) =>
            userGuide._id === addOrUpdateUserGuide.userGuide?._id
              ? { ...data }
              : { ...userGuide }
          )
        );
      } else {
        setAvailableUserGuide([...availableUserGuide, data]);
      }
    }
    setAddOrUpdateUserGuide({
      isModalOpen: false,
      userGuide: null,
    });
  };

  return (
    <>
      <div className='user-guide-page'>
        <ItemTable
          loading={userGuideLoading}
          hideButton={false}
          ExportData={false}
          hideExport={true}
          columns={columns}
          data={availableUserGuide}
          searchPlaceholder={'Search user guide'}
          title={'User Guide'}
          childDropdown={header}
          addItemLink={false}
          onClickAdd={handelAddNewItem}
          buttonTitle={'Add User Guide'}
          itemsPerPage={10}
        />
      </div>
      {addOrUpdateUserGuide.isModalOpen && (
        <UserGuideModal
          isModalShow={addOrUpdateUserGuide.isModalOpen}
          currentUserGuide={addOrUpdateUserGuide.userGuide}
          handleCloseGuideModal={handleCloseGuideModal}
          availablePages={availablePages}
          availableUserGuide={availableUserGuide}
          addOrUpdateUserGuide={addOrUpdateUserGuide}
          setAddOrUpdateUserGuide={setAddOrUpdateUserGuide}
        />
      )}
    </>
  );
};

export default userGuide;
