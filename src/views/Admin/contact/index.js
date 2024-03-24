// ** React Imports **
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';

// ** External Package **
import _ from 'lodash';

// ** Redux **
import { selectSocket } from '../../../redux/common';
import { userData } from '../../../redux/user';

// ** APIS **
import { archiveContact, deleteContact } from '../../../api/contacts';
import {
  useMultipleArchiveContacts,
  useMultipleDeleteContacts,
} from './hooks/contactsApi';
import { getGroupDetails } from '../../../api/groups';

// ** Helper *
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { showWarnAlert } from '../../../helper/sweetalert.helper';

// **  Components **
import ImportContact from './components/ImportContact';
import ImportUnSubContact from './components/ImportUnsubContact';
import { ContactGroupChange } from './components/ContactGroupChange';
import ContactFilter from './components/ContactFilters';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';
import ContactListHeader from './components/ContactListHeader';
import { BulkNotes } from './components/BulkNotes';
import SendMassEmailForSelectedContact from './components/SendMassEmailForSelectedContact';

// ** Hooks **
import useContactColumns from './hooks/useContactColumns';
import useGroupPersist from '../groups/hooks/useGroupPersist';
import { useSetGroupRelatedValue } from '../TaskManager/hooks/useGroupDetailsHelper';
import { useGetGroupOptions } from '../pipeline/components/GroupsList/hooks/useGroupService';
import { useGetContactsListing } from './hooks/useContactService';
import { SwitchGroup } from './components/SwitchGroupContacts';
import TaskModal from '../TaskManager/components/TaskModal/TaskModal';
import { useGetTaskOptions } from '../TaskManager/hooks/useGetTaskOptions';

