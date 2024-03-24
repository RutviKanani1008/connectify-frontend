// ** Package Imports **
import classNames from 'classnames';
import { memo } from 'react';
// import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { Nav, NavItem, NavLink, UncontrolledTooltip } from 'reactstrap';
// import useGetBasicRoute from '../../../hooks/useGetBasicRoute';

const AddCompanyNavBar = ({ params, currentTab, setCurrentTab }) => {
  const switchToTab = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className='add-update-contact-tab-wrapper'>
      <Nav
        className='horizontal-tabbing hide-scrollbar add-update-contact-tab'
        tabs
      >
        <NavItem>
          <NavLink
            className={classNames({
              active: currentTab === 'company-details',
            })}
            onClick={() => {
              switchToTab('company-details');
            }}
          >
            Company Info
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classNames({
              active: currentTab === 'notes',
            })}
            onClick={() => {
              if (params.id !== 'add') {
                switchToTab('notes');
              }
            }}
            id={`notes`}
          >
            Notes
          </NavLink>
          <UncontrolledTooltip placement='top' autohide={true} target={`notes`}>
            {params.id !== 'add' ? 'Note' : 'Please create a contact first'}
          </UncontrolledTooltip>
        </NavItem>
      </Nav>
    </div>
  );
};

export default memo(AddCompanyNavBar);
