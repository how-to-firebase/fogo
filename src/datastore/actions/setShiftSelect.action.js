export function setShiftSelect({ shiftSelect, controlSelect }, value) {
  if (!!value) {
    controlSelect = false;
  }

  if (value != shiftSelect) {
    return { shiftSelect: !!value, controlSelect };
  }
}
