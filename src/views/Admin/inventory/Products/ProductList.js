import React, { useRef, useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  DropdownItem,
  Spinner,
} from 'reactstrap';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import { Plus, Camera, Share, X } from 'react-feather';
import { useGetProducts } from '../hooks/InventoryProductApi';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import useInventoryColumns from '../hooks/useInventoryColumns';
import AddProductModal from '../components/AddProductModal';
import PrintBarcodeModal from '../components/PrintBarcodeModal';
import ExportData from '../../../../components/ExportData';
import { useGetCompanyUsers } from '../../TaskManager/service/userApis';
import Select, { components } from 'react-select';
import Avatar from '@components/avatar';
import { useGetWooConnection } from '../hooks/InventoryWooConnectionApi';
import Flatpickr from 'react-flatpickr';
import ImportProduct from '../components/ImportProduct';
import WooConnectionNotFound from '../components/WooConnectionNotFound';
import ScanModel from '../components/ScanModel';

const ProductList = ({ hideTitle = false, hideButton = false }) => {
  const tableRef = useRef(null);
  const user = useSelector(userData);
  const [product, setProduct] = useState();
  const [currentCompanyUsers, setCurrentCompanyUsers] = useState([]);

  // ========================== states ================================
  const [products, setProducts] = useState({ results: [], total: 0 });
  const [currentFilters, setCurrentFilters] = useState({
    limit: 5,
    page: 1,
    search: '',
    sort: { column: '', order: null },
    startDate: null,
    endDate: null,
  });

  const productStatus = [
    { label: 'All', value: 0 },
    { label: 'Processed by input user', value: 1 },
    { label: 'Processed by storage user', value: 2 },
    { label: 'Processed by product details user', value: 3 },
  ];

  const [addModal, setAddModal] = useState({
    toggle: false,
  });
  const [scanModal, setScanModal] = useState({
    toggle: false,
  });
  const [barcodeModal, setBarcodeModal] = useState(false);
  const [wooStatus, setWooStatus] = useState(false);
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [selectedDate, setSelectedDate] = useState(false);

  //custom hooks
  const { getProducts, isLoading } = useGetProducts();
  const { getCompanyUsers } = useGetCompanyUsers();
  const { getWooConnection, isLoading: getWooDataLoading } =
    useGetWooConnection();

  useEffect(() => {
    getWooData();
  }, []);
  const refRangePicker = useRef(null);

  const getWooData = async () => {
    const { data } = await getWooConnection();
    if (!data) {
      setWooStatus(true);
    } else {
      getCurrentCompanyUser();
    }
  };

  const closeUploadModal = () => {
    setOpenUploadProduct(false);
  };

  const clearDate = () => {
    refRangePicker.current.flatpickr.clear();
    setSelectedDate(false);
    const updatedFilters = {
      ...currentFilters,
      startDate: null,
      endDate: null,
    };
    getRecords(updatedFilters);
  };

  const { SingleValue, Option } = components;

  const IconSingleValue = (props) => (
    <SingleValue {...props}>
      {props.data.image ? (
        <Avatar
          img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${props.data?.image}`}
          imgHeight='32'
          imgWidth='32'
        />
      ) : (
        <Avatar color={'light-primary'} content={props.data?.label} initials />
      )}
      {props.data.label}
    </SingleValue>
  );

  const IconOption = (props) => (
    <Option {...props}>
      {props.data.image ? (
        <Avatar
          img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${props.data?.image}`}
          imgHeight='32'
          imgWidth='32'
        />
      ) : (
        <Avatar color={'light-primary'} content={props.data?.label} initials />
      )}
      {props.data.label}
    </Option>
  );

  const getCurrentCompanyUser = async () => {
    const { data, error } = await getCompanyUsers(user.company?._id, {
      select: 'firstName,userProfile,lastName',
    });
    if (!error) {
      const obj = data.map((item) => ({
        value: item._id,
        label: `${item.firstName} ${item.lastName}`,
        img: item.userProfile,
      }));
      setCurrentCompanyUsers(obj);
    }
  };
  const handlePrintBarcode = async (id) => {
    if (products.results) {
      const singleProduct = products.results.filter((item) => {
        return item._id === id;
      });
      setProduct(singleProduct[0]);
      setBarcodeModal(true);
    }
  };

  const { columns } = useInventoryColumns({
    user,
    handlePrintBarcode,
  });

  const getRecords = async (
    filter,
    currentUser = null,
    productStatus = null
  ) => {
    setCurrentFilters({
      limit: filter.limit,
      page: filter.page,
      search: filter.search,
      sort: filter.sort,
      startDate: filter.startDate,
      endDate: filter.endDate,
    });
    const companyId = user?.company._id;
    const userId = currentUser;

    const { data, error } = await getProducts({
      companyId,
      userId,
      productStatus,
      limit: filter.limit,
      page: filter.page,
      sort: filter.sort,
      search: filter.search,
      startDate: filter.startDate,
      endDate: filter.endDate,
      select:
        'title,description,price,salePrice,category,quantity,location,barcode,sku,createdBy,manufacturerBarcode,productStatus',
    });
    const productDetails = data?.results;

    if (!error)
      setProducts({ results: productDetails, total: data.pagination.total });
  };

  const handelAddNewItem = () => {
    setAddModal({ toggle: true });
  };

  const scanProduct = () => {
    setScanModal({ toggle: true });
  };

  const handleImportItem = () => setOpenUploadProduct(true);

  const filterByCurrentUsers = (e) => {
    e !== null
      ? getRecords(currentFilters, e.value)
      : getRecords(currentFilters);
  };
  const filterByProductStatus = (e) => {
    e !== null
      ? e.value !== 0
        ? getRecords(currentFilters, null, e.value)
        : getRecords(currentFilters)
      : getRecords(currentFilters);
  };

  const filterByDateRange = (dateRange) => {
    if (dateRange.length >= 2) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      if (startDate !== null && endDate !== null) {
        const updatedFilters = { ...currentFilters, startDate, endDate };
        getRecords(updatedFilters);
        setSelectedDate(true);
      } else {
        const updatedFilters = {
          ...currentFilters,
          startDate: null,
          endDate: null,
        };
        setSelectedDate(false);
        getRecords(updatedFilters);
      }
    }
  };

  const header = () => {
    return (
      <div className='card-header-with-buttons card-header product-list-header'>
        <h4 className='title card-title'>{!hideTitle ? 'Product List' : ''}</h4>
        <div className='right'>
          <div className='product-date-box ms-1'>
            <Flatpickr
              id='filter-date'
              name='filter-date'
              className='form-control'
              placeholder='Filter By Date'
              onChange={(e) => filterByDateRange(e)}
              options={{
                static: true,
                time_24hr: false,
                mode: 'range',
              }}
              ref={refRangePicker}
            />
            {selectedDate && <X onClick={clearDate} />}
          </div>
          <div className='contact-select-box'>
            <Select
              classNamePrefix='custom-select'
              isClearable={true}
              options={currentCompanyUsers}
              onChange={(e) => {
                filterByCurrentUsers(e);
              }}
              placeholder='Filter by Users'
              components={{ SingleValue: IconSingleValue, Option: IconOption }}
            />
          </div>
          {user.inventoryRole === 'adminUser' && (
            <div className='contact-select-box'>
              <Select
                classNamePrefix='custom-select'
                isClearable={true}
                options={productStatus}
                onChange={(e) => {
                  filterByProductStatus(e);
                }}
                placeholder='Filter By Status'
              />
            </div>
          )}
          {
            <ExportData
              model='inventoryproducts'
              query={currentFilters}
              childDropDownOptions={
                <>
                  <DropdownItem className='w-100' onClick={handleImportItem}>
                    <Share size={15} />
                    <span className='align-middle ms-50'>Import Products</span>
                  </DropdownItem>
                </>
              }
            />
          }
          <Button
            className='scan-product-btn'
            color='secondary'
            outline
            onClick={scanProduct}
          >
            <Camera size={15} />
            <span className='align-middle ms-50'>{'Scan Product'}</span>
          </Button>
          {(!hideButton && user.inventoryRole === 'inputUser') ||
          user.inventoryRole === 'adminUser' ? (
            <Button
              className='add-product-btn'
              color='primary'
              onClick={handelAddNewItem}
            >
              <Plus size={15} />
              <span className='align-middle ms-50'>{'Add Product'}</span>
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      {getWooDataLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <>
          {wooStatus ? (
            <Card className='w-100'>
              <CardHeader>
                <CardTitle tag='h4' className='text-primary'>
                  Products
                </CardTitle>
              </CardHeader>
              <WooConnectionNotFound />
            </Card>
          ) : (
            <ServerSideTable
              columns={columns}
              ref={tableRef}
              blocking={isLoading}
              data={products}
              getRecord={getRecords}
              itemsPerPage={currentFilters.limit}
              header={header()}
              searchPlaceholder='Search Product Here ...'
            />
          )}
        </>
      )}

      {addModal.toggle ? (
        <AddProductModal setAddModal={setAddModal} addModal={addModal} />
      ) : null}

      {scanModal.toggle ? (
        <ScanModel setScanModal={setScanModal} scanModal={scanModal} />
      ) : // <ScanBarcode setScanModal={setScanModal} scanModal={scanModal} />
      null}
      {barcodeModal ? (
        <>
          <PrintBarcodeModal
            setBarcodeModal={setBarcodeModal}
            product={product}
            barcodeModal={barcodeModal}
          />
        </>
      ) : null}
      {openUploadProduct ? (
        <ImportProduct
          openUploadProduct={openUploadProduct}
          closeUploadModal={closeUploadModal}
          refetchProducts={() => tableRef?.current?.refreshTable({})}
        />
      ) : null}
    </>
  );
};

export default ProductList;
