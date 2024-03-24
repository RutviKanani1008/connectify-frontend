// ==================== Packages =======================
import { useEffect, useState } from 'react';
import { isArray } from 'lodash';
// ====================================================
import UILoader from '@components/ui-loader';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import ItemTable from '../../../../../@core/components/data-table';
import { useProductsColumn } from '../hooks/useProductsColumn';
import AddProductModal from '../components/AddProductModal';
import { useDeleteProduct, useGetProducts } from '../hooks/productApis';
import CustomSelect from '../../../../../@core/components/form-fields/CustomSelect';
import { useGetCategories } from '../hooks/productCategoryApis';
import ExportData from '../../../../../components/ExportData';

const RecurringPayment = () => {
  // ========================== states ================================
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [addModal, setAddModal] = useState({
    toggle: false,
    id: '',
  });
  // ========================== Custom Hooks ==========================
  const { getProducts, isLoading } = useGetProducts();
  const { deleteProduct } = useDeleteProduct();
  const { productsColumns } = useProductsColumn({
    setAddModal,
  });
  const {
    getCategories,
    isLoading: getProductCategoryLoading,
    productCategories,
  } = useGetCategories();

  useEffect(() => {
    getRecords(false);
    getCategories();
  }, []);

  const getRecords = async () => {
    const { data, error } = await getProducts({ type: 'recurring' });

    if (!error) {
      setFilteredProducts(data);
      setProducts(data);
    }
  };

  // delete start >>>
  const handleDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this product?',
    });

    if (result.value) {
      const { error } = await deleteProduct(id, 'Delete product..');

      if (!error) {
        if (isArray(products)) {
          const tempProducts = products?.filter((obj) => obj?._id !== id);
          const tempFilteredProducts = filteredProducts?.filter(
            (obj) => obj?._id !== id
          );
          if (isArray(products)) {
            setProducts(tempProducts);
            setFilteredProducts(tempFilteredProducts);
          }
        }
      }
    }
  };
  // delete end >>>

  const addNewProduct = () => {
    setAddModal({ id: '', toggle: true });
  };

  const filterByProductCategory = (data) => {
    let tempProducts = [...products];
    if (data?.value) {
      tempProducts = tempProducts.filter(
        (obj) => obj?.category?._id === data?.value
      );
    }
    setFilteredProducts(tempProducts);
  };

  const PRODUCT_CATEGORY = productCategories.map((obj) => ({
    label: obj.name,
    value: obj._id,
  }));

  const childDropdown = (
    <div className='d-flex align-items-center'>
      <CustomSelect
        loading={getProductCategoryLoading}
        classNamePrefix='group-select-border'
        isClearable={true}
        options={PRODUCT_CATEGORY}
        onChange={(e) => {
          filterByProductCategory(e);
        }}
        label='Filter by Category'
      />
    </div>
  );

  return (
    <>
      <UILoader blocking={isLoading}>
        <ItemTable
          ExportData={
            <ExportData
              model='product'
              query={{ type: 'recurring', fileName: 'recurring-product' }}
            />
          }
          childDropdown={childDropdown}
          columns={productsColumns({ handleDelete })}
          data={filteredProducts}
          title='Recurring Products'
          addItemLink={false}
          onClickAdd={addNewProduct}
          buttonTitle={'Add Product'}
          itemsPerPage={10}
        />
      </UILoader>

      {addModal.toggle ? (
        <AddProductModal
          getRecords={getRecords}
          modal={addModal}
          setModal={setAddModal}
          productType={'recurring'}
        />
      ) : null}
    </>
  );
};

export default RecurringPayment;
