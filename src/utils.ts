/**
 * Checks whether value is null or undefined
 * @param value Value to check
 * @returns True if value is null or undefined otherwise false
 */
export function isNullOrUndefined(value: any): boolean{
    return value === undefined || value === null;
}

/**
 * Converts a decimal number to hexadecimal
 * @param number Number to convert to hexadecimal
 */
export function convertNumberToHex(value: number): string{
    const hexValue = value.toString(16);

    return hexValue.length % 2 ? '0' + hexValue : hexValue;
}