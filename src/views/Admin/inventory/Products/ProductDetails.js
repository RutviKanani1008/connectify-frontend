import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Label,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  TabContent,
  TabPane,
  UncontrolledTooltip,
} from 'reactstrap';
import classnames from 'classnames';
import { useGetProduct } from '../hooks/InventoryProductApi';
import Barcode from 'react-barcode';
import { Edit2, Printer } from 'react-feather';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import PrintBarcodeModal from '../components/PrintBarcodeModal';
import ProductTimelineDetails from './../components/ProductTimelineDetails';
import noProductImage from '../../../../assets/images/pages/no-product-image.png';

const ProductDetails = () => {
  const { basicRoute } = useGetBasicRoute();
  const params = useParams();
  const history = useHistory();
  const [product, setProduct] = useState({});
  const [barcodeModal, setBarcodeModal] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [currentTab, setCurrentTab] = useState('basicInfo');

  const { getProduct, isLoading: getProductLoading } = useGetProduct();

  useEffect(async () => {
    getProductDetails();
  }, [params.id]);

  const getProductDetails = async () => {
    const { data, error } = await getProduct(params.id);
    if (!error) {
      const productDetail = data;
      const galleryImages = productDetail.galleryImages.map((item) => {
        return item.fileUrl;
      });
      productDetail.image  ?  setProductImages([productDetail.image, ...galleryImages]) : setProductImages([]);
      setProduct(productDetail);
    }
  };

  return (
    <>
      {getProductLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <div className='inventory_product_details'>
          <Card>
            <CardHeader>
              <CardTitle className='d-flex align-items-center'>
                <div
                  className='back-arrow'
                  onClick={() => history.goBack()}
                  id={'goback'}
                >
                  <UncontrolledTooltip placement='top' target={`goback`}>
                    Go Back
                  </UncontrolledTooltip>
                </div>
                <h4 className={`title card-title`}>Product Details</h4>
              </CardTitle>
              <div className='action-btn-wrapper'>
                <div className='action-btn edit-btn' id='edit-product'>
                  <Edit2
                    onClick={() => {
                      history.push(`${basicRoute}/product/${product?._id}`);
                    }}
                    color='black'
                  />
                </div>
                <UncontrolledTooltip placement='bottom' target={`edit-product`}>
                  Update Product
                </UncontrolledTooltip>
                <div className='action-btn print-btn' id='barcode-print'>
                  <Printer
                    onClick={() => {
                      setBarcodeModal(true);
                    }}
                    color='black'
                  />
                </div>
                <UncontrolledTooltip
                  placement='bottom'
                  target={`barcode-print`}
                >
                  Print Barcode
                </UncontrolledTooltip>
              </div>
            </CardHeader>
            <div className='add-update-contact-tab-wrapper'>
              <Nav
                className='horizontal-tabbing hide-scrollbar add-update-contact-tab'
                tabs
              >
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: currentTab === 'basicInfo',
                    })}
                    onClick={() => {
                      setCurrentTab('basicInfo');
                    }}
                    id={`basicInfo`}
                  >
                    Basic Info
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: currentTab === 'history',
                    })}
                    onClick={() => {
                      setCurrentTab('history');
                    }}
                    id={`history`}
                  >
                    History
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
            <CardBody>
              <TabContent activeTab={currentTab}>
                <TabPane tabId='basicInfo'>
                  <div className='inventory-product-details'>
                    {productImages.length > 0 ? (
                      <div className='product-images'>
                        <Carousel>
                          {productImages.map((image, index) => {
                            return (
                              <div key={index}>
                                <img 
                                  src={image.startsWith("https") ? image : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${image}`}
                                />
                              </div>
                            );
                          })}
                        </Carousel>
                      </div>
                      ) :
                        <div className='product-images'>
                          <img style={{width:"300px"}} src={noProductImage} />
                        </div>
                      }
                    <div className='product-content-right'>
                      <h2 className='product-title'>{product.title}</h2>

                      {product.sku && (
                        <div className='product-barcode'>
                          <h3 className='title'>System Barcode</h3>
                          <Barcode
                            value={product.sku}
                            format='CODE128'
                            width='3'
                            height='50'
                          />
                        </div>
                      )}
                      {product.manufacturerBarcode && (
                        <>
                          <div className='product-barcode'>
                            <h3 className='title'>Manufacture Barcode</h3>
                            <Barcode
                              value={product.manufacturerBarcode}
                              format='CODE128'
                              width='3'
                              height='50'
                            />
                          </div>
                        </>
                      )}
                      <div className='product-price'>
                        <Label>Price</Label>
                        {product.salePrice && (
                          <span className='sell-price'>{`$${product.salePrice}`}</span>
                        )}
                        {product.price && (
                          <span className='orignal-price'>{`$${product.price}`}</span>
                        )}
                      </div>
                      <div className='product-description'>
                        <h3 className='title'>Description</h3>
                        {product.description && <p>{product.description}</p>}
                      </div>
                      {product.productLocations && product.productLocations.length > 0 && (
                        <div className='product-locations'>
                            <h3 className='title'>Product Locations</h3>
                          {product.productLocations.map((item, index) => {
                              if (item.isSelected) {
                                return (
                                  <>
                                    <ul  key={index} className='criteria-details'>
                                      <li>
                                        <div className='inner-wrapper'>
                                          <span className='label'>{item.location}</span>
                                            {item.criteria && Object.keys(item.criteria).map((k, index) => (
                                              <div className='value' key={index}>
                                                {typeof item.criteria[k] !== 'object' ?
                                                <>
                                                  <span>{k}</span> : <span>{item.criteria[k]}</span>
                                                </>
                                                  :
                                                <>
                                                  <span>{k}</span> : <span>{item.criteria[k]?.value}</span>
                                                </>
                                              }
                                              </div>              
                                            ))}
                                        </div>
                                      </li>
                                    </ul>
                                  </>
                                )
                              }   
                          })}
                        
                        </div>
                      )}
                      <ul className='ectra-details'>
                        {product.category && (
                          <li>
                            <div className='inner-wrapper'>
                              <span className='label'>Category:</span>
                              <span className='value'>
                                {product.category.name}
                              </span>
                            </div>
                          </li>
                        )}
                        {product.quantity && (
                          <li>
                            <div className='inner-wrapper'>
                              <span className='label'>Quantity:</span>
                              <span className='value'>{product.quantity}</span>
                            </div>
                          </li>
                        )}
                        {product.weight && product.weight[0].value && (
                          <li>
                            <div className='inner-wrapper'>
                              <span className='label'>Weight:</span>
                              <span className='value'>
                                {product.weight[0].value}
                                {product.weight[0].unit.value &&
                                  product.weight[0].unit.value}
                              </span>
                            </div>
                          </li>
                        )}
                        {product.warehouse && (
                          <li>
                            <div className='inner-wrapper'>
                              <span className='label'>Warehouse:</span>
                              <span className='value'>
                                {product.warehouse.name}
                              </span>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </TabPane>
                <TabPane tabId='history'>
                  {currentTab === 'history' && <ProductTimelineDetails />}
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </div>
      )}
      {barcodeModal ? (
        <>
          <PrintBarcodeModal
            setBarcodeModal={setBarcodeModal}
            product={product}
            barcodeModal={barcodeModal}
          />
        </>
      ) : null}
    </>
  );
};

export default ProductDetails;
