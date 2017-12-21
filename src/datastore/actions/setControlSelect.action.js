export function setControlSelect({ controlSelect, shiftSelect }, value) {
  if (!!value) {
    shiftSelect = false;
  }

  if (value != controlSelect) {
    return { controlSelect: !!value, shiftSelect };
  }
}
