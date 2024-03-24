import { Label } from 'reactstrap';
import { removeSpecialCharactersFromString } from '../../../../helper/common.helper';
import { renderFile } from './EmailTemplatePreviewModal';
import { Eye } from 'react-feather';
import _ from 'lodash';

export const ActivityFormDetails = ({
  fields,
  formResponseDetails,
  setOpenPreviewImage,
}) => {
  return (
    <div className='left-dynamic-content'>
      {fields.length &&
        fields?.map((field, index) => {
          const responseDetails =
            formResponseDetails?.[
              removeSpecialCharactersFromString(field.label)
            ];
          return (
            <>
              <div>
                <Label>{field?.label} : </Label>{' '}
                <Label>
                  {field.type === 'file' && responseDetails.length ? (
                    <>
                      <div className='file__drop__zone_wp'>
                        <div className='file__card m-1'>
                          <div className='d-flex justify-content-center file__preview__wp'>
                            <div className='file__preview__sm'>
                              {renderFile(
                                `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${responseDetails?.[0]}`
                              )}
                            </div>
                            <div
                              className='overlay cursor-pointer'
                              onClick={() => {
                                setOpenPreviewImage(responseDetails?.[0]);
                              }}
                            >
                              <Eye color='#ffffff' />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : ['multiSelect', 'select'].includes(field.type) ? (
                    <>
                      {field.type === 'select'
                        ? responseDetails?.label
                        : field?.type === 'multiSelect' &&
                          _.isArray(responseDetails) &&
                          responseDetails?.length
                        ? responseDetails?.map((obj) => obj.label)?.join(', ')
                        : _.isString(responseDetails)
                        ? responseDetails
                        : null}
                    </>
                  ) : (
                    <div key={index}>
                      <span>{responseDetails}</span>
                    </div>
                  )}
                </Label>
              </div>
            </>
          );
        })}
    </div>
  );
};
