import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  UncontrolledTooltip,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Spinner,
} from 'reactstrap';
import classnames from 'classnames';
import OnlineOrder from './OnlineOrder';
import OfflineOrder from './OfflineOrder';
import { useGetWooConnection } from '../hooks/InventoryWooConnectionApi';
import WooConnectionNotFound from '../components/WooConnectionNotFound';

const Orders = () => {
  const [currentTab, setCurrentTab] = useState('onlineOrder');
  const [wooStatus, setWooStatus] = useState(true);

  const { getWooConnection, isLoading: getWooDataLoading } =
    useGetWooConnection();

  useEffect(() => {
    getWooData();
  }, []);

  const getWooData = async () => {
    const { data } = await getWooConnection();
    if (!data) {
      setWooStatus(true);
    } else {
      setWooStatus(false);
    }
  };

  return (
    <>
      {getWooDataLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <>
          {wooStatus ? (
            <Card className='w-100'>
              <CardHeader>
                <CardTitle tag='h4' className='text-primary'>
                  Orders
                </CardTitle>
              </CardHeader>
              <WooConnectionNotFound />
            </Card>
          ) : (
            <div>
              <Card className='inventory-orders'>
                <CardHeader>
                  <CardTitle className='d-flex align-items-center'>
                    <h4 className='title card-title'>Inventory Orders</h4>
                  </CardTitle>
                </CardHeader>
                <div className='inventory-orders-tab-wrapper'>
                  <Nav
                    className='horizontal-tabbing hide-scrollbar inventory-orders-tab'
                    tabs
                  >
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: currentTab === 'onlineOrder',
                        })}
                        onClick={() => {
                          setCurrentTab('onlineOrder');
                        }}
                      >
                        Online Orders
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: currentTab === 'offlineOrder',
                        })}
                        onClick={() => {
                          setCurrentTab('offlineOrder');
                        }}
                        id={`offlineOrder`}
                      >
                        Offline Orders
                      </NavLink>
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`offlineOrder`}
                      >
                        Offline Orders
                      </UncontrolledTooltip>
                    </NavItem>
                  </Nav>
                </div>
                <CardBody>
                  <TabContent activeTab={currentTab}>
                    {currentTab === 'onlineOrder' && (
                      <TabPane className='online-order-tab' tabId='onlineOrder'>
                        <OnlineOrder />
                      </TabPane>
                    )}
                    {currentTab === 'offlineOrder' && (
                      <TabPane
                        className='offline-order-tab'
                        tabId='offlineOrder'
                      >
                        <OfflineOrder />
                      </TabPane>
                    )}
                  </TabContent>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
};
export default Orders;
