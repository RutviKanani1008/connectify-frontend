import React, { useEffect, useState } from 'react';
import UILoader from '@components/ui-loader';
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import ItemTable from '../../../@core/components/data-table';
import {
  addCategory,
  deleteCategory,
  updateCategory,
  getCompany,
  getMemberCategories,
} from '../../../api/company';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Edit2, Trash } from 'react-feather';
const MySwal = withReactContent(Swal);

const MembershipCategories = () => {
  const [companyName, setCompanyName] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(false);
  const [category, setCategory] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ text: '' });
  const [isUpdateCategory, setIsUpdateCategory] = useState(false);
  const [showError, setShowError] = useState(false);
  const getRecords = (value) => {
    setFetching(true);
    getMemberCategories(value)
      .then((res) => {
        setFetching(false);
        setCategory(res.data.data);
      })
      .catch(() => {
        setFetching(false);
      });
  };

  const getcompanyNames = async () => {
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
    getcompanyNames();
  }, []);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e);
    getRecords(e.value);
  };

  const handleConfirmDelete = (id) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this category?',
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
        deleteCategory(id).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Category Deleted Successfully'
            );
            getRecords(selectedCompany.value);
          }
        });
      }
    });
  };

  const handleEditCategory = (id) => {
    const selectCategory = category.find((category) => category._id === id);
    if (selectCategory && selectCategory.categoryName) {
      setIsUpdateCategory(selectCategory);
      setCurrentCategory({ text: selectCategory.categoryName });
      setOpenCategoryModal(!openCategoryModal);
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
        obj.categoryName = row?.categoryName;
        obj.active = !row?.active;
        obj.company = row?.company;
        updateCategory(row._id, obj).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Category Updated Successfully'
            );
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
      sortable: (row) => row?.categoryName,
      selector: (row) => row?.categoryName,
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
            <Edit2
              color='#a3db59'
              size={15}
              className='me-1 cursor-pointer'
              onClick={() => {
                handleEditCategory(row?._id);
              }}
              id={`edit_${row?._id}`}
            />
            <UncontrolledTooltip placement='top' target={`edit_${row?._id}`}>
              Edit
            </UncontrolledTooltip>
            <Trash
              color='red'
              size={15}
              className='cursor-pointer'
              onClick={() => {
                handleConfirmDelete(row?._id);
              }}
              id={`trash_${row?._id}`}
            />
            <UncontrolledTooltip placement='top' target={`trash_${row?._id}`}>
              Delete
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  const addNewCategory = () => {
    setOpenCategoryModal(!openCategoryModal);
  };

  const createCategory = () => {
    const toastId = showToast(TOASTTYPES.loading);

    if (isUpdateCategory) {
      const obj = {};
      obj.categoryName = currentCategory?.text;
      obj.active = isUpdateCategory?.active;
      obj.company = isUpdateCategory?.company;
      updateCategory(isUpdateCategory._id, obj).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(
            TOASTTYPES.success,
            toastId,
            'Category Updated Successfully'
          );
          getRecords(selectedCompany.value);
        }
        setOpenCategoryModal(!openCategoryModal);
        setCurrentCategory({ text: '' });
        setIsUpdateCategory(false);
      });
    } else {
      if (selectedCompany && selectedCompany.value) {
        const obj = {};
        obj.categoryName = currentCategory.text;
        obj.active = true;
        obj.company = selectedCompany.value;
        addCategory(obj).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Category Added Successfully'
            );
            getRecords(selectedCompany.value);
          }
          setOpenCategoryModal(!openCategoryModal);
          setCurrentCategory({ text: '' });
          setIsUpdateCategory(false);
        });
      }
    }
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
        value={selectedCompany}
        isClearable={false}
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
          data={category}
          title={'Member Categories'}
          addItemLink={false}
          onClickAdd={addNewCategory}
          buttonTitle={'Add Categoty'}
          childDropdown={childDropdown}
          itemsPerPage={10}
        />
      </UILoader>
      <Modal
        isOpen={openCategoryModal}
        toggle={() => setOpenCategoryModal(!openCategoryModal)}
        className='modal-dialog-centered'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setCurrentCategory({ text: '' });
            setOpenCategoryModal(!openCategoryModal);
            setIsUpdateCategory(false);
            setShowError(false);
          }}
        >
          {isUpdateCategory ? 'Update Category' : 'Add Category'}
        </ModalHeader>
        <ModalBody>
          <div className='mb-2'>
            <Input
              label='Stage Name'
              name='stage'
              placeholder='Category Name'
              type='text'
              value={currentCategory.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentCategory({
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>
                  Please Enter category Name.
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => {
              if (currentCategory.text === '') {
                setShowError(true);
              } else {
                createCategory();
              }
            }}
          >
            {isUpdateCategory ? 'Update Category' : 'Add Category'}
          </Button>
          <Button
            color='danger'
            onClick={() => {
              setCurrentCategory({ text: '' });
              setOpenCategoryModal(!openCategoryModal);
              setIsUpdateCategory(false);
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

export default MembershipCategories;
