/**
 * Checks whether value is null or undefined
 * @param value Value to check
 * @returns True if value is null or undefined otherwise false
 */
export function isNullOrUndefined(value: any): boolean{
    return value === undefined || value === null;
}