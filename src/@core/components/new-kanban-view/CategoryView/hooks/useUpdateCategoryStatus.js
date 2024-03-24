import { useState } from 'react';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { updateCategory } from '../../../../../api/category';

const MySwal = withReactContent(Swal);

const useUpdateCategoryStatus = ({ setCategory }) => {
  const [loading, setLoading] = useState();

  const updateCategoryStatus = async (event, data) => {
    const updatedStatus = event.target.checked;

    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `Are you sure you would like to change category to ${
        updatedStatus ? 'active' : 'inactive'
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
      preConfirm: async () => {
        const obj = {};
        obj.company = data.company;
        obj.active = !data.active;
        obj.categoryName = data.categoryName;
        obj.groupId = data.groupId;
        obj.type = 'status';

        try {
          setLoading(true);
          const res = await updateCategory(data._id, obj);
          if (res.status === 200) {
            setCategory((prev) =>
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

  return { updateLoader: loading, updateCategoryStatus };
};

export default useUpdateCategoryStatus;
