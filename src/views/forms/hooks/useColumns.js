import { Edit2, Eye, Trash } from 'react-feather';

import { store } from '../../../redux/store';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom';
import { renderFile } from '../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { removeSpecialCharactersFromString } from '../../../helper/common.helper';
import FormActionDropdown from '../component/FormAction';
import _ from 'lodash';

const useColumn = ({
  handleConfirmDelete,
  cloneFormDetails,
  handleFormPreview,
  handleTrashForm,
  handleIconCardClick,
  formFields,
  setOpenPreviewImage,
  editResponse,
  deleteResponse,
}) => {
  const storeState = store.getState();
  const user = storeState.user.userData;

  const { basicRoute } = useGetBasicRoute();

  const history = useHistory();

  const columns = [
    {
      name: 'Title',
      minWidth: '400px',
      // maxWidth: '300px',
      sortField: 'title',
      sortable: (row) => row?.title,
      selector: (row) => row?.title,
      cell: (row) => <span className='text-capitalize'>{row.title}</span>,
    },
    {
      name: 'View Submissions',
      minWidth: '400px',
      cell: (row) => {
        const { _id } = row;
        return (
          <div className=''>
            <a
              onClick={() => {
                if (user.role === 'superadmin') {
                  history.push(`/marketing/web-forms/response/${_id}`);
                } else {
                  history.push(
                    `${basicRoute}/marketing/web-forms/response/${_id}`
                  );
                }
              }}
            >
              <span className='align-middle ms-50'>View Submissions </span>
            </a>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      minWidth: '250px',
      maxWidth: '300px',

      allowOverflow: true,
      cell: (row) => {
        return (
          <FormActionDropdown
            cloneFormDetails={cloneFormDetails}
            handleConfirmDelete={handleConfirmDelete}
            handleFormPreview={handleFormPreview}
            handleIconCardClick={handleIconCardClick}
            handleTrashForm={handleTrashForm}
            formDetails={row}
          />
        );
      },
    },
  ];

  const submissionColumns = [
    ...(formFields?.length
      ? formFields?.map((field, index) => {
          if (field.type === 'file') {
            const obj = {};
            obj.name = field.label;
            obj.minWidth = '250px';
            obj.cell = (row) => {
              return (
                <>
                  {row?.response?.[field?.label]?.length ? (
                    <div className='file__drop__zone_wp'>
                      <div className='file__card m-1'>
                        <div className='d-flex justify-content-center file__preview__wp'>
                          <div className='file__preview__sm'>
                            {renderFile(
                              `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${
                                row?.response?.[field?.label][0]
                              }`
                            )}
                          </div>
                          <div
                            className='overlay cursor-pointer'
                            onClick={() => {
                              setOpenPreviewImage(
                                row?.response?.[field?.label]?.[0]
                              );
                            }}
                          >
                            <Eye color='#ffffff' />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              );
            };
            return obj;
          } else if (['multiSelect', 'select'].includes(field.type)) {
            const obj = {};
            obj.name = field.label;
            obj.minWidth = '250px';
            obj.cell = (row) => {
              return (
                <div key={index}>
                  <span className='cursor-pointer'>
                    {field.type === 'select'
                      ? row?.response?.[
                          removeSpecialCharactersFromString(field?.label)
                        ]?.label
                      : field?.type === 'multiSelect' &&
                        _.isArray(
                          row?.response?.[
                            removeSpecialCharactersFromString(field?.label)
                          ]
                        ) &&
                        row?.response?.[
                          removeSpecialCharactersFromString(field?.label)
                        ]?.length
                      ? row?.response?.[
                          removeSpecialCharactersFromString(field?.label)
                        ]
                          ?.map((obj) => obj.label)
                          ?.join(', ')
                      : _.isString(
                          row?.response?.[
                            removeSpecialCharactersFromString(field?.label)
                          ]
                        )
                      ? row?.response?.[
                          removeSpecialCharactersFromString(field?.label)
                        ]
                      : null}
                  </span>
                </div>
              );
            };
            return obj;
          } else {
            const obj = {};
            obj.name = field.label;
            obj.minWidth = '250px';
            obj.cell = (row) => {
              return (
                <div key={index}>
                  <span className='cursor-pointer'>
                    {
                      row?.response?.[
                        removeSpecialCharactersFromString(field?.label)
                      ]
                    }
                  </span>
                </div>
              );
            };
            return obj;
          }
        })
      : []),
    {
      name: 'Actions',
      allowOverflow: true,
      cell: (row, index) => {
        return (
          <div className='d-flex'>
            <Edit2
              size={15}
              className='me-1 cursor-pointer text-primary'
              onClick={() => {
                editResponse(row, index);
              }}
            />
            <Trash
              size={15}
              className='cursor-pointer text-primary'
              onClick={() => {
                deleteResponse(row, index);
              }}
            />
          </div>
        );
      },
    },
  ];
  return { columns, submissionColumns };
};
export default useColumn;
