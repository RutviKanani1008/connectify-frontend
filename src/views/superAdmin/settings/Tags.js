import React, { useEffect, useState } from 'react';
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from 'reactstrap';
import UILoader from '@components/ui-loader';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import ItemTable from '../../../@core/components/data-table';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  addTag,
  getCompany,
  deleteTag,
  getTags,
  updateTag,
} from '../../../api/company';
import { useParams } from 'react-router-dom';
const MySwal = withReactContent(Swal);
const Tags = () => {
  const [companyName, setCompanyName] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(false);
  const [tags, setTags] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [openTagModal, setOpenTagModal] = useState(false);
  const [currentTag, setCurrentTag] = useState({ text: '' });
  const [isUpdateTag, setIsUpdateTag] = useState(false);
  const [showError, setShowError] = useState(false);
  const params = useParams();
  const getRecords = (id) => {
    setFetching(true);
    getTags({ company: id, type: params.type })
      .then((res) => {
        setFetching(false);
        setTags(res.data.data);
      })
      .catch(() => {
        setFetching(false);
      });
  };
  const getCompanyNames = async () => {
    const companyName = await getCompany({ select: 'name' });
    const company = [];
    companyName?.data?.data?.forEach((companyData) => {
      const obj = {};
      obj['value'] = companyData._id;
      obj['label'] = companyData.name;
      company.push(obj);
    });
    if (company && company.length > 0) {
      getRecords(company[0].value);
      setSelectedCompany(company[0]);
    }
    setCompanyName(company);
  };

  useEffect(() => {
    getCompanyNames();
  }, []);

  const handleConfirmDelete = (id) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Tag?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading);
        deleteTag(id).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(TOASTTYPES.success, toastId, 'Tag Deleted Successfully');
            getRecords(selectedCompany.value);
          }
        });
      }
    });
  };

  const handleEditTag = (id) => {
    const selectTag = tags.find((Tag) => Tag._id === id);
    if (selectTag && selectTag.tagName) {
      setIsUpdateTag(selectTag);
      setCurrentTag({ text: selectTag.tagName });
      setOpenTagModal(!openTagModal);
    }
  };

  const handleChangeStatus = (status, row) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you would like to change active status?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
        const obj = {};
        obj.company = row.company;
        obj.active = !row.active;
        obj.tagName = row.tagName;
        updateTag(row._id, obj).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(TOASTTYPES.success, toastId, 'Tag Updated Successfully');
            getRecords(selectedCompany.value);
          }
        });
      } else if (result.dismiss === MySwal.DismissReason.cancel) {
        status.target.checked = !status.target.checked;
      }
    });
  };

  const columns = [
    {
      name: 'Name',
      minWidth: '250px',
      sortable: (row) => row?.tagName,
      selector: (row) => row?.tagName,
    },
    {
      name: 'Status',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='d-flex'>
            <span className='align-middle ms-50'>
              <div className='form-switch'>
                <Input
                  type='switch'
                  label='Status'
                  name='status'
                  defaultChecked={row?.active}
                  onChange={(e) => handleChangeStatus(e, row)}
                />
              </div>
            </span>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='d-flex'>
            <div
              onClick={() => {
                handleEditTag(row?._id);
              }}
              className='cursor-pointer text-primary'
            >
              Edit
            </div>
            <div
              onClick={() => {
                handleConfirmDelete(row?._id);
              }}
              className='px-1 cursor-pointer text-danger'
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  const addNewTag = () => {
    setOpenTagModal(!openTagModal);
  };

  const createTag = () => {
    const toastId = showToast(TOASTTYPES.loading);

    if (isUpdateTag) {
      const obj = {};
      obj.tagName = currentTag?.text;
      obj.active = isUpdateTag?.active;
      obj.company = isUpdateTag?.company;
      updateTag(isUpdateTag._id, obj).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(TOASTTYPES.success, toastId, 'Tag Updated Successfully');
          getRecords(selectedCompany.value);
        }
        setOpenTagModal(!openTagModal);
        setCurrentTag({ text: '' });
        setIsUpdateTag(false);
      });
    } else {
      const obj = {};
      obj.tagName = currentTag.text;
      obj.active = true;
      obj.company = selectedCompany.value;
      addTag(obj).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(TOASTTYPES.success, toastId, 'Tag Added Successfully');
          getRecords(selectedCompany.value);
        }
        setOpenTagModal(!openTagModal);
        setCurrentTag({ text: '' });
        setIsUpdateTag(false);
      });
    }
  };

  const handleCompanyChange = (e) => {
    setSelectedCompany(e);
    getRecords(e.value);
  };

  const childDropdown = (
    <div className='mb-2'>
      <Select
        id={'company_details'}
        theme={selectThemeColors}
        style={{ width: '10%' }}
        placeholder={'Select Company'}
        classNamePrefix='select'
        options={companyName}
        isClearable={false}
        value={selectedCompany}
        onChange={(e) => {
          handleCompanyChange(e);
        }}
        isMulti={false}
        isOptionSelected={(option, selectValue) =>
          selectValue.some((i) => i === option)
        }
        isDisabled={false}
      />
    </div>
  );

  return (
    <div>
      <UILoader blocking={fetching}>
        <ItemTable
          columns={columns}
          data={tags}
          title={'Tags'}
          addItemLink={false}
          onClickAdd={addNewTag}
          childDropdown={childDropdown}
          buttonTitle={'Add Tag'}
          itemsPerPage={10}
        />
      </UILoader>
      <Modal
        isOpen={openTagModal}
        toggle={() => setOpenTagModal(!openTagModal)}
        className='modal-dialog-centered'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setCurrentTag({ text: '' });
            setOpenTagModal(!openTagModal);
            setIsUpdateTag(false);
            setShowError(false);
          }}
        >
          {isUpdateTag ? 'Update Tag' : 'Add Tag'}
        </ModalHeader>
        <ModalBody>
          <div className='mb-2'>
            <Input
              label='Stage Name'
              name='stage'
              placeholder='Tag Name'
              type='text'
              value={currentTag.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentTag({
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>Please Enter Tag Name.</div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => {
              if (currentTag.text === '') {
                setShowError(true);
              } else {
                createTag();
              }
            }}
          >
            {isUpdateTag ? 'Update Tag' : 'Add Tag'}
          </Button>
          <Button
            color='danger'
            onClick={() => {
              setCurrentTag({ text: '' });
              setOpenTagModal(!openTagModal);
              setIsUpdateTag(false);
              setShowError(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Tags;
