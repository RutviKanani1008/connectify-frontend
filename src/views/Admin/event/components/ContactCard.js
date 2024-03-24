import { UncontrolledTooltip } from 'reactstrap';
import Avatar from '@components/avatar';
import { FormField } from '@components/form-fields';
import defaultAvatar from '@src/assets/images/avatars/avatar-blank.png';

const selectBadge = (type) => {
  switch (type) {
    case 'yes':
      return 'bg-success';
    case 'no':
      return 'bg-danger';
    case 'May be':
      return 'bg-warning';
  }
};

const ContactCard = ({
  contact,
  errors = false,
  control = false,
  getValues = false,
  setValue = false,
  mode = 'add',
  index,
  label,
  toolTipLabel,
  showCheckbox = true,
  showUnsubscribe = false,
}) => {
  const fullName = `${contact?.firstName} ${contact.lastName}`;
  return (
    <div
      className={`event-contact-card ${
        showUnsubscribe && contact.hasUnsubscribed
          ? 'unsubscribed__contact__wp'
          : ''
      }`}
      id={`contact-card${contact._id}`}
    >
      {mode === 'edit' && contact?.eventrsvp?.length > 0 && (
        <div
          className={`ribbon-2 ${selectBadge(
            contact?.eventrsvp[0].are_you_coming
          )} text-capitalize`}
        >
          Rsvp
        </div>
      )}
      <div className='inner-card'>
        {contact?.userProfile &&
        contact?.userProfile !== false &&
        contact?.userProfile !== null &&
        contact?.userProfile !== undefined ? (
          <>
            <Avatar
              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${contact?.userProfile}`}
              imgHeight='32'
              imgWidth='32'
            />
          </>
        ) : fullName && fullName !== '' ? (
          <>
            <Avatar color={'light-primary'} content={fullName} initials />
          </>
        ) : (
          <>
            <Avatar img={defaultAvatar} imgHeight='32' imgWidth='32' />
          </>
        )}
        {/* <Avatar
          className=''
          img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${
            contact?.userProfile && contact?.userProfile !== 'false'
              ? contact?.userProfile
              : 'super-admin/report-problem/1663400998470_avatar-blank.png'
          }`}
          imgHeight='42'
          imgWidth='42'
        /> */}
        <div className='right-details'>
          <h3 className='title'>
            {`${
              contact?.firstName || contact?.firstName
                ? `${contact?.firstName} ${contact?.lastName}`
                : `-`
            }`}
          </h3>
          <p className='text'>{contact?.email}</p>
        </div>
        {showCheckbox && (
          <>
            <div className='form-check-input-wrapper' id={`${label}_${index}`}>
              <FormField
                className='form-check-input'
                key={getValues(`${contact._id}`)}
                type='checkbox'
                disabled={showUnsubscribe && contact.hasUnsubscribed}
                error={errors}
                control={control}
                name={contact._id}
                defaultValue={getValues(`${contact._id}`) ? true : false}
                onChange={(e) => {
                  setValue(`${contact._id}`, e.target.checked);
                }}
              />
            </div>
            {toolTipLabel && (
              <UncontrolledTooltip placement='top' target={`${label}_${index}`}>
                {toolTipLabel}
              </UncontrolledTooltip>
            )}
          </>
        )}
        {showUnsubscribe && contact.hasUnsubscribed && (
          <UncontrolledTooltip
            placement='top'
            target={`contact-card${contact._id}`}
          >
            Unsubscribed
          </UncontrolledTooltip>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
