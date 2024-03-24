import { useState } from 'react';

import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { updateContactAndFormDetails } from '../../../../../api/contacts';
import { deleteStatus as deleteStatusAPI } from '../../../../../api/status';

const useDeleteStatus = ({ contacts, setModal, setRefreshData }) => {
  const [selectedNewStatus, setSelectedNewStatus] = useState({});

  const deleteStatus = async (statusId = null) => {
    const contactId = [];
    contacts.forEach((c) => contactId.push(c._id));
    const obj = {};
    obj.contacts = contactId;
    obj.status = selectedNewStatus;
    if (obj && contactId.length > 0 && selectedNewStatus) {
      await updateContactAndFormDetails(obj);
    }
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Status?',
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
      preConfirm: async () => {
        return deleteStatusAPI(statusId).then((res) => {
          if (res.status === 200) {
            setModal((prev) => ({ ...prev, delete: false, id: null }));
            setRefreshData(true);
          }
        });
      },
    });
  };

  return {
    deleteStatus,
    setSelectedNewStatus,
    selectedNewStatus,
  };
};

export default useDeleteStatus;
