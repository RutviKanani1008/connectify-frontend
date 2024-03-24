import React, { useEffect, useState } from 'react';
import CustomSelectBox from '../components/CustomSelectBox';
import { Col, Form, Row, Spinner } from 'reactstrap';
import {
  useGetProductSpecs,
  useProductSpecDefaultSelected,
} from '../hooks/InventoryProductSpecApi';
import { useForm } from 'react-hook-form';
import { SaveButton } from '../../../../@core/components/save-button';

const InventoryProductSpecs = () => {
  const { handleSubmit, setValue } = useForm({
    mode: 'onBlur',
  });
  const {
    getProductSpec,
    isLoading: getProductSpecLoading,
    productSpecs,
  } = useGetProductSpecs();

  const [dropdownList, setDropdownList] = useState({
    lengthUnit: [],
    widthUnit: [],
    heightUnit: [],
    weightUnit: [],
  });

  const { saveProductSpecSelected } = useProductSpecDefaultSelected();

  useEffect(() => {
    getRecords();
  }, []);

  useEffect(() => {
    setAllDropdownValues();
  }, [productSpecs]);

  const setAllDropdownValues = async () => {
    const lengthUnits = [];
    const widthUnits = [];
    const heightUnits = [];
    const weightUnits = [];

    if (productSpecs.length > 0) {
      productSpecs.forEach((item) => {
        if (item.type === 'lengthUnit') {
          const obj = {};
          obj.id = item._id;
          obj.value = item.name;
          obj.label = item.name;
          obj.defaultValue = item.defaultValue;
          lengthUnits.push(obj);
        }
        if (item.type === 'widthUnit') {
          const obj = {};
          obj.id = item._id;
          obj.value = item.name;
          obj.label = item.name;
          obj.defaultValue = item.defaultValue;
          widthUnits.push(obj);
        }
        if (item.type === 'heightUnit') {
          const obj = {};
          obj.id = item._id;
          obj.value = item.name;
          obj.label = item.name;
          obj.defaultValue = item.defaultValue;
          heightUnits.push(obj);
        }
        if (item.type === 'weightUnit') {
          const obj = {};
          obj.id = item._id;
          obj.value = item.name;
          obj.label = item.name;
          obj.defaultValue = item.defaultValue;
          weightUnits.push(obj);
        }
        setDropdownList((prev) => ({
          ...prev,
          lengthUnit: lengthUnits,
          widthUnit: widthUnits,
          heightUnit: heightUnits,
          weightUnit: weightUnits,
        }));
      });
    }
  };

  const getRecords = async () => {
    await getProductSpec();
  };

  const onHandleChange = (name, value) => {
    setValue(name, value?.id);
  };
  const onSubmit = async (values) => {
    await saveProductSpecSelected(values, 'Save Product Specs...');
  };

  return (
    <>
      {getProductSpecLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <div className='m-2'>
          <Form className='auth-login-form' onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col className='mb-1' md={6} xs={12}>
                <label className='form-label'>Length Unit</label>
                <CustomSelectBox
                  optionList={dropdownList?.lengthUnit}
                  name='defaultLength'
                  type={'lengthUnit'}
                  addCreateOption
                  onHandleChange={(type, value) => {
                    onHandleChange(type, value);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col className='mb-1' md={6} xs={12}>
                <label className='form-label'>Width Unit</label>
                <CustomSelectBox
                  optionList={dropdownList.widthUnit}
                  name='defaultWidth'
                  type={'widthUnit'}
                  addCreateOption
                  onHandleChange={(name, value) => {
                    onHandleChange(name, value);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col className='mb-1' md={6} xs={12}>
                <label className='form-label'>Height Unit</label>
                <CustomSelectBox
                  optionList={dropdownList.heightUnit}
                  name='defaultHeight'
                  type={'heightUnit'}
                  addCreateOption
                  onHandleChange={(type, value) => {
                    onHandleChange(type, value);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col className='mb-1' md={6} xs={12}>
                <label className='form-label'>Weight Unit</label>
                <CustomSelectBox
                  optionList={dropdownList.weightUnit}
                  name='defaultWeight'
                  type={'weightUnit'}
                  addCreateOption
                  onCreateOption={() => {}}
                  onHandleChange={(type, value) => {
                    onHandleChange(type, value);
                  }}
                />
              </Col>
            </Row>
            <SaveButton
              width='230px'
              className='mt-2 align-items-center justify-content-center'
              type='submit'
              name='Save'
            ></SaveButton>
          </Form>
        </div>
      )}
    </>
  );
};

export default InventoryProductSpecs;
