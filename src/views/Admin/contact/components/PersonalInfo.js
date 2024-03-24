import { Input, Row, UncontrolledTooltip } from 'reactstrap';
import ImageUpload from '../../../../@core/components/form-fields/ImageUpload';
import { FormField } from '@components/form-fields';

// import AddCustomField from './AddCustomField';

export const PersonalInfo = (props) => {
  const {
    fileUploadURL,
    errors,
    control,
    userProfileUpload,
    handleImageReset,
    imageUploading,
    setValue,
    getValues,
    setError,
    params,
    updateUnsubscribeStatus,
    register,
    canUpdateBilling,
    enableBilling,
    updateBillingStatus,
    initialValue,
  } = props;
  return (
    <div className='accordian-loyal-box personal-info active'>
      <div className='accordian-loyal-header'>
        <div className='inner-wrapper'>
          <h3 className='title'>Personal Info</h3>
          <button className='down-arrow' type='button'></button>
        </div>
      </div>
      <div className='accordian-loyal-body mb-2'>
        <div className='normal-text'>Fill your basic information.</div>
        <Row className='formField-row'>
          <div className='formField-col uploadFile'>
            <ImageUpload
              url={
                fileUploadURL &&
                fileUploadURL !== 'false' &&
                `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
              }
              handleUploadImage={userProfileUpload}
              handleImageReset={handleImageReset}
              loading={imageUploading}
              supportedFileTypes={['jpg', 'jpeg', 'svg', 'png', 'heic']}
              setError={setError}
              filename='userProfile'
              errors={errors}
            />
          </div>
          <div className='formField-col firstName'>
            <FormField
              name='firstName'
              label='First Name'
              placeholder='First Name'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
          <div className='formField-col lastName'>
            <FormField
              name='lastName'
              label='Last Name'
              placeholder='Last Name'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
          <div className='formField-col website'>
            <FormField
              type='text'
              label='Website'
              name='website'
              placeholder='enter your website...'
              errors={errors}
              control={control}
              onBlur={(e) => {
                setValue(
                  'website',
                  e.target?.value
                    ?.replace?.(/^(?:https?:\/\/)?(?:www\.)?/i, '')
                    ?.split('/')[0]
                );
              }}
            />
            {getValues('website') && (
              <div className='go-to-website-sec'>
                Go to Website:{' '}
                <a
                  href={`https://www.${
                    getValues('website')
                      ?.replace?.(/^(?:https?:\/\/)?(?:www\.)?/i, '')
                      ?.split('/')[0]
                  }`}
                  target='_blank'
                  rel='noreferrer'
                >
                  {
                    getValues('website')
                      ?.replace?.(/^(?:https?:\/\/)?(?:www\.)?/i, '')
                      ?.split('/')[0]
                  }
                </a>
              </div>
            )}
          </div>
          <div
            // md={params.id === 'add' ? 12 : 9}
            className={`formField-col email ${
              params.id === 'add' ? '' : 'email-with-subscribe-toggle-btn'
            }`}
          >
            <div className='inner-field-wrapper'>
              <FormField
                type='text'
                label='Email'
                name='email'
                placeholder='john@example.com'
                errors={errors}
                control={control}
              />
            </div>

            {params.id !== 'add' && initialValue?.email && (
              <div className='subscribe-toggle-btn'>
                <div className='radio-switch-toggle-btn-wrapper'>
                  <div className='radio-btn-wrapper d-flex flex-inline'>
                    <div className='form-check radio-btn-repeater'>
                      <Input
                        type='switch'
                        name='hasUnsubscribed'
                        key={getValues('hasUnsubscribed')}
                        defaultChecked={getValues('hasUnsubscribed')}
                        value={getValues('hasUnsubscribed')}
                        onChange={updateUnsubscribeStatus}
                      />
                      <label className='form-check-label form-label'>
                        Unsubscribe
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className='formField-col companyName'>
            <FormField
              type='text'
              label='Company name'
              name='company_name'
              placeholder='enter your company name...'
              errors={errors}
              control={control}
            />
          </div>
          <div className='formField-col companyName'>
            <FormField
              type='text'
              label='Company type'
              name='companyType'
              placeholder='enter your company type...'
              errors={errors}
              control={control}
            />
          </div>
          <div className='formField-col phoneNumber'>
            <FormField
              type='phone'
              label='Phone Number'
              name='phone'
              placeholder='Phone Number'
              errors={errors}
              control={control}
            />
          </div>
          <div className='formField-col address1'>
            <FormField
              label='Address Line 1'
              placeholder='Address Line 1'
              type='text'
              errors={errors}
              control={control}
              name='address1'
            />
          </div>
          <div className='formField-col address2'>
            <FormField
              label='Address Line 2'
              placeholder='Address Line 2'
              type='text'
              errors={errors}
              control={control}
              {...register(`address2`)}
            />
          </div>
          <div className='formField-col city'>
            <FormField
              type='text'
              label='City'
              name='city'
              placeholder='City'
              errors={errors}
              control={control}
              {...register(`city`)}
            />
          </div>
          <div className='formField-col state'>
            <FormField
              type='text'
              label='State'
              name='state'
              placeholder='State'
              errors={errors}
              control={control}
              {...register(`state`)}
            />
          </div>
          <div className='formField-col country'>
            <FormField
              label='Country'
              placeholder='country'
              type='text'
              name='country'
              errors={errors}
              control={control}
              {...register(`country`)}
            />
          </div>
          <div className='formField-col zipCode'>
            <FormField
              type='text'
              label='Zip'
              placeholder='Zip'
              errors={errors}
              control={control}
              {...register(`zip`)}
            />
          </div>
        </Row>
        {!canUpdateBilling ? (
          <UncontrolledTooltip target={'enableBilling'}>
            {
              "You can't update billing status as this contact already connected to quote or invoice"
            }
          </UncontrolledTooltip>
        ) : null}
        <div className='mt-1' id='enableBilling'>
          <div className='radio-switch-toggle-btn-wrapper'>
            <div className='radio-btn-wrapper d-flex flex-inline'>
              <div className='form-check radio-btn-repeater me-2'>
                <Input
                  type='switch'
                  name='enableBilling'
                  key={enableBilling}
                  disabled={!canUpdateBilling}
                  defaultChecked={enableBilling}
                  value={enableBilling}
                  onChange={(e) => {
                    updateBillingStatus(e);
                  }}
                />
                <label className='form-check-label form-label'>
                  Enable Billing Profile for this contact?
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* <AddCustomField
          register={register}
          control={control}
          setValue={setValue}
          errors={errors}
          name='customeField'
        /> */}
      </div>
    </div>
  );
};
