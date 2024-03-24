export const useInstallmentHelperFunc = ({
  getValues,
  nestIndex,
  installmentChargesType,
  installmentCharge,
  setValue,
}) => {
  const getCharges = () => {
    let charges = 0;
    if (
      installmentChargesType &&
      installmentChargesType !== '' &&
      installmentChargesType === 'percentage'
    ) {
      charges =
        Number?.(
          (Number(getValues?.(`productDetails[${nestIndex}].price`)) *
            Number(installmentCharge)) /
            100
        )?.toFixed(2) || 0;
    } else if (
      installmentChargesType &&
      installmentChargesType !== '' &&
      installmentChargesType === 'doller'
    ) {
      charges = Number(installmentCharge) || 0;
    }
    return Number(charges);
  };

  const handleChangePercentage = (value, index) => {
    const tempObj = JSON.parse(
      JSON.stringify(getValues(`productDetails[${nestIndex}].installments`))
    );
    const charges = getCharges() || 0;
    const totalPrice = Number(
      Number(getValues(`productDetails[${nestIndex}].price`)) + Number(charges)
    );
    const quantity = Number(
      Number(getValues(`productDetails[${nestIndex}].quantity`))
      //  + Number(charges)
    );
    const totalAmount =
      (totalPrice ? totalPrice : 0) * (quantity ? quantity : 0);

    let beforePercentageOfCIndex = 0;

    tempObj?.forEach((installment, tempIndex) => {
      if (tempIndex < index) {
        beforePercentageOfCIndex =
          beforePercentageOfCIndex +
          (Number(installment.percentage) ? Number(installment.percentage) : 0);
      }
    });

    const remainingPercentage = (
      100 -
      (beforePercentageOfCIndex + Number(value))
    )?.toFixed(2);

    const remainingPercentagePerInstallment =
      Number(remainingPercentage) / (tempObj.length - index - 1)?.toFixed(2);

    tempObj.forEach((currentValue, tempIndex) => {
      if (tempIndex === index) {
        setValue(
          `productDetails[${nestIndex}].installments[${tempIndex}].amount`,
          ((value * (totalAmount + Number(charges))) / 100).toFixed(2)
        );
        setValue(
          `productDetails[${nestIndex}].installments[${tempIndex}].percentage`,
          value
        );
      } else {
        if (index < tempIndex) {
          setValue(
            `productDetails[${nestIndex}].installments[${tempIndex}].amount`,
            (
              (remainingPercentagePerInstallment *
                (totalAmount + Number(charges))) /
              100
            )?.toFixed(2)
          );
          setValue(
            `productDetails[${nestIndex}].installments[${tempIndex}].percentage`,
            remainingPercentagePerInstallment.toFixed(2)
          );
        }
      }
    });
  };

  const handleChangeAmount = (value, index) => {
    const tempObj = JSON.parse(
      JSON.stringify(getValues(`productDetails[${nestIndex}].installments`))
    );
    const charges = getCharges() || 0;
    const totalPrice = Number(
      Number(getValues(`productDetails[${nestIndex}].price`)) + Number(charges)
    );
    const quantity = Number(
      Number(getValues(`productDetails[${nestIndex}].quantity`))
      //  + Number(charges)
    );
    const totalAmount =
      (totalPrice ? totalPrice : 0) * (quantity ? quantity : 0);

    let beforeAmountOfCIndex = 0;

    tempObj?.forEach((installment, tempIndex) => {
      if (tempIndex < index) {
        beforeAmountOfCIndex =
          beforeAmountOfCIndex +
          (Number(installment.amount) ? Number(installment.amount) : 0);
      }
    });

    const remainingPrice = (
      totalAmount -
      (beforeAmountOfCIndex + Number(value))
    ).toFixed(2);

    const remainingAmountPerInstallment = (
      remainingPrice /
      (tempObj.length - index - 1)
    )?.toFixed(2);

    tempObj.map((currentValue, tempIndex) => {
      if (tempIndex === index) {
        setValue(
          `productDetails[${nestIndex}].installments[${tempIndex}].amount`,
          value.toString()
        );
        setValue(
          `productDetails[${nestIndex}].installments[${tempIndex}].percentage`,
          ((value * 100) / totalAmount).toFixed(2)
        );
      } else {
        if (index < tempIndex) {
          setValue(
            `productDetails[${nestIndex}].installments[${tempIndex}].amount`,
            remainingAmountPerInstallment
          );
          setValue(
            `productDetails[${nestIndex}].installments[${tempIndex}].percentage`,
            ((remainingAmountPerInstallment * 100) / totalAmount)?.toFixed(2)
          );
        }
      }
    });
  };

  return { handleChangePercentage, handleChangeAmount, getCharges };
};
