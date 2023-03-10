/**
 * Checks whether at least one value is null or undefined
 * @param values Values to check
 * @returns True if any value is null or undefined otherwise false
 */
export function isNullOrUndefined(...values: unknown[]): boolean{
    return values.some(v => v === undefined || v === null);
}

/**
 * Converts a decimal number to hexadecimal
 * @param number Number to convert to hexadecimal
 * @returns string Number in Hexadecimal format in byte order
 */
export function convertNumberToHexReverse(value: number): string{
    const hexValue = value.toString(16);
    const paddedHexValue = hexValue.length % 2 ? '0' + hexValue : hexValue;
    // split the string into pairs of characters, and reverse the order
    const bytes = paddedHexValue.match(/.{2}/g)!.reverse();
    // join the pairs of characters back into a single string
    return bytes.join('');
}

/**
 * Converts a decimal number to
 * @param originalValue Number to convert to hexadecimal
 */
export function normalizeValue(originalValue: number, minValue: number, maxValue: number, newMin: number,
    newMax: number, step: number): number {
    const normalizedValue = (originalValue - minValue) * (newMax - newMin) / (maxValue - minValue) + newMin;
    return Math.round(normalizedValue/step) * step;
}