import { useState, useRef } from 'react';
import { Edit2, Trash, AlertCircle } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
// import ItemTable from '../../../../@core/components/data-table';
import CustomSelect from '../../../../@core/components/form-fields/CustomSelect';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { GroupsFormField } from './GroupsFormField';
import UploadContactModal from './UploadContactModal';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import {
  useDeleteImportContact,
  useGetImportContacts,
} from '../service/contact.services';

const ViewUploadContact = ({
  customFields,
  paginatedImportedContacts,
  setPaginatedImportedContacts,
  setValue,
  watch,
  control,
  errors,
  importId,
}) => {
  const updateContactModalRef = useRef(null);

  const [tableKey, setTableKey] = useState(Math.random());

  const { getImportContacts, isLoading: fetching } = useGetImportContacts();
  const { deleteImportContact } = useDeleteImportContact();

  const getPaginatedImportContacts = async (filter, importId) => {
    try {
      const { data, error } = await getImportContacts({
        currentImportedContact: importId,
        limit: filter.limit,
        page: filter.page,
        show: filter.showContacts?.value,
        contactErrors: filter.showContacts?.value,
        select: 'data,contactErrors,company,importedContact',
      });
      if (!error && data)
        setPaginatedImportedContacts({
          results:
            data?.data?.map((el) => ({
              ...el.data,
              errors: el.contactErrors,
              _id: el._id,
            })) || [],
          total: data?.pagination?.total || 0,
          totalContactsWithError: data?.importErrors?.totalErrors || 0,
          contactsWithInvalidEmail: data?.importErrors?.isInvalidEmail || 0,
          contactsAlreadyExists:
            data?.importErrors?.isContactAlreadyExists || 0,
          contactsWithoutName: data?.importErrors?.isNameNotExists || 0,
          contactsWithDuplicateEmail: data?.importErrors?.isDuplicateEmail || 0,
        });
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      name: '*',
      sortable: true,
      minWidth: '20px',
      cell: (row, index) => {
        return (
          <div>
            <span
              className={`${row.errors ? 'text-danger' : ''}`}
              id={`error_${index}`}
            >
              {row?.errors ? <AlertCircle size={15} /> : '-'}
            </span>
            <UncontrolledTooltip placement='top' target={`error_${index}`}>
              <ul>
                {row?.errors?.isContactAlreadyExists && (
                  <>
                    <li>Contact already exists.</li>
                  </>
                )}
                {row?.errors?.isDuplicateEmail && (
                  <>
                    <li>Duplicate contact found.</li>
                  </>
                )}
                {row?.errors?.isNameNotExists && (
                  <>
                    <li>Name not found.</li>
                  </>
                )}
                {row?.errors?.isInvalidEmail && (
                  <>
                    <li>Invalid Email Address.</li>
                  </>
                )}
              </ul>
            </UncontrolledTooltip>
          </div>
        );
      },
    },

    {
      name: 'First Name',
      minWidth: '150px',
      sortable: (row) => row?.firstName,
      selector: (row) => row?.firstName,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.firstName ? row?.firstName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Last Name',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.lastName ? row?.lastName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Comapny',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.company_name,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.company_name ? row?.company_name : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Website',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.website,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.website ? row?.website : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      minWidth: '300px',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.email}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Phone',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.phone ? row?.phone : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Group',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.group ? row?.group : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Status',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.status,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.status ? row?.status : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Category',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.category,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.category ? row?.category : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Tags',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.tags,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.['tags'] && row?.['tags'].length
                ? row?.['tags']?.map((obj, index) => {
                    if (index === row['tags'].length - 1) {
                      return `${obj}`;
                    }
                    return `${obj},`;
                  })
                : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Pipeline',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.pipeline,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.pipeline ? row?.pipeline : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Stage',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.stage,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.stage ? row?.stage : '-'}
            </span>
          </div>
        );
      },
    },
    ...customFields
      .filter((field) => !!field.value)
      .map((field) => {
        return {
          name: field.label,
          sortable: true,
          minWidth: '150px',
          cell: (row) => {
            const find = (row?.customeField || []).find(
              (c) => c.question === field.label
            );
            return (
              find && (
                <div>
                  <span>{find?.answer || '-'}</span>
                </div>
              )
            );
          },
        };
      }),
    {
      name: 'Action',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.isExist,
      cell: (row, index) => {
        return (
          <div className='action-btn-wrapper'>
            <div className={`action-btn edit-btn ${row?.errors ? '' : ''}`}>
              <>
                <Edit2
                  // color={'#64c664'}
                  size={15}
                  className='cursor-pointer'
                  id={`edit_${index}_actions`}
                  onClick={() => {
                    updateContactModalRef.current.handleEditContact(row);
                  }}
                ></Edit2>
                <UncontrolledTooltip
                  placement='top'
                  target={`edit_${index}_actions`}
                >
                  Edit
                </UncontrolledTooltip>{' '}
              </>
            </div>
            <div className='action-btn delete-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => handleConfirmDelete(row)}
                id={`delete_${row?._id}`}
              ></Trash>
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

  const handleConfirmDelete = async (row) => {
    const { _id: id } = row;
    const result = await showWarnAlert({
      text: 'Are you sure you want to delete this contact ?',
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      await deleteImportContact(id);
      setTableKey(Math.random());
      // setPaginatedImportedContacts({
      //   results: [
      //     ...paginatedImportedContacts.results.filter((el) => el._id !== id),
      //   ],
      //   total: paginatedImportedContacts.total - 1,
      //   totalContactsWithError: row?.errors
      //     ? paginatedImportedContacts.totalContactsWithError - 1
      //     : paginatedImportedContacts.totalContactsWithError,
      // });
    }
  };

  const filerOption = [
    { value: 'all', label: 'All Contact' },
    { value: 'contactsWithNoError', label: 'Contacts with no issue' },
    { value: 'totalContactsWithError', label: 'Contacts with issue' },
    { value: 'isInvalidEmail', label: 'Contacts with invalid email' },
    { value: 'isContactAlreadyExists', label: 'Contacts already exists' },
    { value: 'isNameNotExists', label: 'Contacts without name' },
    {
      value: 'isDuplicateEmail',
      label: 'Contacts with duplicate email',
    },
  ];
  const [currentFilter, setCurrentFilter] = useState({
    value: 'all',
    label: 'All Contact',
  });
  const handleChangeFilter = (e) => {
    setCurrentFilter(e);
    setTableKey(Math.random());
  };

  return (
    <>
      <div className='contactBox-row'>
        <div className='contactBox-col'>
          <div className='inner-wrapper'>
            <h3 className='title'>Total contacts</h3>
            <p className='value'>{paginatedImportedContacts.total}</p>
          </div>
        </div>
        <div className='contactBox-col'>
          <div className='inner-wrapper'>
            <h3 className='title'>Contact with one or more issues</h3>
            <p className='value'>
              {paginatedImportedContacts.totalContactsWithError}
            </p>
          </div>
        </div>
        <div className='contactBox-col'>
          <div className='inner-wrapper'>
            <h3 className='title'>Contact with invalid email</h3>
            <p className='value'>
              {paginatedImportedContacts.contactsWithInvalidEmail}
            </p>
          </div>
        </div>
        <div className='contactBox-col'>
          <div className='inner-wrapper'>
            <h3 className='title'>Contacts already exists</h3>
            <p className='value'>
              {paginatedImportedContacts.contactsAlreadyExists}
            </p>
          </div>
        </div>
        <div className='contactBox-col'>
          <div className='inner-wrapper'>
            <h3 className='title'>Contacts without name</h3>
            <p className='value'>
              {paginatedImportedContacts.contactsWithoutName}
            </p>
          </div>
        </div>
        <div className='contactBox-col'>
          <div className='inner-wrapper'>
            <h3 className='title'>Contacts with duplicate email</h3>
            <p className='value'>
              {paginatedImportedContacts.contactsWithDuplicateEmail}
            </p>
          </div>
        </div>
      </div>
      <div className='filter-contact'>
        <CustomSelect
          isDisabled={false}
          classNamePrefix='custom-select'
          value={currentFilter}
          options={filerOption}
          onChange={(e) => {
            handleChangeFilter(e);
          }}
          label='Filter contacts'
        />
      </div>
      <div className='importCNTable-wrapper'>
        <ServerSideTable
          blocking={fetching}
          selectableRows={false}
          columns={columns}
          getRecord={(filters) =>
            getPaginatedImportContacts(
              { ...filters, showContacts: currentFilter },
              importId
            )
          }
          data={paginatedImportedContacts}
          itemsPerPage={10}
          key={tableKey}
        />
      </div>

      <div>
        <GroupsFormField
          setValue={setValue}
          watch={watch}
          control={control}
          errors={errors}
          showHeader={true}
        />
      </div>
      <UploadContactModal
        ref={updateContactModalRef}
        importedContacts={paginatedImportedContacts}
        setImportedContacts={setPaginatedImportedContacts}
      />
    </>
  );
};
export default ViewUploadContact;
