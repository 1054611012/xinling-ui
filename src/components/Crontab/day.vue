<template>
	<el-form size="small">
		<el-form-item>
			<el-radio v-model='radioValue' :label="1">
				日，允许的通配符[, - * ? / L W]
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="2">
				不指定
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="3">
				周期从
				<el-input-number v-model='cycle01' :min="1" :max="30" /> -
				<el-input-number v-model='cycle02' :min="cycle01 ? cycle01 + 1 : 2" :max="31" /> 日
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="4">
				从
				<el-input-number v-model='average01' :min="1" :max="30" /> 号开始，每
				<el-input-number v-model='average02' :min="1" :max="31 - average01 || 1" /> 日执行一次
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="5">
				每月
				<el-input-number v-model='workday' :min="1" :max="31" /> 号最近的那个工作日
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="6">
				本月最后一天
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="7">
				指定
				<el-select clearable v-model="checkboxList" placeholder="可多选" multiple style="width:100%">
					<el-option v-for="item in 31" :key="item" :value="item">{{item}}</el-option>
				</el-select>
			</el-radio>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps(['check', 'cron'])
const emit = defineEmits(['update'])

const radioValue = ref(1)
const workday = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const checkboxList = ref([])

const checkNum = (value, min, max) => {
  value = Math.floor(value)
  if (value < min) value = min
  if (value > max) value = max
  return value
}

const cycleTotal = computed(() => {
  const c01 = checkNum(cycle01.value, 1, 30)
  const c02 = checkNum(cycle02.value, c01 ? c01 + 1 : 2, 31)
  return c01 + '-' + c02
})

const averageTotal = computed(() => {
  const a01 = checkNum(average01.value, 1, 30)
  const a02 = checkNum(average02.value, 1, 31 - a01 || 0)
  return a01 + '/' + a02
})

const workdayCheck = computed(() => {
  return checkNum(workday.value, 1, 31)
})

const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str === '' ? '*' : str
})

function radioChange() {
  if (radioValue.value !== 2 && props.cron && props.cron.week !== '?') {
    emit('update', 'week', '?', 'day')
  }

  switch (radioValue.value) {
    case 1:
      emit('update', 'day', '*')
      break
    case 2:
      emit('update', 'day', '?')
      break
    case 3:
      emit('update', 'day', cycleTotal.value)
      break
    case 4:
      emit('update', 'day', averageTotal.value)
      break
    case 5:
      emit('update', 'day', workdayCheck.value + 'W')
      break
    case 6:
      emit('update', 'day', 'L')
      break
    case 7:
      emit('update', 'day', checkboxString.value)
      break
  }
}

function cycleChange() {
  if (radioValue.value === 3) {
    emit('update', 'day', cycleTotal.value)
  }
}

function averageChange() {
  if (radioValue.value === 4) {
    emit('update', 'day', averageTotal.value)
  }
}

function workdayChange() {
  if (radioValue.value === 5) {
    emit('update', 'day', workdayCheck.value + 'W')
  }
}

function checkboxChange() {
  if (radioValue.value === 7) {
    emit('update', 'day', checkboxString.value)
  }
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(workdayCheck, workdayChange)
watch(checkboxString, checkboxChange)

defineExpose({
  radioValue,
  workday,
  cycle01,
  cycle02,
  average01,
  average02,
  checkboxList
})
</script>
