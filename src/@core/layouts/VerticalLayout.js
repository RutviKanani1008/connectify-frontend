/* eslint-disable no-unused-vars */
// ** React Imports
import { useState, useEffect, Fragment } from 'react';
import { useLocation } from 'react-router-dom';

// ** Store & Actions
import { useSelector, useDispatch } from 'react-redux';
import {
  handleMenuCollapsed,
  handleContentWidth,
  handleMenuHidden,
} from '@store/layout';

// ** Third Party Components
import classnames from 'classnames';
import { ArrowUp, Box, Clock, Home, ShoppingBag, User } from 'react-feather';

// ** Reactstrap Imports
import { Navbar, Button } from 'reactstrap';

// ** Configs
import themeConfig from '@configs/themeConfig';

// ** Custom Components
import Customizer from '@components/customizer';
import ScrollToTop from '@components/scrolltop';
import FooterComponent from './components/footer';
import NavbarComponent from './components/navbar';
import SidebarComponent from './components/menu/vertical-menu';

// ** Custom Hooks
import { useRTL } from '@hooks/useRTL';
import { useSkin } from '@hooks/useSkin';
import { useNavbarType } from '@hooks/useNavbarType';
import { useFooterType } from '@hooks/useFooterType';
import { useNavbarColor } from '@hooks/useNavbarColor';

// ** Styles
import '@styles/base/core/menu/menu-types/vertical-menu.scss';
import '@styles/base/core/menu/menu-types/vertical-overlay-menu.scss';
import { useUpdateUserPreference } from '../../views/Admin/services/preference.services';
import { userData } from '../../redux/user';
import { UserGuideModal } from './UserGuideModal';
import { handleMobileTaskTimer } from '../../redux/layout';
import useGetBasicRoute from '../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useToggleDropdown } from '../../hooks/useToggleDropdown';

