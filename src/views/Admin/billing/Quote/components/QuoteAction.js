// ==================== Packages =======================
import React from 'react';
import { useWatch } from 'react-hook-form';
import { Label, Row, UncontrolledTooltip } from 'reactstrap';
import { FormField } from '@components/form-fields';
// ====================================================
import QuoteActionItem from './QuoteActionItem';

export const QuoteAction = ({
  control,
  watch,
  getValues,
  setValue,
  currentCustomer,
  initialQuoteActions,
}) => {
  // ========================== Hooks ================================
  const quoteStatusActions = useWatch({
    control,
    name: `quoteStatusActions`,
  });

  const enableStatusAction = useWatch({
    control,
    name: `enableStatusAction`,
  });

  return (
    <div>
      <span className='text-primary h4'>Action Point</span>
      <div className='form-switch mt-1'>
        {!getValues('customer') && (
          <UncontrolledTooltip placement='top' target={`action-points`}>
            Select Contact first
          </UncontrolledTooltip>
        )}

        <div>
          <Label className='d-block'>Enable Action Point?</Label>
          <div id='action-points' className='d-inline-block'>
            <FormField
              type='switch'
              name='enableStatusAction'
              defaultValue={
                getValues('enableStatusAction') !== undefined
                  ? getValues('enableStatusAction')
                  : false
              }
              key={getValues('enableStatusAction')}
              className='ms-1'
              control={control}
              disabled={!getValues('customer')}
            />
          </div>
        </div>
      </div>
      {enableStatusAction && (
        <Row className='mt-1'>
          {currentCustomer
            ? quoteStatusActions?.length > 0 &&
              quoteStatusActions?.map((_, idx) => {
                return (
                  <QuoteActionItem
                    key={idx}
                    watch={watch}
                    control={control}
                    getValues={getValues}
                    setValue={setValue}
                    quoteActionIdx={idx}
                    currentCustomer={currentCustomer}
                    initialQuoteActions={initialQuoteActions}
                  />
                );
              })
            : null}
        </Row>
      )}
    </div>
  );
};
