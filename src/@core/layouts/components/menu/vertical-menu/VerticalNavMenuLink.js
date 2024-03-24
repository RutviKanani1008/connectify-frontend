// ** React Imports
import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// ** Third Party Components
import classnames from 'classnames';
import { UncontrolledTooltip } from 'reactstrap';

// ** Reactstrap Imports
// import { Badge } from 'reactstrap';

const VerticalNavMenuLink = ({
  item,
  activeItem,
  setActiveItem,
  currentActiveItem,
  menuCollapsed,
}) => {
  // ** Conditional Link Tag, if item has newTab or externalLink props use <a> tag else use NavLink
  const LinkTag = item.externalLink ? 'a' : NavLink;
  // ** Hooks
  const location = useLocation();

  useEffect(() => {
    if (currentActiveItem !== null) {
      setActiveItem(currentActiveItem);
    }
  }, [location]);

  return (
    <li
      className={classnames({
        'nav-item': !item.children,
        disabled: item.disabled,
        active: item.navLink === activeItem && !item.children,
      })}
    >
      <LinkTag
        id={`${item.id}_nav_bar`}
        className='d-flex align-items-center'
        target={item.newTab ? '_blank' : undefined}
        /*eslint-disable */
        {...(item.externalLink === true
          ? {
              href: item.navLink || '/',
            }
          : {
              to: item.navLink || '/',
              isActive: (match) => {
                if (!match) {
                  return false;
                }

                if (
                  match.url &&
                  match.url !== '' &&
                  match.url === item.navLink
                ) {
                  currentActiveItem = item.navLink;
                }
              },
            })}
      >
        {item.icon}
        <span className='menu-item text-truncate'>{item.title}</span>
        {item.badge && item.badgeText ? (
          <div className='counter__badge'>{item.badgeText}</div>
        ) : null}
      </LinkTag>

      {menuCollapsed && (
        <UncontrolledTooltip placement='right' target={`${item.id}_nav_bar`}>
          {item.title}
        </UncontrolledTooltip>
      )}
    </li>
  );
};

export default VerticalNavMenuLink;
