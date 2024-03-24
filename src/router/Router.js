// ** React Imports
import React, { Suspense, lazy, Fragment, useEffect, useState } from 'react';

// ** Utils
import { useLayout } from '@hooks/useLayout';
import { useRouterTransition } from '@hooks/useRouterTransition';

// ** Custom Components
import LayoutWrapper from '@layouts/components/layout-wrapper';

// ** Router Components
import {
  BrowserRouter as AppRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

// ** Routes & Default Routes
import { Routes } from './routes';
import {
  superAdminRoutes,
  defaultRoute as superAdminDefaultRoute,
} from './routes/superadmin';
import {
  companyAdminRoutes,
  defaultRoute as companyAdminDefaultRoute,
} from './routes/companyadmin';
import { memberDefaultRoute, memberRoutes } from './routes/member';

// ** Layouts
import BlankLayout from '@layouts/BlankLayout';
import VerticalLayout from '@src/layouts/VerticalLayout';
import HorizontalLayout from '@src/layouts/HorizontalLayout';
import SpinnerComponent from '../@core/components/spinner/Fallback-spinner';
import useGetBasicRoute from '../hooks/useGetBasicRoute';
import { getCookie } from '../utility/Utils';

/**
 ** Final Route Component Checks for Login & User Role and then redirects to the route
 */
const FinalRoute = (props) => {
  const route = props.route;
  const isToken = document.cookie.split(';');
  if (isToken?.[0] === '' && !route.meta?.publicRoute) {
    localStorage.removeItem('userId');
    localStorage.removeItem('isCompanyAdmin');
    localStorage.removeItem('memberUserId');
    localStorage.removeItem('memberToken');
    localStorage.removeItem('token');
    localStorage.getItem('isSuperAdmin');
    localStorage.getItem('adminUserId');
    localStorage.getItem('adminToken');
    return <Redirect to='/login' />;
  }
  const isUserLoggedIn = getCookie('token');

  if (
    (!isUserLoggedIn && route.meta === undefined) ||
    (!isUserLoggedIn && route.meta && !route.meta?.publicRoute)
  ) {
    /**
     ** If user is not Logged in & route meta is undefined
     ** OR
     ** If user is not Logged in & route.meta.authRoute are undefined
     ** Then redirect user to login
     */
    return <Redirect to='/login' />;
  } else if (
    route.meta &&
    route.meta?.publicRoute &&
    isUserLoggedIn &&
    route.path !== '/forms/:id' &&
    route.path !== '/checklist-details/:id' &&
    route.path !== '/support-report-forms' &&
    route.path !== '/embed/:id' &&
    route.path !== '/rsvp/:id' &&
    route.path !== '/invoice/preview/:slug' &&
    route.path !== '/quote/preview/:slug' &&
    route.path !== '/unsubscribe' &&
    route.path !== '/verify-email' &&
    route.path !== '/shared-note/:id'
  ) {
    // ** If route has meta and authRole and user is Logged in then redirect user to home page (DefaultRoute)
    return <Redirect to='/' />;
  } else {
    // ** If none of the above render component
    return <route.component {...props} />;
  }
};

const Router = ({ useData }) => {
  // ** Hooks
  const { layout, setLayout, setLastLayout } = useLayout();
  const { transition, setTransition } = useRouterTransition();
  const [routeData, setRouteData] = useState({
    default: '/',
    routes: [],
  });
  const { basicRoute } = useGetBasicRoute();

  // ------------------------------------------
  const tempUserData = useData;
  // const tempUserData = useSelector(userData);
  const role = tempUserData.role;

  /* After Seperate create user from contacts */

  const permissions = tempUserData?.permissions
    ? tempUserData?.permissions
    : [];

  // ** Default Layout
  const DefaultLayout =
    layout === 'horizontal' ? 'HorizontalLayout' : 'VerticalLayout';

  // ** All of the available layouts
  const Layouts = { BlankLayout, VerticalLayout, HorizontalLayout };

  // ** Current Active Item
  const currentActiveItem = null;

  // ** Return Filtered Array of Routes & Paths
  const LayoutRoutesAndPaths = (layout) => {
    const LayoutRoutes = [];
    const LayoutPaths = [];

    [...Routes, ...routeData.routes].filter((route) => {
      // ** Checks if Route layout or Default layout matches current layout
      if (
        route.layout === layout ||
        (route.layout === undefined && DefaultLayout === layout)
      ) {
        LayoutRoutes.push(route);
        LayoutPaths.push(route.path);
      }
    });

    return { LayoutRoutes, LayoutPaths };
  };

  useEffect(() => {
    if (role) {
      if (role === 'superadmin') {
        setRouteData({
          default: superAdminDefaultRoute,
          routes: superAdminRoutes,
        });
      } else if (role === 'admin') {
        //--------------- permission wise set route -------------
        let tempMemberRoutes = [...companyAdminRoutes];
        tempMemberRoutes = tempMemberRoutes.filter(
          (obj) => !obj.id || permissions?.includes(obj?.id)
        );
        setRouteData({
          default: companyAdminDefaultRoute,
          routes: tempMemberRoutes,
        });
      } else if (role === 'user') {
        //--------------- permission wise set route -------------
        let tempMemberRoutes = [...memberRoutes];
        tempMemberRoutes = tempMemberRoutes.filter(
          (obj) => !obj.id || permissions?.includes(obj?.id)
        );
        setRouteData({
          default: memberDefaultRoute,
          routes: tempMemberRoutes,
        });
      } else {
        setRouteData({
          default: memberDefaultRoute,
          routes: memberRoutes,
        });
      }
    }
    // const token = localStorage.getItem('token');
    const isToken = getCookie('token');
    if (!isToken) {
      localStorage.removeItem('userId');
      localStorage.removeItem('isCompanyAdmin');
      localStorage.removeItem('memberUserId');
      localStorage.removeItem('memberToken');
      localStorage.getItem('isSuperAdmin');
      localStorage.getItem('adminUserId');
      localStorage.getItem('adminToken');
      localStorage.removeItem('token');
      setRouteData({
        default: '/login',
        routes: Routes,
      });
    }
  }, [role]);
  // }, [user ]);

  const NotAuthorized = lazy(() => import('@src/views/NotAuthorized'));

  // ** Init Error Component
  // const Error = lazy(() => import('@src/views/Error'));

  // ** Return Route to Render
  const resolveRoutes = () => {
    return Object.keys(Layouts).map((layout, index) => {
      // ** Convert Layout parameter to Layout Component
      // ? Note: make sure to keep layout and component name equal

      const LayoutTag = Layouts[layout];

      // ** Get Routes and Paths of the Layout
      const { LayoutRoutes, LayoutPaths } = LayoutRoutesAndPaths(layout);

      // ** We have freedom to display different layout for different route
      // ** We have made LayoutTag dynamic based on layout, we can also replace it with the only layout component,
      // ** that we want to implement like VerticalLayout or HorizontalLayout
      // ** We segregated all the routes based on the layouts and Resolved all those routes inside layouts

      // ** RouterProps to pass them to Layouts
      const routerProps = {};

      return (
        <Route path={LayoutPaths} key={index}>
          <LayoutTag
            useData={useData}
            layout={layout}
            setLayout={setLayout}
            transition={transition}
            routerProps={routerProps}
            setLastLayout={setLastLayout}
            setTransition={setTransition}
            currentActiveItem={currentActiveItem}
          >
            <Switch>
              {LayoutRoutes.map((route) => {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    exact={route.exact === true}
                    render={(props) => {
                      window.scrollTo(0, 0);
                      // ** Assign props to routerProps
                      Object.assign(routerProps, {
                        ...props,
                        meta: route.meta,
                        userGuide: route?.userGuide || null,
                      });

                      return (
                        <Fragment>
                          {/* Layout Wrapper to add classes based on route's layout, appLayout and className */}

                          {route.layout === 'BlankLayout' ? (
                            <Fragment>
                              <FinalRoute route={route} {...props} />
                            </Fragment>
                          ) : (
                            <LayoutWrapper
                              layout={DefaultLayout}
                              transition={transition}
                              setTransition={setTransition}
                              /* Conditional props */
                              /*eslint-disable */
                              {...(route.appLayout
                                ? {
                                    appLayout: route.appLayout,
                                  }
                                : {})}
                              {...(route.meta
                                ? {
                                    routeMeta: route.meta,
                                  }
                                : {})}
                              {...(route.className
                                ? {
                                    wrapperClass: route.className,
                                  }
                                : {})}
                              /*eslint-enable */
                            >
                              <Suspense fallback={<SpinnerComponent />}>
                                <FinalRoute route={route} {...props} />
                              </Suspense>
                            </LayoutWrapper>
                          )}
                        </Fragment>
                      );
                    }}
                  />
                );
              })}
            </Switch>
          </LayoutTag>
        </Route>
      );
    });
  };

  return (
    routeData.routes.length > 0 && (
      <AppRouter basename={process.env.REACT_APP_BASENAME}>
        <Switch>
          {/* If user is logged in Redirect user to DefaultRoute else to login */}
          <Route
            exact
            path='/'
            render={() => {
              return <Redirect to={routeData.default} />;
            }}
          />
          {/* Not Auth Route */}
          <Route
            exact
            path='/misc/not-authorized'
            render={() => (
              <Layouts.BlankLayout>
                <NotAuthorized />
              </Layouts.BlankLayout>
            )}
          />
          {resolveRoutes()}
          {/* NotFound Error page */}
          <Route
            path='*'
            render={() =>
              getCookie('token') ? (
                <Redirect to={`${basicRoute}/home`} />
              ) : (
                <Redirect to='/login' />
              )
            }
          />
          {/* <Route
            path='*'
            render={() =>
              getCookie('token') ? <Error /> : <Redirect to='/login' />
            }
          /> */}
          {/* <Route path='*' component={Error} /> */}
        </Switch>
      </AppRouter>
    )
  );
};

export default Router;
