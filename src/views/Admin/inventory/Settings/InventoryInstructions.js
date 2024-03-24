import { useForm } from "react-hook-form";
import { Form, Spinner } from "reactstrap";
import { FormField } from "../../../../@core/components/form-fields";
import { SaveButton } from "../../../../@core/components/save-button";
import { getCurrentUser } from "../../../../helper/user.helper";
import { useGetWooConnection, useSaveWooConnection } from "../hooks/InventoryWooConnectionApi";
import { useEffect, useState} from "react";

const InventoryInstructions = ({ setTabValue }) => {
  const user = getCurrentUser();
  const [initialState, setInitialState] = useState({});
  const [wooStatus, setWooStatus] = useState(false);

  const { getWooConnection,  isLoading: getWooDataLoading} = useGetWooConnection();
  const { saveWooConnection, isLoading: saveWooConnectionLoading } = useSaveWooConnection();
  
  useEffect(() => {
     getRecord();
  }, []);
  
    const {
      control,
      reset,
      handleSubmit,
  } = useForm({
    mode: 'onBlur',
    defaultValues: initialState,
  });

    useEffect(() => {
    reset(initialState);
  }, [initialState]);

    const getRecord = async () => {
    const { data } = await getWooConnection();
    if (data) {
      setInitialState(data);
    } else {
      setWooStatus(true);
    }
    }
  const onSubmit = async (instructionData) => {
      const rawData = JSON.parse(JSON.stringify(instructionData));
      rawData._id = initialState._id
      rawData.company = user.company._id;
      await saveWooConnection(rawData, 'Save ...');
  }

  return (
    <>
      {getWooDataLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
          <>
            {wooStatus ? (
              <div className='w-100 text-center p-4'>
                <h2 className='mb-1'>
                  Please connect your WooCommerce store first
                </h2>
                <p>
                  To connect your WooCommerce store
                  <a
                    className='text-primary'
                    onClick={() => {
                      setTabValue('wooCommerceConnection');
                    }}
                  >
                    Click Here
                  </a>
                </p>
              </div>
            ) : (
              <div>
                <h3 className="title">Set instructions for inventory role users</h3>
                <Form
                  key='instructions'
                  className='auth-login-form'
                  onSubmit={handleSubmit(onSubmit)}
                  autoComplete='off'
                >
                    <div className="mt-1">
                    <FormField
                      name='instructions.inputUser'
                      label='Input Role User'
                      placeholder='Input Role Instructions'
                      type='textarea'
                      control={control}
                    />
                  </div>
                  <div className="mt-1">
                    <FormField
                      name='instructions.storageUser'
                      label='Storage Role User'
                      placeholder='Storage Role Instructions'
                      type='textarea'
                      control={control}
                    />
                  </div>
                  <div className="mt-1">
                    <FormField
                      name='instructions.productDetailUser'
                      label='Product Details Role User'
                      placeholder='Product Details Role Instructions'
                      type='textarea'
                      control={control}
                    />
                  </div>
                  <div className="mt-1">
                    <FormField
                      name='instructions.pickerUser'
                      label='Picker Role User'
                      placeholder='Picker Role User Instructions'
                      type='textarea'
                      control={control}
                    />
                  </div>
                  <div className="mt-1">
                    <FormField
                      name='instructions.shippingUser'
                      label='Shipper Role User'
                      placeholder='Shipper Role Instructions'
                      type='textarea'
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
              </div>
            )
            }
        </>
      )}
    </>
  )
}
export default InventoryInstructions