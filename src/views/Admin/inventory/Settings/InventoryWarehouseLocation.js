import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from './../../../../configs/validationConstant';
import ItemTable from '../../../../@core/components/data-table';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import UILoader from './../../../../@core/components/ui-loader/index';
import {
  useDeleteLocation,
  useGetLocations,
} from '../hooks/InventoryWarehouseLocationApi';
import AddWarehouseLocationModal from '../components/AddWarehouseLocationModal';
import { useInventoryWarehouseColumn } from '../hooks/useInventoryWarehouseColumn';

const warehouseLocationSchema = yup.object().shape({
  name: yup.string().required(required('Name')),
  type: yup.object().shape({ label: yup.string().required('Required'), value: yup.string().required('Required'), }).
        required(required('Store Type')).nullable()
});

const InventoryWarehouseLocation = () => {
  const [addModal, setAddModal] = useState({
    toggle: false,
    id: '',
  });

  const [currentLocationDetail, setCurrentLocationDetail] = useState({});

  const {
    control,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(warehouseLocationSchema),
    defaultValues: currentLocationDetail,
  });

  const { inventoryWarehouseColumn } = useInventoryWarehouseColumn({
    setAddModal,
    setCurrentLocationDetail,
  });

  const {
    getLocations,
    isLoading: getLocationLoading,
    locations,
  } = useGetLocations();
  const { deleteLocation } = useDeleteLocation();

  useEffect(() => {
    getRecords();
  }, []);

  const getRecords = async () => {
    await getLocations();
  };

  const handelAddNewItem = () => {
    setAddModal({ id: '', toggle: true });
    setCurrentLocationDetail({});
  };

  const handleDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Warehouse Location?',
    });

    if (result.value) {
      const { error } = await deleteLocation(id, 'Delete Warehouse Location..');
      if (!error) {
        getRecords();
      }
    }
  };

  return (
    <>
      <div className='inventory-warehouse-locations-table-wrapper'>
        <UILoader blocking={getLocationLoading}>
          <ItemTable
            columns={inventoryWarehouseColumn({
              handleDelete,
            })}
            searchPlaceholder='Search Location ...'
            data={locations}
            title='Product Locations'
            addItemLink={false}
            onClickAdd={handelAddNewItem}
            buttonTitle={'Add Location'}
            itemsPerPage={10}
            hideExport={true}
          />
        </UILoader>
      </div>

      {addModal.toggle ? (
        <AddWarehouseLocationModal
          getValues={getValues}
          reset={reset}
          getLocations={getLocations}
          setLocationModal={setAddModal}
          locationModal={addModal}
          currentLocationDetail={currentLocationDetail}
          setCurrentLocationDetail={setCurrentLocationDetail}
          formField={{
            control,
            handleSubmit,
            reset,
            setError,
            getValues,
            errors,
          }}
        />
      ) : null}
    </>
  );
};

export default InventoryWarehouseLocation;
