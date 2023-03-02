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
 */
export function convertNumberToHex(value: number): string{
    const hexValue = value.toString(16);

    return hexValue.length % 2 ? '0' + hexValue : hexValue;
}