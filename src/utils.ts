import { ColorConverter } from 'color-convert';

/**
 * Checks whether at least one value is null or undefined
 * @param values Values to check
 * @returns True if any value is null or undefined otherwise false
 */
export function isNullOrUndefined(...values: unknown[]): boolean{
    return values.some(v => v === undefined || v === null);
}

export function reverseBytes(value: string): string{
    const bytes = value.match(/.{2}/g)!.reverse();
    // join the pairs of characters back into a single string
    return bytes.join('');
}

/**
 * Converts a decimal number to hexadecimal
 * @param number Number to convert to hexadecimal
 * @returns string Number in Hexadecimal format in byte order
 */
export function convertNumberToHex(value: number): string{
    const hexValue = value.toString(16);
    return hexValue.length % 2 ? '0' + hexValue : hexValue;
}

/**
 * Converts a decimal number to hexadecimal
 * @param number Number to convert to hexadecimal
 * @returns string Number in Hexadecimal format in byte order
 */
export function convertNumberToHexReverse(value: number): string{
    const hexValue = value.toString(16);
    const paddedHexValue = hexValue.length % 2 ? '0' + hexValue : hexValue;
    return reverseBytes(paddedHexValue);
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

export function hexToRgb(hex: string): [number, number, number] {
    // Convert the hex string to a 6-digit integer
    const hexInt = parseInt(hex, 16);

    // Extract the red, green, and blue components using bit shifting and masking
    const r = (hexInt >> 16) & 0xFF;
    const g = (hexInt >> 8) & 0xFF;
    const b = hexInt & 0xFF;

    // Return the RGB components as an array of numbers
    return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
    const hexR = r.toString(16).padStart(2, '0').toUpperCase();
    const hexG = g.toString(16).padStart(2, '0').toUpperCase();
    const hexB = b.toString(16).padStart(2, '0').toUpperCase();
    return hexR + hexG + hexB;
}

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    h /= 60;
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs((h % 2) - 1));
    const m = v - c;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 1) {
        r = c;
        g = x;
    } else if (h >= 1 && h < 2) {
        r = x;
        g = c;
    } else if (h >= 2 && h < 3) {
        g = c;
        b = x;
    } else if (h >= 3 && h < 4) {
        g = x;
        b = c;
    } else if (h >= 4 && h < 5) {
        r = x;
        b = c;
    } else if (h >= 5 && h < 6) {
        r = c;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    const v = max;

    if (diff > 0) {
        s = (diff / max) * 100;

        if (max === r) {
            h = (60 * ((g - b) / diff) + 360) % 360;
        } else if (max === g) {
            h = (60 * ((b - r) / diff) + 120) % 360;
        } else if (max === b) {
            h = (60 * ((r - g) / diff) + 240) % 360;
        }
    }

    return [h, s, v * 100];
}

export function rgbToMired(rgb: [number, number, number]): number {
    // Convert RGB color to CIE 1931 XYZ color space
    const xyz = ColorConverter.rgb.xyz(rgb);

    // Convert CIE 1931 XYZ color to CIE 1931 (x, y) chromaticity coordinates
    const [x, y] = ColorConverter.xyz.xy(xyz);

    // Convert (x, y) chromaticity coordinates to Mired
    const colorTemperature = 1 / ((0.23881 * x) + (0.25499 * y) - 0.58291);
    const mired = Math.round(1000000 / colorTemperature);

    return mired;
}

export function kelvinToRgb(kelvin: number): [number, number, number] {
    const temperature = kelvin / 100;

    let red, green, blue;

    if (temperature <= 66) {
        red = 255;
        green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
        blue = temperature <= 19 ? 0 : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
    } else {
        red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
        green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
        blue = 255;
    }

    return [clamp(red, 0, 255), clamp(green, 0, 255), clamp(blue, 0, 255)];
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
