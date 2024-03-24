import React, { useState } from 'react';
import moment from 'moment';
import { useForm, useWatch } from 'react-hook-form';
import { CardBody, CardTitle, Col, Input, Row } from 'reactstrap';

import { FormField } from '@components/form-fields';
import { SaveButton } from '../../../../@core/components/save-button';
import themeConfig from '../../../../configs/themeConfig';
import { RSVP_OPTION } from '../../../../constant';

const RsvpForm = ({ eventData, formInfo, changeRsvpFormInfo }) => {
  const [rsvpSubmitted, setRSVPSubmitted] = useState(false);

  const {
    control,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(() => {
    setRSVPSubmitted(true);
  });

  const ShowReason = () => {
    const are_you_coming = useWatch({
      control,
      name: 'are_you_coming',
    });
    return (
      <>
        {are_you_coming && are_you_coming === 'no' ? (
          <>
            <div className='mb-1'>
              <FormField
                name={`reason`}
                label='Reason'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </>
        ) : null}
      </>
    );
  };

  const ShowGuestCount = () => {
    const are_you_bringing_any_guests = useWatch({
      control,
      name: 'are_you_bringing_any_guests',
    });
    return (
      <>
        {are_you_bringing_any_guests &&
        are_you_bringing_any_guests === 'yes' ? (
          <>
            <div className='mb-1'>
              <FormField
                name={`number_of_guest`}
                label='How many guests you are bringing in the event?'
                type='number'
                errors={errors}
                control={control}
              />
            </div>
          </>
        ) : null}
      </>
    );
  };

  return (
    <div className='update-rsvp-form update-rsvp-form-new'>
      <div className='logo-name-radio-wrapper'>
        <div className='inner-item'>
          <div className='label'>Show Logo</div>
          <div className='switch-checkbox'>
            <Input
              id='form-logo'
              type={'switch'}
              inline='true'
              checked={formInfo.showLogo}
              onChange={() => {
                changeRsvpFormInfo({
                  ...formInfo,
                  showLogo: !formInfo.showLogo,
                });
              }}
            />
            <div className='switch-design'></div>
          </div>
        </div>
        <div className='inner-item'>
          <div className='label'>Show Logo Name</div>
          <div className='switch-checkbox'>
            <Input
              id='form-logo-name'
              type={'switch'}
              inline='true'
              checked={formInfo.showLogoName}
              onChange={() => {
                changeRsvpFormInfo({
                  ...formInfo,
                  showLogoName: !formInfo.showLogoName,
                });
              }}
            />
            <div className='switch-design'></div>
          </div>
        </div>
      </div>
      <div className='form-card'>
        {formInfo.showLogo || formInfo.showLogoName ? (
          <>
            <div className='top-header'>
              {formInfo.showLogo && (
                <div className='d-flex justify-content-center brand-logo'>
                  <img
                    // sizes='10%'
                    src={
                      eventData?.company?.companyLogo
                        ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${eventData?.company?.companyLogo}`
                        : // themeConfig.app.smallLogo
                          themeConfig.app.smallLogo
                    }
                    alt='logo'
                  />
                </div>
              )}

              {formInfo.showLogoName && (
                <h2 className='company-name'>
                  {eventData?.company?.name
                    ? eventData?.company?.name
                    : process.env.REACT_APP_COMPANY_NAME}
                </h2>
              )}
            </div>
          </>
        ) : null}

        {!rsvpSubmitted ? (
          <>
            <div className='form-body'>
              <h3 className='event-name'>
                {eventData && eventData.name ? eventData.name : ''}
              </h3>
              <div className='event-dec'>
                {eventData && eventData.description
                  ? eventData.description
                  : ''}
              </div>
              <h3 className='event-details-title'>Event Details</h3>
              <div className='event-start-end-date'>
                <div className='box-wrapper'>
                  <span className='white-cover'></span>
                  <span className='label'>Event Start Time:</span>
                  <span className='value'>
                    {eventData && eventData.start
                      ? moment(new Date(eventData.start)).format(
                          'MM/DD/YYYY, HH:mm A'
                        )
                      : '-'}
                  </span>
                </div>
                <div className='box-wrapper'>
                  <span className='white-cover'></span>
                  <span className='label'>Event End Time:</span>
                  <span className='value'>
                    {eventData && eventData.end
                      ? moment(new Date(eventData.end)).format(
                          'MM/DD/YYYY, HH:mm A'
                        )
                      : '-'}
                  </span>
                </div>
              </div>
              <div className='radio-btn-main-wrapper'>
                <FormField
                  name={`are_you_coming`}
                  label='Are you coming to this event?'
                  defaultValue={getValues('are_you_coming')}
                  options={RSVP_OPTION}
                  type='radio'
                  errors={errors}
                  control={control}
                />
              </div>
              <ShowReason />
              <div className='radio-btn-main-wrapper'>
                <FormField
                  name={`are_you_bringing_any_guests`}
                  label='Are you bringing any guests?'
                  defaultValue={getValues('are_you_bringing_any_guests')}
                  options={[
                    {
                      label: 'Yes',
                      value: 'yes',
                    },
                    { label: 'No', value: 'no' },
                  ]}
                  type='radio'
                  errors={errors}
                  control={control}
                />
              </div>
              <ShowGuestCount />
              <div className='mb-1'>
                <FormField
                  label='Email'
                  name='email'
                  placeholder='john@example.com'
                  type='text'
                  errors={errors}
                  control={control}
                />
              </div>
            </div>
            <div className='form-footer'>
              <SaveButton
                className='confirm-btn'
                width='100%'
                type='button'
                name='Confirm'
                onClick={onSubmit}
              ></SaveButton>
              <div className='footer-text text-center'>
                <span>Powered by</span>{' '}
                <a href={process.env.REACT_APP_APP_URL}>xyz.com</a>
              </div>
            </div>
          </>
        ) : (
          <>
            <CardBody>
              <CardTitle tag='h4' className='mb-2 mt-2 text-center'>
                Thank you for confirm your Availability.
              </CardTitle>
            </CardBody>
            <Row>
              <Col className='text-center'>
                <a
                  onClick={() => {
                    setRSVPSubmitted(false);
                  }}
                >
                  Go Back
                </a>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

export default RsvpForm;
