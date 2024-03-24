import { useState, useRef } from 'react';
import { Edit2, Trash, AlertCircle } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import {
  useDeleteImportProduct,
  useGetImportProducts
} from '../hooks/InventoryProductApi';
import UploadProductUpdateModal from './UploadProductUpdateModal';

const ViewUploadedProducts = ({
  paginatedImportedProducts,
  setPaginatedImportedProducts,
  importId,
}) => {
  const updateProductModalRef = useRef(null);

  const [tableKey, setTableKey] = useState(Math.random());

  const { getImportProducts, isLoading: fetching } = useGetImportProducts();
  const { deleteImportProduct } = useDeleteImportProduct();

  const getPaginatedImportProducts = async (filter, importId) => {
    try {
      const { data, error } = await getImportProducts({
        currentImportedProduct: importId,
        limit: filter.limit,
        page: filter.page,
        select: 'data,productErrors,company,importedProduct',
      });
      if (!error && data)
        setPaginatedImportedProducts({
          results:
            data?.data?.map((el) => ({
              ...el.data,
              errors: el.productErrors,
              _id: el._id,
            })) || [],
          total: data?.pagination?.total || 0,
          totalContactsWithError: data?.importErrors?.totalErrors || 0,
          contactsWithInvalidEmail: data?.importErrors?.isInvalidEmail || 0,
          contactsAlreadyExists:
          data?.importErrors?.isContactAlreadyExists || 0,
          contactsWithoutEmail: data?.importErrors?.isEmailNotExists || 0,
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
                {row?.errors?.isSku && (
                  <>
                    <li>Sku not found.</li>
                  </>
                )}
                {row?.errors?.isTitleNotExists && (
                  <>
                    <li>Title not found.</li>
                  </>
                )}
                {row?.errors?.isQuantityNotExists && (
                  <>
                    <li>Quantity not found.</li>
                  </>
                )}
                  {row?.errors?.isQuantityNotNumber && (
                  <>
                    <li>Quantity is not a number.</li>
                  </>
                )}
              </ul>
            </UncontrolledTooltip>
          </div>
        );
      },
    },

    {
      name: 'Product Title',
      minWidth: '150px',
      sortable: (row) => row?.title,
      selector: (row) => row?.title,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.title ? row?.title : '-'}
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
      name: 'Price',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.price,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.price ? row?.price : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Sale Price',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.salePrice,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.salePrice ? row?.salePrice : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Quantity',
      sortable: true,
      minWidth: '300px',
      selector: (row) => row?.quantity,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.quantity}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Sku',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.sku,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.sku ? row?.sku : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Width',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.width,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.width ? row?.width : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Height',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.height,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.height ? row?.height : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Length',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.length,
      cell: (row) => {
        return (
          <div>
            <span className={`${row?.errors ? 'text-danger' : ''}`}>
              {row?.length ? row?.length : '-'}
            </span>
          </div>
        );
      },
    },
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
                    updateProductModalRef.current.handleEditProduct(row);
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
      text: 'Are you sure you want to delete this Product ?',
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      await deleteImportProduct(id);
      setTableKey(Math.random());
    }
  };


  return (
    <>
      <ServerSideTable
        blocking={fetching}
        selectableRows={false}
        columns={columns}
        getRecord={(filters) =>
          getPaginatedImportProducts(
            { ...filters},
            importId
          )
        }
        data={paginatedImportedProducts}
        itemsPerPage={10}
        key={tableKey}
      />

      {/* <div>
        <GroupsFormField
          setValue={setValue}
          watch={watch}
          control={control}
          errors={errors}
          showHeader={true}
        />
      </div> */}
      <UploadProductUpdateModal
        ref={updateProductModalRef}
        importedProducts={paginatedImportedProducts}
        setImportedProducts={setPaginatedImportedProducts}
      />
    </>
  );
};
export default ViewUploadedProducts;
