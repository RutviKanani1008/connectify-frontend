/* eslint-disable no-constant-condition */
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { SaveButton } from '../../../../@core/components/save-button';
import { selectThemeColors } from '../../../../utility/Utils';
import {
  OptionComponent,
  SingleValue,
} from '../../../forms/component/OptionComponent';
import { useSetCompleteStatusTaskAPI } from '../service/task.services';
import { useGetCompanyByIdAPI } from '../../../superAdmin/company/hooks/companyApis';
import { useEffect } from 'react';
import { userData } from '../../../../redux/user';
import { useSelector } from 'react-redux';

const CompleteSetStatusModal = ({
  close,
  isOpen,
  taskOptions,
  taskLoading,
}) => {
  const currentUser = useSelector(userData);

  // ** Hooks
  const {
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  //   ** API services
  const { setCompleteStatusTaskAPI, isLoading: submitLoading } =
    useSetCompleteStatusTaskAPI();
  const { getCompanyByIdAPI, isLoading } = useGetCompanyByIdAPI();

  useEffect(() => {
    if (currentUser?.company?._id) {
      getCompanyByIdAPI(currentUser.company._id).then(({ data }) => {
        setValue(
          'status',
          taskOptions.find(
            (o) => o._id === data?.[0]?.taskSetting?.completeStatus
          )
        );
      });
    }
  }, [currentUser?.company?._id]);

  const onSubmit = async (values) => {
    const { error } = await setCompleteStatusTaskAPI({
      status: values?.status?._id || null,
    });
    if (!error) {
      close();
    }
  };
  const statusWatch = watch('status');

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => close()}
      className='modal-dialog modal-dialog-centered setStatus-modal modal-dialog-mobile'
      backdrop='static'
      fade={false}
    >
      <ModalHeader
        toggle={() => {
          close();
        }}
      >
        <div className='d-flex'>Set Status</div>
      </ModalHeader>
      <ModalBody className='pt-1 pb-1'>
        {isLoading || taskLoading ? (
          <div className='d-flex justify-content-center mt-2 mb-1'>
            <Spinner />
          </div>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <p className='normal-text'>
              When marking task as archived move, task to below status
            </p>
            <div className='priority__select__box'>
              <Select
                key={statusWatch?.value}
                isLoading={isLoading || taskLoading}
                styles={{
                  singleValue: (base) => ({
                    ...base,
                    display: 'flex',
                    alignItems: 'center',
                  }),
                }}
                id='status'
                name='status'
                defaultValue={getValues('status')}
                options={taskOptions?.filter(
                  (option) => option.type === 'status'
                )}
                theme={selectThemeColors}
                className={`react-select ${
                  errors?.['status']?.message ? 'is-invalid' : ''
                } mt-1`}
                classNamePrefix='custom-select'
                isClearable
                onChange={(data) => setValue('status', data)}
                components={{
                  Option: OptionComponent,
                  SingleValue,
                }}
              />
            </div>
          </Form>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            close();
          }}
        >
          Cancel
        </Button>
        <Form>
          <SaveButton
            loading={submitLoading}
            disabled={submitLoading || isLoading || taskLoading}
            width='100px'
            color='primary'
            name='Save'
            onClick={handleSubmit(onSubmit)}
          />
        </Form>
      </ModalFooter>
    </Modal>
  );
};
export default CompleteSetStatusModal;
