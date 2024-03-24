export const required = (name) => {
  return `${name} is required`;
};

export const minimum = (name, min = 6) => {
  return `${name} must be at least ${min} characters`;
};

export const email = (name) => {
  return `${name} is not valid`;
};
