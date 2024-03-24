/* eslint-disable no-tabs */
import React, { useEffect, useState } from 'react';
import { Form } from 'reactstrap';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { required } from './../../../../configs/validationConstant';
import {
  useGetWooConnection,
  useSaveWooConnection,
} from '../hooks/InventoryWooConnectionApi';
import { useForm } from 'react-hook-form';
import { getCurrentUser } from '../../../../helper/user.helper';
import UILoader from '../../../../@core/components/ui-loader';
import wooStep1 from '../../../../assets/images/pages/woostep1.png';
import wooStep2 from '../../../../assets/images/pages/woostep2.png';

const wooSchema = yup.object().shape({
  url: yup.string().required(required('Store Url')),
  consumerKey: yup.string().required(required('Consumer Key')),
  consumerSecret: yup.string().required(required('Consumer Secret')),
});

const InventoryWooCommerceConnection = () => {
  const user = getCurrentUser();
  const [initialState, setInitialState] = useState({});

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(wooSchema),
    defaultValues: initialState,
  });
  const { getWooConnection, isLoading: getWooDataLoading } =
    useGetWooConnection();
  const { saveWooConnection, isLoading: saveWooConnectionLoading } =
    useSaveWooConnection();

  useEffect(() => {
    getRecord();
  }, []);

  useEffect(() => {
    reset(initialState);
  }, [initialState]);

  const getRecord = async () => {
    const { data } = await getWooConnection();
    if (data) {
      setInitialState(data);
    }
  };

  const onSubmit = async (wooData) => {
    const rawData = JSON.parse(JSON.stringify(wooData));
    rawData.company = user.company._id;
    await saveWooConnection(rawData, 'Save Store ...');
  };

  return (
    <UILoader blocking={getWooDataLoading}>
      <div className='woocommerce-integration-steps'>
        <h3 className='title'>Instructions to Connect wooCommerce</h3>
        <ul className='fancy-ul with-number'>
          <li className='item'>
            Download & Upload the plugin zip file into the wordpress plugin
            uploader.{' '}
            <a
              href='https://redlightdealz.com/wp-content/wocommerce-connector.zip'
              download
            >
              Download Plugin
            </a>
          </li>
          <li className='item'>
            Activate the plugin. (On activation Woocoomerce Rest API keys will
            be automatically generated, User will be able to find those by
            simply clicking the setting button which is below our Woocommerce
            Connector plugin.
            <img className='img' src={wooStep2} />
          </li>
          <li className='item'>
            On Woo-Connector setting page you will find the Woocommerce Base
            URL, Token Verification API, Consumer Key, Consumer Secret which you
            can use for authentication purpose.
            <img className='img' src={wooStep1} />
          </li>
        </ul>
      </div>
      <Form
        className='woocommerce-integration'
        onSubmit={handleSubmit(onSubmit)}
        autoComplete='off'
      >
        <div className='field-wrapper'>
          <FormField
            name='url'
            label='Store Url'
            placeholder='Enter Url'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='field-wrapper'>
          <FormField
            name='consumerKey'
            label='Consumer Key'
            placeholder='Enter Consumer Key'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='field-wrapper'>
          <FormField
            name='consumerSecret'
            label='Consumer Secret'
            placeholder='Enter Consumer Secret'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <SaveButton
          className='mt-2 text-align-center'
          width='171px'
          type='submit'
          name={'Save'}
          loading={saveWooConnectionLoading}
        ></SaveButton>
      </Form>
    </UILoader>
  );
};

export default InventoryWooCommerceConnection;