const Contact = ({ hideTitle = false, hideButton = false }) => {
  const user = useSelector(userData);
  const socket = useSelector(selectSocket);
  const { getTaskOptions, taskOptions, setTaskOptions } = useGetTaskOptions();

  //  ** States **
  const [selectedGroup, setSelectedGroup] = useGroupPersist();
  const [openUploadContact, setOpenUploadContact] = useState(false);
  const [openUploadUnSubContact, setOpenUploadUnSubContact] = useState(false);
  const [currentTab, setCurrentTab] = useState('active');
  const [openChangeGroupModal, setOpenChangeGroupModal] = useState(false);
  const [showSwitchGroupModal, setShowSwitchGroupModal] = useState(false);
  const [showBulkNoteModal, setShowBulkNoteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [unselectedRows, setUnselectedRows] = useState([]);
  const [isSelectedTotalData, setIsSelectedTotalData] = useState(false);
  const [showBulkTaskModal, setShowBulkTaskModal] = useState(false);
  const [showSendMassMailModal, setShowSendMassMailModal] = useState(false);
  const [updateCurrentGroup, setUpdateCurrentGroup] = useState(null);
  const [currentFilter, setCurrentFilter] = useState({
    status: null,
    category: null,
    tags: [],
    pipeline: null,
    stage: null,
  });
  const unAssignFilter = {
    id: 'UnassignedItem',
    value: 'Unassigned',
    label: 'Unassigned',
  };
  const [relatedGroupOptions, setRelatedGroupsOptions] = useState({
    status: [unAssignFilter],
    category: [unAssignFilter],
    tags: [unAssignFilter],
    pipeline: [unAssignFilter],
  });

  // socket states
  const [isImportProcessing, setIsImportProcessing] = useState(false);
  const [importProcessingMessage, setImportProcessingMessage] = useState(null);

  // Custom Hooks
  const { archiveMultipleContacts } = useMultipleArchiveContacts();
  const { deleteMultipleContacts } = useMultipleDeleteContacts();
  const { columns } = useContactColumns({
    handleConfirmDeleteAndArchive,
    user,
  });
  const { getGroupOptions, groupOptions } = useGetGroupOptions();
  const { getContacts, contactsData, isLoading } = useGetContactsListing();
  const tableRef = useRef(null);

  const selectedRowsFilters = useMemo(() => {
    const tableFilters = tableRef.current?.filter || {};
    const selectFilters = _.omit(tableFilters, ['sort', 'page', 'limit']);
    const selectedContacts = !isSelectedTotalData ? selectedRow : [];
    const unselectedContacts = isSelectedTotalData ? unselectedRows : [];

    return {
      is_all_selected: isSelectedTotalData,
      selected_contacts: (selectedContacts || []).map((c) => c._id),
      exceptions_contacts: (unselectedContacts || []).map((c) => c._id),
      ...selectFilters,
    };
  }, [
    tableRef.current?.filter,
    isSelectedTotalData,
    selectedRow,
    unselectedRows,
  ]);

  const selectedRowLength = tableRef.current?.selectedRowLength;

  const autoRefreshTable = () => {
    tableRef?.current?.refreshTable({
      filterArgs: {
        ...(selectedGroup && { 'group.id': selectedGroup.value }),
        ...(currentFilter.status && { status: currentFilter.status }),
        ...(currentFilter.category && {
          category: currentFilter.category,
        }),
        ...(currentFilter.tags.length && {
          tags: currentFilter.tags,
        }),
        ...(currentFilter.pipeline && {
          pipeline: currentFilter.pipeline,
        }),
        ...(currentFilter.stage && {
          stage: currentFilter.stage,
        }),
      },
      reset: true,
    });
  };

  useEffect(() => {
    getGroupOptions();
    // tableRef?.current?.refreshTable({
    //   filterArgs: {
    //     'group.id': selectedGroup?.value ? selectedGroup.value : undefined,
    //     hasUnsubscribed: false,
    //   },
    //   reset: true,
    // });
  }, []);

  useEffect(() => {
    // socket for import contacts
    if (socket) {
      socket.on(`current-queue-process-${user.company?._id}`, (data) => {
        setImportProcessingMessage(data.message);
        if (data.status === 'in_process') {
          setIsImportProcessing(true);
        } else {
          setTimeout(() => {
            autoRefreshTable();
            setIsImportProcessing(false);
          }, 1000);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    // if (
    //   selectedGroup &&
    //   selectedGroup.value &&
    //   selectedGroup?.value !== null &&
    //   selectedGroup?.value !== ''
    // ) {
    if (selectedGroup?.value) {
      if (selectedGroup.value !== 'unAssigned') {
        getGroupDetails(selectedGroup.value).then((res) => {
          if (res.data.data) {
            setGroupRelatedValue(res.data.data);
          }
        });
      }
      setUpdateCurrentGroup(Math.random());
    }
    setCurrentFilter({
      status: null,
      category: null,
      tags: [],
      pipeline: null,
      stage: null,
    });
  }, [selectedGroup]);

  useEffect(() => {
    if (
      currentFilter.status ||
      currentFilter.category ||
      currentFilter.tags ||
      currentFilter.pipeline ||
      currentFilter.stage
    ) {
      const tabFilter = {};
      if (currentTab === 'unsubscribed') {
        tabFilter.hasUnsubscribed = true;
      } else {
        tabFilter.archived = currentTab === 'archive';
      }
      tableRef?.current?.refreshTable({
        filterArgs: {
          ...tabFilter,
          ...(selectedGroup && { 'group.id': selectedGroup.value }),
          ...(currentFilter.status && { status: currentFilter.status }),
          ...(currentFilter.category && {
            category: currentFilter.category,
          }),
          ...(currentFilter.tags.length && {
            tags: currentFilter.tags,
          }),
          ...(currentFilter.pipeline && {
            pipeline: currentFilter.pipeline,
          }),
          ...(currentFilter.stage && {
            stage: currentFilter.stage,
          }),
        },
        reset: true,
      });
    }
  }, [
    selectedGroup?.value,
    currentFilter.status,
    currentFilter.category,
    // currentFilter.tags,
    JSON.stringify(currentFilter.tags),
    currentFilter.pipeline,
    currentFilter.stage,
  ]);

  async function handleConfirmDeleteAndArchive(
    id = null,
    archived = undefined,
    userId = false
  ) {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `${
        archived === undefined
          ? 'Are you sure you would like to delete this contact?'
          : `Are you sure you would like to ${
              archived ? 'active' : 'archive'
            } this contact?`
      }`,
    });

    if (result.value) {
      const toastId = showToast(TOASTTYPES.loading);
      try {
        let response;
        if (archived === true || archived === false) {
          response = await archiveContact(id, {
            archived: !archived,
            userId,
          });
        } else {
          response = await deleteContact(id);
        }
        if (response?.data?.response_type === 'success') {
          tableRef?.current?.refreshTable({});
          showToast(TOASTTYPES.success, toastId, response?.data?.message);
        } else if (response?.data?.toast) {
          showToast(TOASTTYPES.error, toastId, response?.data?.message);
        }
      } catch (error) {
        showToast(TOASTTYPES.error, toastId, 'Something went wrong!');
      }
    }
  }

  const { setGroupRelatedValue } = useSetGroupRelatedValue({
    setFilterValue: setRelatedGroupsOptions,
    filterValue: relatedGroupOptions,
    showUnassigned: false,
  });

  // const handleGroupChange = (value) => {
  //   if (value !== 'unAssigned') {
  //     getGroupDetails(value).then((res) => {
  //       if (res.data.data) {
  //         setGroupRelatedValue(res.data.data);
  //       }
  //     });
  //   }
  // };

  const handleGroupChange = (e) => {
    setSelectedGroup(e);
    // HELLO
    // const tabFilter = {};
    // if (currentTab === 'unsubscribed') {
    //   tabFilter.hasUnsubscribed = true;
    // } else {
    //   tabFilter.archived = currentTab === 'archive';
    // }

    // tableRef?.current?.refreshTable({
    //   filterArgs: { ...tabFilter, 'group.id': e?.id ? e.id : undefined },
    //   reset: true,
    // });
  };

  const handleImportItem = () => setOpenUploadContact(true);
  const closeUploadModal = () => {
    getGroupOptions();
    setOpenUploadContact(false);
  };

  const handleUnSubImportItem = () => {
    setOpenUploadUnSubContact(true);
  };

  const closeUploadUnSubModal = (isReloadRequired = false) => {
    setOpenUploadUnSubContact(false);
    if (isReloadRequired) {
      getGroupOptions();
      tableRef?.current?.refreshTable(
        currentTab === 'unsubscribed'
          ? { hasUnsubscribed: true }
          : {
              archived: currentTab === 'active' ? false : true,
              hasUnsubscribed: false,
            }
      );
    }
  };

  const handleDeleteMultiple = async () => {
    const isArchiveTab = currentTab === 'archive';

    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `Are you sure you would like to ${
        isArchiveTab ? 'delete' : 'archive'
      } this contacts?`,
    });

    if (result.value) {
      let response = null;

      if (isArchiveTab) {
        response = await deleteMultipleContacts(
          { contactFilters: selectedRowsFilters },
          'Deleting'
        );
      } else {
        response = await archiveMultipleContacts(
          { contactFilters: selectedRowsFilters },
          'Archiving'
        );
      }

      if (response && !response.error) {
        tableRef?.current?.refreshTable({});
      }
    }
  };

  const handleCloseContactGroupChangeModal = (isReloadRequired = false) => {
    setOpenChangeGroupModal(false);
    getGroupOptions();
    if (isReloadRequired) {
      tableRef?.current?.refreshTable({});
    }
  };

  const handleCloseSwitchGroupModal = (isReloadRequired = false) => {
    setShowSwitchGroupModal(false);
    getGroupOptions();
    if (isReloadRequired) {
      tableRef?.current?.refreshTable({});
    }
  };

  const handleBulkNoteCreate = () => {
    setShowBulkNoteModal(true);
  };

  const handleBulkTaskCreate = () => {
    getTaskOptions();
    setShowBulkTaskModal(true);
  };

  const handleSendMassMailCreate = () => {
    setShowSendMassMailModal(true);
  };

  const header = () => {
    return (
      <ContactListHeader
        tableRef={tableRef}
        currentTab={currentTab}
        groupOptions={groupOptions}
        handleDeleteMultiple={handleDeleteMultiple}
        handleImportItem={handleImportItem}
        handleUnSubImportItem={handleUnSubImportItem}
        handleBulkTaskCreate={handleBulkTaskCreate}
        handleBulkNoteCreate={handleBulkNoteCreate}
        hideButton={hideButton}
        hideTitle={hideTitle}
        selectedData={selectedRow}
        setCurrentTab={setCurrentTab}
        selectedGroup={selectedGroup}
        setOpenChangeGroupModal={setOpenChangeGroupModal}
        setShowSwitchGroupModal={setShowSwitchGroupModal}
        handleSendMassMailCreate={handleSendMassMailCreate}
        setRelatedGroupsOptions={setRelatedGroupsOptions}
        currentFilter={currentFilter}
        isSelectedTotalData={isSelectedTotalData}
        isImportInProcess={isImportProcessing}
      />
    );
  };

  const Filters = () => {
    return (
      <ContactFilter
        tableRef={tableRef}
        currentTab={currentTab}
        groupOptions={groupOptions}
        handleGroupChange={handleGroupChange}
        handleDeleteMultiple={handleDeleteMultiple}
        handleImportItem={handleImportItem}
        handleUnSubImportItem={handleUnSubImportItem}
        handleBulkTaskCreate={handleBulkTaskCreate}
        handleBulkNoteCreate={handleBulkNoteCreate}
        hideButton={hideButton}
        hideTitle={hideTitle}
        selectedData={selectedRow}
        setCurrentTab={setCurrentTab}
        selectedGroup={selectedGroup}
        setOpenChangeGroupModal={setOpenChangeGroupModal}
        setShowSwitchGroupModal={setShowSwitchGroupModal}
        handleSendMassMailCreate={handleSendMassMailCreate}
        setRelatedGroupsOptions={setRelatedGroupsOptions}
        relatedGroupOptions={relatedGroupOptions}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        updateCurrentGroup={updateCurrentGroup}
        isSelectedTotalData={isSelectedTotalData}
        isImportInProcess={isImportProcessing}
      />
    );
  };
  const handleCloseBulkNotes = () => {
    setShowBulkNoteModal(false);
    tableRef.current.resetSelectedRows();
  };

  const handleCloseCreateBulkTask = () => {
    setShowBulkTaskModal(false);
    tableRef.current.resetSelectedRows();
  };

  const handleCloseMassEmail = () => {
    setShowSendMassMailModal(false);
    tableRef.current.resetSelectedRows();
  };

  return (
    <>
      <ServerSideTable
        initialTableFilters={{ archived: false }}
        isSelectedTotalData={isSelectedTotalData}
        setIsSelectedTotalData={setIsSelectedTotalData}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        unselectedRows={unselectedRows}
        setUnselectedRows={setUnselectedRows}
        header={header()}
        ref={tableRef}
        blocking={isLoading}
        selectableRows={true}
        columns={columns}
        getRecord={getContacts}
        data={contactsData}
        itemsPerPage={10}
        extraMessage={isImportProcessing ? importProcessingMessage : null}
        filters={Filters()}
        initialDataFetch={false}
        cardClass='contact__list__page'
      />

      {openUploadContact ? (
        <>
          <ImportContact
            openUploadContact={openUploadContact}
            closeUploadModal={closeUploadModal}
            refetchContacts={() => tableRef?.current?.refreshTable({})}
          />
        </>
      ) : null}

      {openUploadUnSubContact ? (
        <>
          <ImportUnSubContact
            openUploadUnsubContact={openUploadUnSubContact}
            closeUploadUnsubModal={closeUploadUnSubModal}
          />
        </>
      ) : null}

      {openChangeGroupModal && (
        <>
          <ContactGroupChange
            openChangeGroupModal={openChangeGroupModal}
            handleCloseContactGroupChangeModal={
              handleCloseContactGroupChangeModal
            }
            selectedContacts={selectedRow}
            selectedRowsFilters={selectedRowsFilters}
            selectedRowLength={selectedRowLength}
          />
        </>
      )}

      {showSwitchGroupModal && (
        <>
          <SwitchGroup
            showSwitchGroupModal={showSwitchGroupModal}
            handleCloseSwitchGroupModal={handleCloseSwitchGroupModal}
          />
        </>
      )}

      {showBulkNoteModal && (
        <>
          <BulkNotes
            showBulkNoteModal={showBulkNoteModal}
            handleCloseBulkNotes={handleCloseBulkNotes}
            selectedRowsFilters={selectedRowsFilters}
          />
        </>
      )}

      {showBulkTaskModal && (
        <TaskModal
          setOpen={() => {}}
          currentFilter={currentFilter}
          setCurrentTasks={() => {}}
          setShowTaskModal={setShowBulkTaskModal}
          showTaskModal={showBulkTaskModal}
          taskOptions={taskOptions}
          setTaskOptions={setTaskOptions}
          handleClearAddUpdateTask={() => {
            handleCloseCreateBulkTask();
          }}
          notifyUserForNewTask={() => {}}
          setCurrentTaskPagination={() => {}}
          setIsSubTask={() => {}}
          editTask={null}
          setUpdateTask={() => {}}
          isSubTask={false}
          isMultipleTasks={true}
          selectedRowsFilters={selectedRowsFilters}
        />
      )}

      {showSendMassMailModal && (
        <SendMassEmailForSelectedContact
          handleCloseMassEmail={handleCloseMassEmail}
          selectedContacts={selectedRow}
          open={showSendMassMailModal}
          setOpen={setShowSendMassMailModal}
          initialFilters={selectedRowsFilters}
          selectedRowLength={selectedRowLength}
        />
      )}
    </>
  );
};

export default Contact;
