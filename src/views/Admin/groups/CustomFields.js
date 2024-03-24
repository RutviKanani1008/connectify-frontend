import React, { useEffect, useState } from 'react';
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  UncontrolledTooltip,
} from 'reactstrap';
import { userData } from '../../../redux/user';
import { useSelector } from 'react-redux';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams } from 'react-router-dom';
import { Edit2, Trash } from 'react-feather';
import { getGroups } from '../../../api/groups';
import {
  addCustomField,
  deleteCustomField,
  getCustomField,
  updateCustomField,
} from '../../../api/customField';
import { SaveButton } from '@components/save-button';
import CustomSelect from '../../../@core/components/form-fields/CustomSelect';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import useGroupPersist from './hooks/useGroupPersist';
import ExportData from '../../../components/ExportData';
import { useDraggable } from '../../../@core/components/data-table/hooks/useDragging';
import SortableTable from '../../../@core/components/data-table/SortableTable';

const MySwal = withReactContent(Swal);
const CustomFields = () => {
  const [initialGroup, setInitialGroup] = useGroupPersist();

  const [groupName, setGroupName] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [customField, setCustomField] = useState([]);
  const [fetching, setFetching] = useState(false);
  const user = useSelector(userData);
  const [openCustomFieldModal, setOpenCustomFieldModal] = useState(false);
  const [currentField, setCurrentField] = useState({ text: '' });
  const [isUpdateCustomField, setIsUpdateCustomField] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { onDragEnd, sortableHandle } = useDraggable({
    originalDataList: customField,
    setOriginalDataList: setCustomField,
    model: 'customField',
  });

  const params = useParams();
  const getRecords = (id) => {
    setFetching(true);
    getCustomField({ company: user.company._id, groupId: id })
      .then((res) => {
        setFetching(false);
        setCustomField(res.data.data.sort((a, b) => a.position - b.position));
      })
      .catch(() => {
        setFetching(false);
      });
  };

  const getGroupNames = async () => {
    setFetching(true);
    getGroups({
      company: user.company._id,
      active: true,
    })
      .then((res) => {
        setFetching(false);
        const groups = [];
        res?.data?.data?.forEach((group) => {
          const obj = {};
          obj['value'] = group._id;
          obj['label'] = group.groupName;
          groups.push(obj);
        });
        if (groups && groups.length > 0) {
          if (selectedGroup) {
            getRecords(selectedGroup.value);
          } else {
            setInitialGroup(groups[0]);
            setSelectedGroup(groups[0]);
            const groupObj = groups[0]?.value || null;
            groupObj && getRecords(groupObj);
          }
        }

        setGroupName(groups);
      })
      .catch(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    getGroupNames();
  }, [params]);

  const handleConfirmDelete = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Custom Field?',
      confirmButtonText: 'Yes',
      inputAttributes: {
        autocapitalize: 'off',
      },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        return deleteCustomField(id).then((res) => {
          if (res?.data?.data) {
            getRecords(selectedGroup.value);
          }
        });
      },
    });

    if (result.isConfirmed) {
      //
    }
  };

  const handleEditTag = (id) => {
    const selectTag = customField.find((Tag) => Tag._id === id);
    if (selectTag && selectTag.fieldName) {
      setIsUpdateCustomField(selectTag);
      setCurrentField({ text: selectTag.fieldName });
      setOpenCustomFieldModal(!openCustomFieldModal);
    }
  };

  const handleChangeStatus = async (status, row) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `Are you sure you would like to change status to ${
        status.target.checked ? 'active' : 'inactive'
      }?`,
      confirmButtonText: 'Yes',
      inputAttributes: {
        autocapitalize: 'off',
      },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        const obj = {};
        obj.company = row.company;
        obj.active = !row.active;
        obj.fieldName = row.fieldName;
        obj.groupId = row.groupId;
        obj.type = 'status';

        return updateCustomField(row._id, obj).then((res) => {
          if (res.error) {
            // showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            getRecords(selectedGroup.value);
          }
        });
      },
    });

    if (result.isConfirmed) {
      //
    } else if (result.dismiss === MySwal.DismissReason.cancel) {
      status.target.checked = !status.target.checked;
    }
  };

  const columns = [
    {
      name: 'Field Name',
      minWidth: '250px',
      searchKey: 'fieldName',
      // sortable: (row) => row?.fieldName,
      selector: (row) => row?.fieldName,
      isSearchable: true,
    },
    {
      name: 'Active',
      cell: (row) => {
        return (
          <div className='switch-checkbox'>
            <Input
              type='switch'
              label='Status'
              name='status'
              defaultChecked={row?.active}
              onChange={(e) => handleChangeStatus(e, row)}
            />
            <span className='switch-design'></span>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      cell: (row) => {
        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn edit-btn'>
              <Edit2
                // color='#a3db59'
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  handleEditTag(row?._id);
                }}
                id={`view_${row?._id}`}
              />
              <UncontrolledTooltip placement='top' target={`view_${row?._id}`}>
                Edit
              </UncontrolledTooltip>
            </div>
            <div className='action-btn edit-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  handleConfirmDelete(row?._id);
                }}
                id={`delete_${row?._id}`}
              />
              <UncontrolledTooltip
                placement='top'
                target={`delete_${row?._id}`}
              >
                Delete
              </UncontrolledTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  const addNewCustomField = () => {
    setOpenCustomFieldModal(!openCustomFieldModal);
  };

  const createCustomField = () => {
    setButtonLoading(true);

    if (isUpdateCustomField) {
      const obj = {};
      obj.fieldName = currentField?.text;
      obj.active = isUpdateCustomField?.active;
      obj.company = isUpdateCustomField?.company;
      obj.groupId = isUpdateCustomField?.groupId;
      obj.type = 'updateName';

      obj.type = isUpdateCustomField.type;
      updateCustomField(isUpdateCustomField._id, obj).then((res) => {
        if (res.error) {
          setShowError(true);
          setErrorMessage(res.error);
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          setShowError(false);
          setErrorMessage(false);
          showToast(
            TOASTTYPES.success,
            '',
            'Custom Field Updated Successfully'
          );
          getRecords(selectedGroup.value);
          setOpenCustomFieldModal(!openCustomFieldModal);
          setCurrentField({ text: '' });
          setIsUpdateCustomField(false);
        }
        setButtonLoading(false);
      });
    } else {
      const obj = {};
      obj.fieldName = currentField.text;
      obj.active = true;
      obj.company = user.company._id;
      obj.groupId = selectedGroup.value;

      addCustomField(obj).then((res) => {
        if (res.error) {
          setShowError(true);
          setErrorMessage(res.error);
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          setShowError(false);
          setErrorMessage(false);
          showToast(TOASTTYPES.success, '', 'Custom Field Added Successfully');
          getRecords(selectedGroup.value);
          setOpenCustomFieldModal(!openCustomFieldModal);
          setCurrentField({ text: '' });
          setIsUpdateCustomField(false);
        }
        setButtonLoading(false);
      });
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e);
    setInitialGroup(e);
    getRecords(e.value);
  };

  const childDropdown = (
    <div className=''>
      <CustomSelect
        classNamePrefix='custom-select'
        value={selectedGroup}
        options={groupName}
        onChange={(e) => {
          handleGroupChange(e);
        }}
        label='Select Group'
      />
    </div>
  );

  return (
    <>
      <div className='contact-customField-page'>
        <SortableTable
          isLoading={fetching}
          columns={columns}
          data={customField}
          onDragEnd={onDragEnd}
          title={'Custom Fields'}
          itemsPerPage={10}
          buttonTitle={'Add Custom Field'}
          ExportData={<ExportData model='customField' />}
          onClickAdd={addNewCustomField}
          ref={sortableHandle}
          extraActions={childDropdown}
        />
      </div>
      <Modal
        isOpen={openCustomFieldModal}
        toggle={() => setOpenCustomFieldModal(!openCustomFieldModal)}
        className='modal-dialog-centered add-contact-customField-modal modal-dialog-mobile'
        backdrop='static'
        fade={false}
      >
        <ModalHeader
          toggle={() => {
            setCurrentField({ text: '' });
            setOpenCustomFieldModal(!openCustomFieldModal);
            setIsUpdateCustomField(false);
            setShowError(false);
          }}
        >
          {isUpdateCustomField ? 'Update Custom Field' : 'Add Custom Field'}
        </ModalHeader>
        <ModalBody>
          <div className='normal-text mb-1'>
            {isUpdateCustomField ? 'Updating' : 'Adding'} custom field{' '}
            {isUpdateCustomField ? 'of' : 'into'}
            <span className='text-primary'>{` ${selectedGroup?.label}`} </span>
          </div>
          <div className='mb-1'>
            <Input
              label='Stage Name'
              name='stage'
              placeholder='Custom Field Name'
              type='text'
              value={currentField.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentField({
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>
                  {errorMessage
                    ? errorMessage
                    : 'Please Enter Custom Field Name.'}
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <SaveButton
            color='primary'
            onClick={() => {
              if (currentField.text === '') {
                setShowError(true);
              } else {
                createCustomField();
              }
            }}
            loading={buttonLoading}
            name={
              isUpdateCustomField ? 'Update Custom Field' : 'Add Custom Field'
            }
            width={isUpdateCustomField ? '45%' : '40%'}
          ></SaveButton>
          <Button
            color='danger'
            onClick={() => {
              setCurrentField({ text: '' });
              setOpenCustomFieldModal(!openCustomFieldModal);
              setIsUpdateCustomField(false);
              setShowError(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CustomFields;
