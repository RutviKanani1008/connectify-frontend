import React from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

const ProductTimelineModal = ({
  timelineModal,
  setTimelineModal,
  productHistory,
}) => {
  const ignoreKeys = ['updatedTime', 'updatedBy', 'galleryImages', 'image', 'productLocationQuestion'];

  const getCompareData = (key, value, valueType) => {
    const locations = []
    switch (key) {
      case 'category':
        return value[valueType] ? value[valueType]['label'] : 'N/A';
      case 'warehouse':
        return value[valueType] ? value[valueType]['label'] : 'N/A';
      case 'syncToWooCommerce':
        return value[valueType] ? 'True' : 'False';
      case 'productLocations':
        value[valueType].map((item) => {
          item.isSelected && locations.push(item.location)
        })
        return locations.toString();
      default:
        return value[valueType] ? value[valueType] : 'N/A';
    }
  };

  const titleCase = (str) => {
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
  };

  return (
    <Modal
      isOpen={timelineModal}
      toggle={() => {
        setTimelineModal(false);
      }}
      className='modal-dialog-centered product-history-modal'
      backdrop='static'
    >
      <ModalHeader toggle={() => setTimelineModal(false)}>
        Product History
      </ModalHeader>
      <ModalBody>
        <div className='history-details-wrapper'>
          {Object.entries(productHistory).map(([key, value]) => {
            if (!ignoreKeys.includes(key)) {
              const description = 'description';
              const title = 'title';
              const location = 'location';
              const category = 'category';
              return (
                <div
                  key={key}
                  className={`history-details-box ${
                    key === description ? 'description-details-box' : ''
                  } ${key === title ? 'title-details-box' : ''} ${
                    key === location ? 'location-details-box' : ''
                  } ${key === category ? 'category-box' : ''}`}
                >
                  <div className='inner-wrapper'>
                    <div className='item-name'>{titleCase(key)}</div>
                    <div className='contant-body'>
                      <div className='item-details-row initial-row'>
                        <span className='label'>Initial Value:</span>
                        <span className='value'>
                          {getCompareData(key, value, 'initialValue')}
                        </span>
                      </div>
                      <div className='item-details-row updated-row'>
                        <span className='label'>Updated Value:</span>
                        <span className='value'>
                          {getCompareData(key, value, 'updateData')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (key === 'image') {
              return (
                <div key={key} className='history-details-box img-details-box'>
                  <div className='inner-wrapper'>
                    <div className='item-name'>{`Product  ${titleCase(
                      key
                    )}`}</div>
                    <div className='contant-body'>
                      <div className='item-details-row initial-row'>
                        <span className='label'>Initial Value: </span>
                        <div className='img-main-wrapper'>
                          {value['initialValue'] && (
                            <div className='img-wrapper'>
                              <div className='inner-wrapper'>
                                <img
                                  style={{ width: '100px', height: '100px' }}
                                  src={value['initialValue'].startsWith('http') ? value['initialValue'] : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${value['initialValue']}`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='item-details-row updated-row'>
                        <span className='label'>Updated Value: </span>
                        <div className='img-main-wrapper'>
                          <div className='img-wrapper'>
                            <div className='inner-wrapper'>
                              <img
                                style={{ width: '100px', height: '100px' }}
                                src={value['updateData'].startsWith('http') ? value['updateData'] : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${value['updateData']}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (key === 'galleryImages') {
              return (
                <div key={key} className='history-details-box img-details-box'>
                  <div className='inner-wrapper'>
                    <div className='item-name'>Product Image</div>
                    <div className='contant-body'>
                      <div className='item-details-row initial-row'>
                        <span className='label'>Initial Value</span>
                        <div className='img-main-wrapper'>
                          {value['initialValue'].length > 0 &&
                            value['initialValue'].map((image, index) => {
                              return (
                                <div className='img-wrapper' key={index}>
                                  <div className='inner-wrapper'>
                                    <img
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                      }}
                                      src={image.fileUrl.startsWith('https') ? image.fileUrl : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${image.fileUrl}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      <div className='item-details-row updated-row'>
                        <span className='label'>Updated Value</span>
                        <div className='img-main-wrapper'>
                          {value['updateData'].length > 0 &&
                            value['updateData'].map((image, index) => {
                              return (
                                <div className='img-wrapper' key={index}>
                                  <div className='inner-wrapper'>
                                    <img
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                      }}
                                      src={image.fileUrl.startsWith('https') ? image.fileUrl : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${image.fileUrl}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ProductTimelineModal;
