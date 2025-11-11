/**
 * Format a rate/amount for display
 * Only shows decimals if the number isn't a whole number
 * @param rate - The number to format
 * @param includeSign - Whether to include + sign for positive numbers
 * @returns Formatted string
 */
export function formatRate(rate: number, includeSign = false): string {
  // Only show decimals if the number isn't a whole number
  const formatted = rate % 1 === 0 ? rate.toString() : rate.toFixed(1);
  if (includeSign && rate > 0) {
    return `+${formatted}`;
  }
  return formatted;
}
