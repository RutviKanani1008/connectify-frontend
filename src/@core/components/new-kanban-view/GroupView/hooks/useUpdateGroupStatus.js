import { useState } from 'react';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { updateGroup as updateGroupAPI } from '../../../../../api/groups';

const MySwal = withReactContent(Swal);

const useUpdateGroupStatus = ({ setGroups }) => {
  const [loading, setLoading] = useState();

  const updateGroupStatus = async (event, data) => {
    const updatedStatus = event.target.checked;

    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `Are you sure you would like to change status to ${
        updatedStatus ? 'active' : 'inactive'
      }?`,
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
        const obj = {};
        obj.company = data.company;
        obj.active = !data.active;
        obj.groupName = data.groupName;
        obj.type = 'status';

        try {
          setLoading(true);
          const res = await updateGroupAPI(data._id, obj);
          if (res.status === 200) {
            setGroups((prev) =>
              prev.map((p) =>
                p._id === data._id ? { ...p, active: !data.active } : p
              )
            );
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      },
    });
    if (result.dismiss === MySwal.DismissReason.cancel) {
      event.target.checked = !updatedStatus;
    }
  };

  return { updateLoader: loading, updateGroupStatus };
};

export default useUpdateGroupStatus;
