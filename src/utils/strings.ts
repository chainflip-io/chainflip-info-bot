export const abbreviate = (
  text: string | undefined | null,
  showLength = 4,
  space = false,
): string => {
  if (typeof text !== 'string' || text.length === 0) return '';
  const leftPart = text.slice(0, showLength);
  const rightPart = text.slice(text.length - showLength);

  return [leftPart, rightPart].join(space ? '. . .' : '…');
};
