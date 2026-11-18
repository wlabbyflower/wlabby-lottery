import { describe, expect, it } from 'vitest'
import { createYearPattern, matchesYearPattern, normalizeYear, normalizeYearOptions } from '@/utils/pattern/year'

describe('editable year patterns', () => {
    it('accepts arbitrary four-digit years rather than a fixed preset list', () => {
        for (const year of ['1000', '1998', '2025', '2026', '2038', '2099', '9999']) {
            const cells = createYearPattern(year)
            expect(cells.length).toBeGreaterThan(0)
            expect(cells.every(cell => cell > 17 && cell <= 17 * 6)).toBe(true)
            expect(new Set(cells).size).toBe(cells.length)
            expect(matchesYearPattern(year, 17, cells)).toBe(true)
        }
        expect(createYearPattern('2025')).not.toEqual(createYearPattern('2026'))
    })
    it('validates input without interpreting exponents or fractional years', () => {
        for (const value of ['', '0000', '999', '10000', '20a6', '2e03', '2026.5', null]) {
            expect(normalizeYear(value)).toBeNull()
            expect(() => createYearPattern(value)).toThrow('invalid-year')
        }
        expect(normalizeYear(' 2030 ')).toBe('2030')
    })
    it('centers and bounds the pattern at different supported column counts', () => {
        for (const columns of [15, 17, 24, 100]) {
            const cells = createYearPattern('2030', columns)
            expect(cells.every(cell => cell >= 1 && cell <= columns * 7)).toBe(true)
            expect(matchesYearPattern('2030', columns, cells)).toBe(true)
        }
        expect(() => createYearPattern('2030', 14)).toThrow('insufficient-year-columns')
        expect(() => createYearPattern('2030', 17.5)).toThrow('insufficient-year-columns')
    })
    it('deduplicates saved years and recognises manual edits', () => {
        expect(normalizeYearOptions(['2030', '2025', '2030', 'bad', 2040])).toEqual(['2025', '2030', '2040'])
        const cells = createYearPattern('2030')
        expect(matchesYearPattern('2030', 17, cells.slice(1))).toBe(false)
    })
})
