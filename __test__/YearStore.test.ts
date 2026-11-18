import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGlobalConfig } from '@/store/globalConfig'

describe('year settings compatibility', () => {
    beforeEach(() => setActivePinia(createPinia()))
    it('adds, applies and deduplicates years without changing other settings', () => {
        const store = useGlobalConfig()
        const title = store.getTopTitle
        store.applyYearPattern('2038')
        store.applyYearPattern('2038')
        expect(store.getPatternYear).toBe('2038')
        expect(store.getYearOptions.filter(year => year === '2038')).toHaveLength(1)
        expect(store.getTopTitle).toBe(title)
    })
    it('loads a legacy custom pattern without resetting it and can then add a year', () => {
        const store = useGlobalConfig()
        const legacy = JSON.parse(JSON.stringify(store.getGlobalConfig))
        delete legacy.yearOptions
        delete legacy.theme.patternYear
        legacy.theme.patternList = [2, 18, 40]
        store.setGlobalConfig(legacy)
        expect(store.getPatternList).toEqual([2, 18, 40])
        expect(store.getPatternYear).toBeNull()
        expect(store.getYearOptions).toEqual([])
        store.applyYearPattern('2099')
        expect(store.getPatternYear).toBe('2099')
    })
    it('preserves the drawing when removing a saved year or making a manual edit', () => {
        const store = useGlobalConfig()
        store.applyYearPattern('2030')
        const pattern = [...store.getPatternList]
        store.removeYearOption('2030')
        expect(store.getPatternList).toEqual(pattern)
        expect(store.getYearOptions).not.toContain('2030')
        expect(store.getPatternYear).toBeNull()
        store.applyYearPattern('2030')
        store.getPatternList.splice(0, 1)
        expect(store.getPatternYear).toBeNull()
    })
    it('rejects an undersized grid without mutating the saved configuration', () => {
        const store = useGlobalConfig()
        store.setRowCount(10)
        const before = JSON.stringify(store.getGlobalConfig)
        expect(() => store.applyYearPattern('2030')).toThrow('insufficient-year-columns')
        expect(JSON.stringify(store.getGlobalConfig)).toBe(before)
    })
})
