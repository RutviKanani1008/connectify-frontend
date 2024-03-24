import React from 'react';
// ** Reactstrap Imports
import { Button } from 'reactstrap';

// ** Custom Hooks

// ** Styles
import '@styles/base/pages/page-misc.scss';
import { useHistory } from 'react-router-dom';
import Thankyouicon from '../assets/images/icons/icons-component/Thankyouicon';

const ThankYou = ({
  message = '',
  showHomeButton = true,
  btnText,
  onClickEvent,
}) => {
  const history = useHistory();

  return (
    <div className='thankyou-wrapper'>
      <div className='inner-wrapper'>
        <div className='icon-wrapper'>
          <Thankyouicon />
        </div>
        <h2 className='title'>Thank You</h2>
        <p className='discription-text'>{message ? message : ''}</p>
        {showHomeButton && (
          <div className='submit-btn-wrapper'>
            <Button
              color='primary'
              onClick={() => {
                if (onClickEvent) {
                  onClickEvent();
                  // history.push(redirect);
                } else {
                  history.push('/');
                }
              }}
            >
              {btnText ? btnText : 'Go To Home'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ThankYou;
