import React, { useState, useEffect } from 'react';
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
} from 'reactstrap';
import classnames from 'classnames';
import InventoryProductCategory from './InventoryProductCategory';
import InventoryWooCommerceConnection from './InventoryWooCommerceConnection';
import InventoryProductCriteria from './InventoryProductCriteria';
import InventoryInstructions from './InventoryInstructions';

const InventorySetting = () => {
  const [currentTab, setCurrentTab] = useState('productCategory');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tabName = queryParams.get('tabName');
    if (tabName) setCurrentTab(tabName);
  }, [currentTab]);

  const setTabValue = (currentTab) => {
    setCurrentTab(currentTab);
    const queryParams = new URLSearchParams(window.location.search);
    const tabName = queryParams.get('tabName');
    if (tabName) {
      queryParams.set('tabName', currentTab);
      history.replaceState(null, null, `?${queryParams.toString()}`);
      setCurrentTab(currentTab);
    }
  };
  return (
    <div>
      <Card className='inventory-settings'>
        <CardHeader>
          <CardTitle className='d-flex align-items-center'>
            <h4 className='title card-title'>Inventory Settings</h4>
          </CardTitle>
        </CardHeader>
        <div className='inventory-settings-tab-wrapper'>
          <Nav
            className='horizontal-tabbing hide-scrollbar inventory-settings-tab'
            tabs
          >
            <NavItem>
              <NavLink
                className={classnames({
                  active: currentTab === 'productCategory',
                })}
                onClick={() => {
                  setTabValue('productCategory');
                }}
              >
                Product Categories
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({
                  active: currentTab === 'productCriteria',
                })}
                onClick={() => {
                  setTabValue('productCriteria');
                }}
              >
                Product Criteria
              </NavLink>
            </NavItem>    
            <NavItem>
              <NavLink
                className={classnames({
                  active: currentTab === 'wooCommerceConnection',
                })}
                onClick={() => {
                  setTabValue('wooCommerceConnection');
                }}
                id={`wooCommerceConnection`}
              >
                wooCommerce
              </NavLink>
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`wooCommerceConnection`}
              >
                wooCommerce Connection
              </UncontrolledTooltip>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({
                  active: currentTab === 'instructions',
                })}
                onClick={() => {
                  setTabValue('instructions');
                }}
                id={`instructions`}
              >
                Instructions
              </NavLink>
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`instructions`}
              >
                Instructions
              </UncontrolledTooltip>
            </NavItem>
          </Nav>
        </div>
        <CardBody>
          <TabContent activeTab={currentTab}>
            <TabPane
              className='inventory-product-category-tab'
              tabId='productCategory'
            >
              <InventoryProductCategory setTabValue={setTabValue} />
            </TabPane>
            {/* {currentTab === 'warehouseLocation' && (
              <TabPane tabId='warehouseLocation'>
                <InventoryWarehouseLocation />
              </TabPane>
            )} */}
            {currentTab === 'productCriteria' && (
              <TabPane
                className='inventory-product-criteria-tab'
                tabId='productCriteria'
              >
                <InventoryProductCriteria />
              </TabPane>
            )}
            {currentTab === 'wooCommerceConnection' && (
              <TabPane
                className='inventory-product-wooCommerce-tab'
                tabId='wooCommerceConnection'
              >
                <InventoryWooCommerceConnection />
              </TabPane>
            )}
            {currentTab === 'instructions' && (
              <TabPane
                className='inventory-product-wooCommerce-tab'
                tabId='instructions'
              >
                <InventoryInstructions setTabValue={setTabValue} />
              </TabPane>
            )}
          </TabContent>
        </CardBody>
      </Card>
    </div>
  );
};
export default InventorySetting;
