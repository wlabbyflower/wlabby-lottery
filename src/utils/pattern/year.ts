/** Four 3×5 digits centered in the existing seven-row card grid. */
const DIGITS: Record<string, string[]> = {
    0: ['111', '101', '101', '101', '111'],
    1: ['010', '110', '010', '010', '111'],
    2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '111', '001', '111'],
    4: ['101', '101', '111', '001', '001'],
    5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'],
    7: ['111', '001', '001', '001', '001'],
    8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '111'],
}
export const MIN_YEAR_COLUMNS = 15
export function normalizeYear(value: unknown): string | null {
    const year = String(value ?? '').trim()
    return /^[1-9]\d{3}$/.test(year) ? year : null
}
export function normalizeYearOptions(value: unknown): string[] {
    if (!Array.isArray(value))
        return []
    return [...new Set(value.map(normalizeYear).filter((year): year is string => year !== null))].sort()
}
export function createYearPattern(value: unknown, columns = 17): number[] {
    const year = normalizeYear(value)
    if (!year)
        throw new Error('invalid-year')
    if (!Number.isInteger(columns) || columns < MIN_YEAR_COLUMNS || columns > 100)
        throw new Error('insufficient-year-columns')
    const left = Math.floor((columns - MIN_YEAR_COLUMNS) / 2)
    const cells: number[] = []
    for (let row = 0; row < 5; row++) {
        for (let digit = 0; digit < 4; digit++) {
            for (let col = 0; col < 3; col++) {
                if (DIGITS[year[digit]][row][col] === '1')
                    cells.push((row + 1) * columns + left + digit * 4 + col + 1)
            }
        }
    }
    return cells
}
export function matchesYearPattern(value: unknown, columns: number, pattern: number[]): boolean {
    if (!normalizeYear(value) || columns < MIN_YEAR_COLUMNS || columns > 100 || !Number.isInteger(columns))
        return false
    const expected = createYearPattern(value, columns)
    const actual = new Set(pattern)
    return pattern.length === expected.length && expected.every(cell => actual.has(cell))
}
