import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import CustomSelect from '../../../../../@core/components/form-fields/CustomSelect';
import { getGroups } from '../../../../../api/groups';
import { userData } from '../../../../../redux/user';

const QuoteStatus = [
  'Pending',
  'Approved',
  'Denied',
  'Cancelled',
  'Withdrawn',
  'Expired',
];
const quoteStatusOptions = QuoteStatus.map((q) => ({ label: q, value: q }));

export const QuoteAction = ({ quoteStatusActions, setQuoteStatusActions }) => {
  const user = useSelector(userData);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const res = await getGroups({ company: user.company._id });
    if (res.data?.data) {
      const groupOptions = res.data.data.map((group) => {
        return {
          label: group.groupName,
          value: group._id,
        };
      });
      setGroups(groupOptions);
    }
  };

  const updateQuoteAction = (idx, data) => {
    setQuoteStatusActions((prev) =>
      prev.map((statusObj, id) => {
        return id === idx ? { ...statusObj, ...data } : prev;
      })
    );
  };

  return (
    <div>
      <Row>
        <div className='d-flex align-items-center'>
          {quoteStatusActions?.map((quoteAction, index) => {
            return (
              <Fragment key={index}>
                <div>
                  <span className='me-1'>If Quote Status is </span>
                </div>
                <div>
                  <CustomSelect
                    label=''
                    classNamePrefix='group-select-border'
                    value={quoteStatusOptions.find(
                      (q) => q.value === quoteAction?.status
                    )}
                    options={quoteStatusOptions}
                    onChange={(e) => {
                      updateQuoteAction(index, { status: e.value });
                    }}
                  />
                </div>
                <div>
                  <span className='ms-1 me-1'>set group of contact to</span>
                </div>
                <div>
                  <CustomSelect
                    label=''
                    classNamePrefix='group-select-border'
                    isClearable={true}
                    value={groups.find(
                      (g) => g.value === quoteAction?.newGroup
                    )}
                    options={groups}
                    onChange={(e) => {
                      updateQuoteAction(index, { newGroup: e?.value || null });
                    }}
                  />
                </div>
              </Fragment>
            );
          })}
        </div>
      </Row>
    </div>
  );
};
