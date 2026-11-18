<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGlobalConfig } from '@/store/globalConfig'
import { MIN_YEAR_COLUMNS, normalizeYear } from '@/utils/pattern/year'
const { t } = useI18n()
const store = useGlobalConfig()
const { getYearOptions: years, getPatternYear: currentYear, getRowCount: columns } = storeToRefs(store)
const yearInput = ref(currentYear.value || String(new Date().getFullYear()))
const error = ref('')
function apply(value: string) {
    error.value = ''
    if (!normalizeYear(value)) {
        error.value = t('yearPattern.invalid')
        return
    }
    if (columns.value < MIN_YEAR_COLUMNS) {
        error.value = t('yearPattern.columns', { count: MIN_YEAR_COLUMNS })
        return
    }
    store.applyYearPattern(value)
    yearInput.value = normalizeYear(value)!
}
</script>

<template>
  <div class="space-y-3 mb-5" data-testid="year-pattern">
    <label for="year-pattern-input" class="label">{{ t('yearPattern.label') }}</label>
    <form class="flex flex-col gap-2" @submit.prevent="apply(yearInput)">
      <input id="year-pattern-input" v-model="yearInput" type="text" inputmode="numeric" maxlength="4" class="input input-bordered w-full" :placeholder="t('yearPattern.placeholder')" :aria-invalid="!!error" aria-describedby="year-pattern-help year-pattern-error">
      <button type="submit" class="btn btn-primary btn-sm">{{ t('yearPattern.apply') }}</button>
    </form>
    <p id="year-pattern-help" class="text-xs opacity-70">{{ t('yearPattern.help') }}</p>
    <p id="year-pattern-error" role="alert" class="text-error text-sm">{{ error }}</p>
    <p class="text-sm">{{ t('yearPattern.current') }}：{{ currentYear || t('yearPattern.custom') }}</p>
    <div v-if="years.length" class="flex flex-wrap gap-2" :aria-label="t('yearPattern.saved')">
      <div v-for="year in years" :key="year" class="join">
        <button type="button" class="join-item btn btn-sm" :class="{ 'btn-primary': currentYear === year }" :aria-pressed="currentYear === year" @click="apply(year)">{{ year }}</button>
        <button type="button" class="join-item btn btn-sm" :aria-label="t('yearPattern.remove', { year })" @click="store.removeYearOption(year)">×</button>
      </div>
    </div>
  </div>
</template>
