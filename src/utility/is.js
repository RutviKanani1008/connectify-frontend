export const isDate = (date) => {
  if (date) {
    if (!isNaN(new Date(date).getTime())) {
      return true;
    }
  }
  return false;
};
