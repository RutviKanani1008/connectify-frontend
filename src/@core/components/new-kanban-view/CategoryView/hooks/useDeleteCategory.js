import { useState } from 'react';

import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { updateContactAndFormDetails } from '../../../../../api/contacts';
import { deleteCategory as deleteCategoryAPI } from '../../../../../api/category';

const useDeleteCategory = ({ contacts, setModal, setRefreshData }) => {
  const [selectedNewCategory, setSelectedNewCategory] = useState({});

  const deleteCategory = async (categoryId = null) => {
    const contactId = [];
    contacts.forEach((c) => contactId.push(c._id));
    const obj = {};
    obj.contacts = contactId;
    obj.category = selectedNewCategory;

    if (obj && contactId.length > 0 && selectedNewCategory) {
      await updateContactAndFormDetails(obj);
    }
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Category?',
      allowOutsideClick: false,
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
        return deleteCategoryAPI(categoryId).then((res) => {
          if (res?.status === 200) {
            setModal((prev) => ({ ...prev, delete: false, id: null }));
            setRefreshData(true);
          }
        });
      },
    });
  };

  return { deleteCategory, selectedNewCategory, setSelectedNewCategory };
};

export default useDeleteCategory;
