export function setSelecting({ searching }, selecting) {
  return { selecting: !!selecting || searching };
}
