export const calculateInvoiceProductPriceTotal = (productDetails) => {
  if (productDetails.installmentChargesType === 'doller') {
    return (
      productDetails.price * productDetails.quantity +
      productDetails.installmentCharge
    );
  } else if (productDetails.installmentChargesType === 'percentage') {
    const installmentCharge =
      (productDetails.price *
        productDetails.quantity *
        productDetails.installmentCharge) /
      100;
    return productDetails.price * productDetails.quantity + installmentCharge;
  }
  return productDetails.price * productDetails.quantity;
};

export const calculateInvoiceGrandTotal = (allProductDetails) => {
  let grandTotal = 0;
  allProductDetails.forEach((obj) => {
    const productPrice = `${
      (Number(obj?.price) ? Number(obj?.price) : 0) *
      (Number(obj?.quantity) ? Number(obj?.quantity) : 0)
    }`;
    const totalChanges = `${
      Number(obj?.installmentCharge) &&
      Number(obj?.price) &&
      obj?.installmentChargesType
        ? obj?.installmentChargesType === 'percentage'
          ? Number?.(
              (Number(obj?.price) * Number(obj?.installmentCharge)) / 100
            )?.toFixed(2)
          : obj?.installmentChargesType === 'doller'
          ? Number(obj?.installmentCharge)?.toFixed(2)
          : 0
        : 0
    }`;
    const charges = `${
      obj?.chargesType && obj?.chargesType === 'percentage'
        ? Number(
            ((Number(productPrice) + Number(totalChanges)) *
              Number(obj?.charges)) /
              100
          ).toFixed(2)
        : obj?.chargesType === 'fixed'
        ? Number(obj?.charges).toFixed(2)
        : 0
    }`;

    grandTotal = Number(
      Number(grandTotal) +
        Number(productPrice) +
        Number(totalChanges) +
        Number(charges)
    ).toFixed(2);
  });
  return grandTotal;
};