const VerticalLayout = (props) => {
  // ** Props
  const {
    menu,
    navbar,
    footer,
    menuData,
    children,
    routerProps,
    setLastLayout,
    currentActiveItem,
  } = props;
  // ** Hooks
  const [isRtl, setIsRtl] = useRTL();
  const { skin, setSkin } = useSkin();
  const { navbarType, setNavbarType } = useNavbarType();
  const { footerType, setFooterType } = useFooterType();
  const { navbarColor, setNavbarColor } = useNavbarColor();
  const { basicRoute } = useGetBasicRoute();

  // ** States
  const [isMounted, setIsMounted] = useState(false);
  const [menuVisibility, setMenuVisibility] = useState(false);
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [availableUserGuides, setAvailableUserGuides] = useState([]);
  const [currentPageUserGuide, setCurrentPageUserGuide] = useState(null);
  const [isUserGuideAvailable, setIsUserGuideAvailable] = useState(false);

  // ** Store Vars
  const dispatch = useDispatch();
  const currentUser = useSelector(userData);
  const layoutStore = useSelector((state) => state.layout);

  // ** Update Window Width
  const handleWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  // ** Vars
  const history = useHistory();
  const location = useLocation();
  const contentWidth = layoutStore.contentWidth;
  const menuCollapsed = layoutStore.menuCollapsed;
  const isHidden = layoutStore.menuHidden;

  // ** Toggles Menu Collapsed
  const setMenuCollapsed = (val) => dispatch(handleMenuCollapsed(val));

  // ** Handles Content Width
  const setContentWidth = (val) => dispatch(handleContentWidth(val));

  // ** Handles Content Width
  const setIsHidden = (val) => dispatch(handleMenuHidden(val));

  // ** Custom Hooks
  const { dropdownRef, isDropdownOpen, toggleDropdown } = useToggleDropdown();

  useEffect(() => {
    dispatch(handleMobileTaskTimer(isDropdownOpen));
  }, [isDropdownOpen]);

  //** This function will detect the Route Change and will hide the menu on menu item click
  useEffect(() => {
    if (menuVisibility && windowWidth < 1200) {
      setMenuVisibility(false);
    }
  }, [location]);

  useEffect(() => {
    checkUserGuideExistsOrNot();
  }, [props, location]);

  //** Sets Window Size & Layout Props
  useEffect(() => {
    if (window !== undefined) {
      window.addEventListener('resize', handleWindowWidth);
    }
  }, [windowWidth]);

  //** ComponentDidMount
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setAvailableUserGuides(currentUser?.userGuides || []);
    }
  }, [currentUser]);

  const checkUserGuideExistsOrNot = () => {
    const { userGuide } = props.routerProps;
    if (userGuide) {
      const tempCurrentPageUserGuide = availableUserGuides.find(
        (individualUserGuide) => individualUserGuide.page?.pageId === userGuide
      );
      if (tempCurrentPageUserGuide) {
        setIsUserGuideAvailable(true);
      } else {
        setIsUserGuideAvailable(false);
      }
    } else {
      setIsUserGuideAvailable(false);
    }
  };

  const handleSelectCurrentPageGuide = () => {
    if (props.routerProps) {
      //
      const { userGuide } = props.routerProps;
      if (userGuide) {
        const tempCurrentPageUserGuide = availableUserGuides.find(
          (individualUserGuide) =>
            individualUserGuide.page?.pageId === userGuide
        );
        setCurrentPageUserGuide(tempCurrentPageUserGuide);
      }
      setShowUserGuideModal(true);
    }
  };
  // ** Vars
  const footerClasses = {
    static: 'footer-static',
    sticky: 'footer-fixed',
    hidden: 'footer-hidden',
  };

  const navbarWrapperClasses = {
    floating: 'navbar-floating',
    sticky: 'navbar-sticky',
    static: 'navbar-static',
    hidden: 'navbar-hidden',
  };

  const navbarClasses = {
    floating: contentWidth === 'boxed' ? 'floating-nav' : 'floating-nav',
    sticky: 'fixed-top',
    static: 'navbar-static-top',
    hidden: 'd-none',
  };

  const bgColorCondition =
    navbarColor !== '' && navbarColor !== 'light' && navbarColor !== 'white';

  /** Hooks */
  const { updateUserPreference } = useUpdateUserPreference();

  const setSidebarState = async (state) => {
    if (menuCollapsed !== state) {
      setMenuCollapsed(state);
      await updateUserPreference(currentUser._id, {
        mainSidebarCollapsed: state,
      });
    }
  };

  if (!isMounted) {
    return null;
  }

  const handleCloseUserGuideModal = () => {
    setShowUserGuideModal(false);
    setCurrentPageUserGuide(null);
  };
  return (
    <>
      {isUserGuideAvailable && (
        <div className='learn-more-button'>
          <Button
            color='primary'
            onClick={() => {
              handleSelectCurrentPageGuide();
            }}
          >
            <span className='icon-wrapper'>
              <span className='inner__wrapper'>?</span>
            </span>
            <span className='text'>Learn More About This Page</span>
          </Button>
        </div>
      )}
      {/* HELLO */}
      {/* <div className='learn-more-button mt-10'>
        <Button
          color='primary'
          onClick={() => {
            const windowOptions = `width=${800},height=${800}`;
            window.open(
              `${process.env.REACT_APP_APP_URL}${window.location.pathname}`,
              '_blank',
              windowOptions
            );
          }}
        >
          <span className='icon-wrapper'>
            <span className='inner__wrapper'>?</span>
          </span>
          <span className='text'>Hello Info</span>
        </Button>
      </div> */}
      <div
        className={classnames(
          `wrapper vertical-layout new-ui ${
            navbarWrapperClasses[navbarType] || 'navbar-floating'
          } ${footerClasses[footerType] || 'footer-static'}`,
          {
            // Modern Menu
            'vertical-menu-modern': windowWidth >= 1200,
            'menu-collapsed': menuCollapsed && windowWidth >= 1200,
            'menu-expanded': !menuCollapsed && windowWidth > 1200,

            // Overlay Menu
            'vertical-overlay-menu': windowWidth < 1200,
            'menu-hide': !menuVisibility && windowWidth < 1200,
            'menu-open': menuVisibility && windowWidth < 1200,
          }
        )}
        {...(isHidden ? { 'data-col': '1-column' } : {})}
      >
        {!isHidden ? (
          <SidebarComponent
            skin={skin}
            menu={menu}
            menuData={menuData}
            routerProps={routerProps}
            menuCollapsed={menuCollapsed}
            menuVisibility={menuVisibility}
            setMenuCollapsed={setSidebarState}
            setMenuVisibility={setMenuVisibility}
            currentActiveItem={currentActiveItem}
          />
        ) : null}

        <Navbar
          expand='lg'
          container={false}
          light={skin !== 'dark'}
          dark={skin === 'dark' || bgColorCondition}
          color={bgColorCondition ? navbarColor : undefined}
          className={classnames(
            `header-navbar navbar align-items-center ${
              navbarClasses[navbarType] || 'floating-nav'
            } navbar-shadow`
          )}
        >
          <div className='navbar-container d-flex content'>
            {navbar ? (
              navbar
            ) : (
              <NavbarComponent
                dropdownRef={dropdownRef}
                mobileTaskTimerOpen={layoutStore.mobileTaskTimerOpen}
                setMenuVisibility={setMenuVisibility}
                skin={skin}
                setSkin={setSkin}
              />
            )}
          </div>
        </Navbar>
        {children}

        {/* Vertical Nav Menu Overlay */}
        <div
          className={classnames('sidenav-overlay', {
            show: menuVisibility,
          })}
          onClick={() => setMenuVisibility(false)}
        ></div>
        {/* Vertical Nav Menu Overlay */}

        {themeConfig.layout.customizer === true ? (
          <Customizer
            skin={skin}
            setSkin={setSkin}
            footerType={footerType}
            setFooterType={setFooterType}
            navbarType={navbarType}
            setNavbarType={setNavbarType}
            navbarColor={navbarColor}
            setNavbarColor={setNavbarColor}
            isRtl={isRtl}
            setIsRtl={setIsRtl}
            layout={props.layout}
            setLayout={props.setLayout}
            setLastLayout={setLastLayout}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
            contentWidth={contentWidth}
            setContentWidth={setContentWidth}
            menuCollapsed={menuCollapsed}
            setMenuCollapsed={setMenuCollapsed}
            transition={props.transition}
            setTransition={props.setTransition}
            themeConfig={themeConfig}
          />
        ) : null}
        <footer
          className={classnames(
            `footer footer-light ${
              footerClasses[footerType] || 'footer-static'
            }`,
            {
              'd-none': footerType === 'hidden',
            }
          )}
        >
          {footer ? (
            footer
          ) : (
            <FooterComponent
              footerType={footerType}
              footerClasses={footerClasses}
            />
          )}
        </footer>

        <div className='mobile-bottom-menu-wrapper'>
          <div className='mobile-bottom-menu'>
            <div className='inner-wrapper'>
              <div className='menu-item'>
                <div className='inner-wrapper'>
                  <div
                    className='icon-wrapper'
                    onClick={() => {
                      history.push(`${basicRoute}/update-profile`);
                    }}
                  >
                    <User />
                  </div>
                </div>
              </div>
              <div className='menu-item'>
                <div className='inner-wrapper'>
                  <div
                    className='icon-wrapper'
                    onClick={() => {
                      history.push(`${basicRoute}/home`);
                    }}
                  >
                    <Box />
                  </div>
                </div>
              </div>
              <div className='menu-item active'>
                <div className='inner-wrapper'>
                  <div
                    className='icon-wrapper'
                    onClick={() => {
                      history.push(`${basicRoute}/home`);
                    }}
                  >
                    <Home />
                  </div>
                </div>
              </div>
              <div className='menu-item'>
                <div className='inner-wrapper'>
                  <div
                    className='icon-wrapper'
                    onClick={() => {
                      history.push(`${basicRoute}/product/all`);
                    }}
                  >
                    <ShoppingBag />
                  </div>
                </div>
              </div>
              <div className='menu-item'>
                <div className='inner-wrapper'>
                  <div
                    className='icon-wrapper'
                    onClick={() => {
                      toggleDropdown();
                    }}
                  >
                    <Clock />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {themeConfig.layout.scrollTop === true ? (
          <div className='scroll-to-top'>
            <ScrollToTop showOffset={300} className='scroll-top d-block'>
              <Button className='btn-icon' color='primary'>
                <ArrowUp size={14} />
              </Button>
            </ScrollToTop>
          </div>
        ) : null}

        {showUserGuideModal && (
          <>
            <UserGuideModal
              showUserGuideModal={showUserGuideModal}
              handleCloseUserGuideModal={handleCloseUserGuideModal}
              currentPageUserGuide={currentPageUserGuide}
            />
          </>
        )}
      </div>
    </>
  );
};

export default VerticalLayout;
