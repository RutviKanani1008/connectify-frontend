import { useState } from 'react';

import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { updateContactAndFormDetails } from '../../../../../api/contacts';
import { deleteGroup as deleteGroupAPI } from '../../../../../api/groups';

const useDeleteGroup = ({ contacts, forms, setModal, setRefreshData }) => {
  const [selectedNewGroup, setSelectedNewGroup] = useState(null);

  const deleteGroup = async (groupId = null) => {
    const contactId = [];
    contacts.forEach((c) => contactId.push(c._id));
    const formId = [];
    forms.forEach((c) => formId.push(c._id));
    const obj = {};
    obj.contacts = contactId;
    obj.forms = formId;
    obj.group = selectedNewGroup;

    if (obj && contactId.length > 0 && selectedNewGroup) {
      await updateContactAndFormDetails(obj);
    }
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Group?',
      confirmButtonText: 'Yes',
      inputAttributes: { autocapitalize: 'off' },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
        loader: 'custom-loader',
      },
      preConfirm: async () => {
        return deleteGroupAPI(groupId).then((res) => {
          if (res?.status === 200) {
            setModal((prev) => ({ ...prev, delete: false, id: null }));
            setRefreshData(true);
          }
        });
      },
    });
  };

  return { deleteGroup, selectedNewGroup, setSelectedNewGroup };
};

export default useDeleteGroup;
