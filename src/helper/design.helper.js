export function setFieldBorderRadius(radius) {
  document.documentElement.style.setProperty(
    '--formElementRadius',
    `${radius}px`
  );
}

export function setQuestionSpacing(spacing) {
  document.documentElement.style.setProperty(
    '--formElementSpacing',
    `${spacing}px`
  );
}
