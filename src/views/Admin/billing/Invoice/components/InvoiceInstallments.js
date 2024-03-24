// ==================== Packages =======================
import { useFieldArray, useWatch } from 'react-hook-form';
import { Col, Label, Row, UncontrolledTooltip } from 'reactstrap';
import { Info } from 'react-feather';

// ** Custom Components
import { FormField } from '@components/form-fields';
import { useEffect } from 'react';
import CustomDatePicker from '../../../../../@core/components/form-fields/CustomDatePicker';
import { useInstallmentHelperFunc } from '../hooks/useInvoiceHelper';

const InvoiceInstallments = ({
  nestIndex,
  control,
  setValue,
  errors,
  getValues,
  installmentCount,
  installmentCharge,
  installmentChargesType,
  disabled,
  clearErrors,
  productPrice,
  productQuantity,
  productCharges,
}) => {
  // ========================== Hooks =================================
  const { fields, replace } = useFieldArray({
    control,
    shouldUnregister: true,
    name: `productDetails[${nestIndex}].installments`,
  });
  // ========================== Custom Hooks ==========================
  const { getCharges, handleChangeAmount, handleChangePercentage } =
    useInstallmentHelperFunc({
      getValues,
      nestIndex,
      installmentChargesType,
      installmentCharge,
      setValue,
    });

  const dueDate = useWatch({
    control,
    name: `dueDate`,
  });

  // add initial default value for installments
  useEffect(() => {
    if (+installmentCount || +installmentCharge) {
      const totalAmount =
        productPrice * (productQuantity ? productQuantity : 0);
      const charges = getCharges() || 0;
      const totalInstallments = Number(
        getValues(`productDetails[${nestIndex}].totalInstallments`)
      );
      const amount = (
        (totalAmount + Number(charges)) /
        totalInstallments
      )?.toFixed(2);

      const oldInstallMentsCount =
        getValues(`productDetails[${nestIndex}].installments`)?.length || 0;

      if (oldInstallMentsCount !== totalInstallments) {
        const temp = Array?.(+installmentCount)?.fill({
          percentage: (100 / totalInstallments)?.toFixed(2),
          amount: Number(amount) ? amount : undefined,
          dueDate: undefined,
        });
        replace(temp);
      }
    } else {
      replace([]);
    }
  }, [installmentCount]);

  useEffect(() => {
    const charges = getCharges() || 0;
    const totalAmount =
      productPrice * (productQuantity ? productQuantity : 0) +
      Number(charges) +
      Number(productCharges);
    const tempObj = JSON.parse(
      JSON.stringify(getValues(`productDetails[${nestIndex}].installments`))
    );

    tempObj.forEach((obj) => {
      obj.amount = ((obj.percentage * totalAmount) / 100)?.toFixed(2);
    });
    replace(tempObj);
  }, [
    installmentCharge,
    installmentChargesType,
    productPrice,
    productQuantity,
    productCharges,
  ]);

  return (
    <>
      {fields &&
        fields.length > 0 &&
        fields.map((item, installIndex) => {
          return (
            <Row key={item.id}>
              <Col sm='1' md='1' xl='1'>
                <Label for='note' className='form-label fw-bold mt-3 ms-2'>
                  {installIndex + 1}
                </Label>
              </Col>
              <Col sm='11' md='11' xl='11'>
                <Row className='d-flex'>
                  <Col sm='6' md='4' xl='4'>
                    <div className='item-name mt-1 ms-1'>
                      <Label for='note' className='form-label fw-bold'>
                        Percentage
                      </Label>
                      <FormField
                        name={`productDetails[${nestIndex}].installments[${installIndex}].percentage`}
                        key={`productDetails[${nestIndex}].installments[${installIndex}].percentage`}
                        type='number'
                        errors={errors}
                        control={control}
                        defaultValue={
                          getValues(
                            `productDetails[${nestIndex}].installments[${installIndex}].percentage`
                          ) || 0
                        }
                        onChange={(e) => {
                          const installments = getValues(
                            `productDetails[${nestIndex}].installments`
                          );
                          let beforePercentageOfCIndex = 0;
                          installments.forEach((installment, index) => {
                            if (index < installIndex) {
                              beforePercentageOfCIndex =
                                beforePercentageOfCIndex +
                                (Number(installment.percentage)
                                  ? Number(installment.percentage)
                                  : 0);
                            }
                          });
                          if (
                            100 - beforePercentageOfCIndex <
                            Number(e.target.value)
                          ) {
                            if (100 - beforePercentageOfCIndex > 0) {
                              handleChangePercentage(
                                (100 - beforePercentageOfCIndex).toString(),
                                installIndex
                              );
                            } else {
                              setValue(
                                `productDetails[${nestIndex}].installments[${installIndex}].percentage`,
                                '0'
                              );
                            }
                          } else if (
                            Number?.(
                              getValues(
                                `productDetails[${nestIndex}].installments[${installIndex}].percentage`
                              )
                            ) >= 100
                          ) {
                            setValue(
                              `productDetails[${nestIndex}].installments[${installIndex}].percentage`,
                              '100'
                            );
                            handleChangePercentage('100', installIndex);
                          } else if (
                            Number?.(
                              getValues(
                                `productDetails[${nestIndex}].installments[${installIndex}].percentage`
                              ) < 0
                            )
                          ) {
                            setValue(
                              `productDetails[${nestIndex}].installments[${installIndex}].percentage`,
                              '0'
                            );
                            handleChangePercentage('0', installIndex);
                          } else {
                            handleChangePercentage(
                              e.target.value,
                              installIndex
                            );
                          }
                        }}
                        disabled={disabled}
                      />
                      {errors?.['productDetails']?.[nestIndex]?.installments?.[
                        installIndex
                      ]?.percentage?.message ? (
                        <div className='text-danger'>
                          {
                            errors?.['productDetails']?.[nestIndex]
                              ?.installments?.[installIndex]?.percentage
                              ?.message
                          }
                        </div>
                      ) : null}
                    </div>
                  </Col>
                  <Col sm='6' md='4' xl='4'>
                    <div className='item-name mt-1 ms-1'>
                      <Label for='note' className='form-label fw-bold'>
                        Amount
                      </Label>
                      <FormField
                        name={`productDetails[${nestIndex}].installments[${installIndex}].amount`}
                        key={`productDetails[${nestIndex}].installments[${installIndex}].amount`}
                        type='number'
                        errors={errors}
                        control={control}
                        defaultValue={
                          getValues(
                            `productDetails[${nestIndex}].installments[${installIndex}].amount`
                          ) || 0
                        }
                        onBlur={(e) => {
                          handleChangeAmount(
                            Number(e.target.value).toFixed(2).toString(),
                            installIndex
                          );
                        }}
                        onChange={(e) => {
                          const charges = getCharges() || 0;
                          const productPrice = Number(
                            getValues(`productDetails[${nestIndex}].price`)
                          );
                          const quantity = Number(
                            getValues(`productDetails[${nestIndex}].quantity`)
                          );
                          const totalAmount =
                            (quantity ? quantity : 0) *
                              (productPrice ? productPrice : 0) +
                            (Number(charges) ? Number(charges) : 0);
                          const installments = getValues(
                            `productDetails[${nestIndex}].installments`
                          );
                          let beforeAmountOfCIndex = 0;
                          installments.forEach((installment, index) => {
                            if (index < installIndex) {
                              beforeAmountOfCIndex =
                                beforeAmountOfCIndex +
                                (Number(installment.amount)
                                  ? Number(installment.amount)
                                  : 0);
                            }
                          });
                          if (
                            totalAmount - beforeAmountOfCIndex <
                            Number(e.target.value)
                          ) {
                            if (totalAmount - beforeAmountOfCIndex > 0) {
                              handleChangeAmount(
                                (totalAmount - beforeAmountOfCIndex).toString(),
                                installIndex
                              );
                            } else {
                              setValue(
                                `productDetails[${nestIndex}].installments[${installIndex}].amount`,
                                '0'
                              );
                            }
                          } else if (Number?.(e.target.value) >= totalAmount) {
                            setValue(
                              `productDetails[${nestIndex}].installments[${installIndex}].amount`,
                              totalAmount.toString()
                            );
                            if (totalAmount) {
                              handleChangeAmount(totalAmount, installIndex);
                            }
                          } else if (
                            Number?.(
                              getValues(
                                `productDetails[${nestIndex}].installments[${installIndex}].amount`
                              ) < 0
                            )
                          ) {
                            setValue(
                              `productDetails[${nestIndex}].installments[${installIndex}].amount`,
                              '0'
                            );
                            if (totalAmount) {
                              handleChangeAmount('0', installIndex);
                            }
                          } else {
                            handleChangeAmount(e.target.value, installIndex);
                          }
                        }}
                        disabled={disabled}
                      />
                      {errors['productDetails']?.[nestIndex]?.installments?.[
                        installIndex
                      ]?.amount?.message ? (
                        <div className='text-danger'>
                          {
                            errors['productDetails']?.[nestIndex]
                              ?.installments?.[installIndex]?.amount?.message
                          }
                        </div>
                      ) : null}
                    </div>
                  </Col>
                  <Col sm='6' md='4' xl='4'>
                    <div className='item-name mt-1 ms-1'>
                      <UncontrolledTooltip
                        placement='top'
                        target={`dueDate-${installIndex}`}
                      >
                        Due Date should be less than invoice expiry date.
                      </UncontrolledTooltip>
                      <Label for='note' className='form-label fw-bold'>
                        Due Date
                      </Label>
                      <Info
                        id={`dueDate-${installIndex}`}
                        className='ms-1'
                        height={15}
                        width={15}
                      />
                      <CustomDatePicker
                        options={{
                          minDate: 'today',
                          static: false,
                          maxDate: dueDate ? new Date(dueDate) : null,
                        }}
                        errors={errors}
                        name={`productDetails[${nestIndex}].installments[${installIndex}].dueDate`}
                        key={`productDetails[${nestIndex}].installments[${installIndex}].dueDate-${dueDate}`}
                        value={getValues(
                          `productDetails[${nestIndex}].installments[${installIndex}].dueDate`
                        )}
                        onChange={(date) => {
                          if (new Date(date[0]) >= new Date()) {
                            setValue(
                              `productDetails[${nestIndex}].installments[${installIndex}].dueDate`,
                              date[0]
                            );
                            if (date[0]) {
                              clearErrors(
                                `productDetails[${nestIndex}].installments[${installIndex}].dueDate`
                              );
                            }
                          } else {
                            setValue(
                              `productDetails[${nestIndex}].installments[${installIndex}].dueDate`,
                              new Date()
                            );
                          }
                        }}
                        enableTime={false}
                        dateFormat={'Y-m-d'}
                        disabled={disabled}
                      />
                      {errors?.['productDetails']?.[nestIndex]?.installments?.[
                        installIndex
                      ]?.dueDate?.message ? (
                        <div className='text-danger'>
                          {
                            errors?.['productDetails']?.[nestIndex]
                              ?.installments?.[installIndex]?.dueDate?.message
                          }
                        </div>
                      ) : null}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          );
        })}
    </>
  );
};

export default InvoiceInstallments;
