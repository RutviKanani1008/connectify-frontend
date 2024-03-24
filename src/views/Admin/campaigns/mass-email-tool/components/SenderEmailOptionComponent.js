import { AlertCircle, Send } from 'react-feather';
import { components } from 'react-select';
import { UncontrolledTooltip } from 'reactstrap';
export const SenderEmailOptionComponent = ({
  data,
  optionsProps,
  handleSendReverifyMail,
}) => {
  return (
    <components.Option {...optionsProps}>
      <div className='sender-email-option-row'>
        <span style={{ width: '80%' }} className='display__one__line'>
          {data.label}
        </span>
        <div className='action-btn-wrapper'>
          {!data.verified && (
            <>
              <div className='action-btn info-btn'>
                <AlertCircle
                  color='#000000'
                  size={18}
                  className=''
                  id={`${optionsProps.innerProps.id}-info`}
                />
                <UncontrolledTooltip
                  key={`${optionsProps.innerProps.id}-info`}
                  target={`${optionsProps.innerProps.id}-info`}
                >
                  Please check your inbox for the verification email.
                  {/* Please verify this email first, mail sended to be given email
                  address */}
                </UncontrolledTooltip>
              </div>
            </>
          )}
          {!data.verified && (
            <>
              <div className='action-btn send-btn'>
                <Send
                  color='#000000'
                  size={18}
                  className=''
                  onClick={() => {
                    handleSendReverifyMail(data.label);
                  }}
                  id={`${optionsProps.innerProps.id}-resend`}
                />
                <UncontrolledTooltip
                  key={`${optionsProps.innerProps.id}-resend`}
                  target={`${optionsProps.innerProps.id}-resend`}
                >
                  Resend verification link
                </UncontrolledTooltip>
              </div>
            </>
          )}
        </div>
      </div>
    </components.Option>
  );
};
