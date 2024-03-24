// ** React Imports
import { Fragment } from 'react';

// ** Custom Components
import NavbarUser from './NavbarUser';

// ** Third Party Components
// import { Menu } from 'react-feather'

// ** Reactstrap Imports
import { NavLink } from 'reactstrap';

const ThemeNavbar = (props) => {
  // ** Props
  const { skin, setSkin, setMenuVisibility, mobileTaskTimerOpen, dropdownRef } =
    props;

  return (
    <Fragment>
      <NavLink
        className='nav-menu-main menu-toggle hidden-xs is-active mobile-menu-toggle-btn'
        onClick={() => setMenuVisibility(true)}
      >
        {/* <Menu className='ficon' /> */}
        <span className='dot'></span>
        <span className='dot'></span>
        <span className='dot'></span>
        <span className='dot'></span>
      </NavLink>
      <NavbarUser
        dropdownRef={dropdownRef}
        skin={skin}
        setSkin={setSkin}
        mobileTaskTimerOpen={mobileTaskTimerOpen}
      />
    </Fragment>
  );
};

export default ThemeNavbar;
