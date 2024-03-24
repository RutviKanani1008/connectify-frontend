import { Fragment } from 'react';
import { useWatch } from 'react-hook-form';
import { Label, Spinner, UncontrolledTooltip } from 'reactstrap';

export const FunnelView = (props) => {
  const {
    availableGroups,
    control,
    setValue,
    handleGroupChange,
    getValues,
    groupChangeLoading,
  } = props;
  const currentGroup = getValues('group');
  const currentStatus = getValues('status');
  const currentCategory = getValues('category');

  const statusList = useWatch({ control, name: 'statusList' });
  const categoryList = useWatch({ control, name: 'categoryList' });
  return (
    <>
      <div className='funnel-wrapper'>
        <div className='funnel-sec'>
          <h3 className='funnel-title'>Group</h3>
          <div className='funnel-cn-wrapper'>
            {availableGroups.length > 0 &&
              availableGroups.map((group, index) => {
                return (
                  <Fragment key={index}>
                    <div
                      key={group.value}
                      id={`group-${group.id}`}
                      className={`funnel-item ${
                        currentGroup?.id === group.id && 'active'
                      }`}
                      onClick={() => {
                        handleGroupChange(group);
                        setValue('group', group);
                      }}
                    >
                      <span className='funnel-name'>{group.label}</span>
                    </div>
                    {group.label.length > 9 && (
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`group-${group.id}`}
                      >
                        {group.label}
                      </UncontrolledTooltip>
                    )}
                  </Fragment>
                );
              })}
          </div>
        </div>
        <div className='funnel-sec'>
          <h3 className='funnel-title'>Category</h3>
          <div className='funnel-cn-wrapper'>
            {groupChangeLoading ? (
              <div>
                <Spinner />
              </div>
            ) : categoryList?.length > 0 ? (
              categoryList?.map((category, index) => {
                return (
                  <Fragment key={index}>
                    <div
                      id={`category-${category.id}`}
                      key={category.value}
                      className={`funnel-item ${
                        currentCategory?.id === category.id && 'active'
                      }`}
                      onClick={() => {
                        setValue('category', category);
                      }}
                    >
                      <span className='funnel-name'>{category.label}</span>
                    </div>
                    {category.label.length > 9 && (
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`category-${category.id}`}
                      >
                        {category.label}
                      </UncontrolledTooltip>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <Label>No Category Found</Label>
            )}
          </div>
        </div>
        <div className='funnel-sec'>
          <h3 className='funnel-title'>Status</h3>
          <div className='funnel-cn-wrapper'>
            {groupChangeLoading ? (
              <div>
                <Spinner />
              </div>
            ) : statusList?.length > 0 ? (
              statusList.map((status, index) => {
                return (
                  <Fragment key={index}>
                    <div
                      id={`status-${status.id}`}
                      key={status.value}
                      className={`funnel-item ${
                        currentStatus?.id === status.id && 'active'
                      }`}
                      onClick={() => {
                        setValue('status', status);
                      }}
                    >
                      <span className='funnel-name'>{status.label}</span>
                    </div>
                    {status.label.length > 9 && (
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`status-${status.id}`}
                      >
                        {status.label}
                      </UncontrolledTooltip>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <Label>No Status Found</Label>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
