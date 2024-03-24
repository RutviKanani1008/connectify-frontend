// ** Custom Components & Plugins
import classnames from 'classnames';
import { Star } from 'react-feather';

// ** Reactstrap Imports
import { Input, Label } from 'reactstrap';
import { getNameFromEmail } from '../../../../../utility/Utils';
import { selectMail } from '../../../../../redux/email';
import { isUnReadMail, isMailStarred } from '../helper';

const MailCard = (props) => {
  // ** Props
  const {
    mail,
    dispatch,
    selectedMails,
    handleMailClick,
    formatDateToMonthShort,
    handleMailStarredUnStarred,
    bulkOperationLoading,
    index,
    activeIndex,
  } = props;

  // ** Function to handle read & mail click
  const onMailClick = () => {
    handleMailClick(mail.mail_provider_thread_id, mail.send_date, index);
  };

  return (
    <li
      onClick={() => onMailClick()}
      className={classnames(
        `mail-item ${
          activeIndex !== undefined && activeIndex === index ? 'active' : ''
        }`,
        {
          'mail-read': !!isUnReadMail(mail.flags),
        }
      )}
    >
      <div className='inner-wrapper'>
        <div className='action-wrapper'>
          <div className='checkbox-wrapper'>
            <Input
              disabled={bulkOperationLoading}
              type='checkbox'
              onChange={(e) => e.stopPropagation()}
              checked={
                !!selectedMails.find(
                  (obj) =>
                    obj.mail_provider_thread_id === mail.mail_provider_thread_id
                )
              }
              onClick={(e) => {
                dispatch(selectMail(mail));
                e.stopPropagation();
              }}
            />
            <Label
              onClick={(e) => e.stopPropagation()}
              for={`${mail.from.name}-${mail._id}`}
            ></Label>
          </div>
          <div className='email-favorite-wrapper'>
            <div
              className='email-favorite'
              onClick={(e) => {
                handleMailStarredUnStarred([mail], true);
                e.stopPropagation();
              }}
            >
              <Star
                size={14}
                className={classnames({
                  favorite: isMailStarred(mail.flags),
                })}
              />
            </div>
          </div>
        </div>
        <div className='details-wrapper'>
          <div className='title-wrapper'>
            <span className='name'>
              {mail.from.name || getNameFromEmail(mail.from.address)}
            </span>
          </div>
          <div className='description-wrapper'>
            <span className='subject'>{mail.subject || '(no subject)'}</span>
            {/* <p className='text'>{(mail.subject || '').slice(0, 50)}</p> */}
          </div>
          <div className='date-wrapper'>
            {formatDateToMonthShort(mail.send_date)}
          </div>
        </div>
      </div>
    </li>
  );
};

export default MailCard;
