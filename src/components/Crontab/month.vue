<template>
	<el-form size='small'>
		<el-form-item>
			<el-radio v-model='radioValue' :label="1">
				月，允许的通配符[, - * /]
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="2">
				周期从
				<el-input-number v-model='cycle01' :min="1" :max="11" /> -
				<el-input-number v-model='cycle02' :min="cycle01 ? cycle01 + 1 : 2" :max="12" /> 月
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="3">
				从
				<el-input-number v-model='average01' :min="1" :max="11" /> 月开始，每
				<el-input-number v-model='average02' :min="1" :max="12 - average01 || 0" /> 月月执行一次
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="4">
				指定
				<el-select clearable v-model="checkboxList" placeholder="可多选" multiple style="width:100%">
					<el-option v-for="item in 12" :key="item" :value="item">{{item}}</el-option>
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
  const c01 = checkNum(cycle01.value, 1, 11)
  const c02 = checkNum(cycle02.value, c01 ? c01 + 1 : 2, 12)
  return c01 + '-' + c02
})

const averageTotal = computed(() => {
  const a01 = checkNum(average01.value, 1, 11)
  const a02 = checkNum(average02.value, 1, 12 - a01 || 0)
  return a01 + '/' + a02
})

const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str === '' ? '*' : str
})

function radioChange() {
  switch (radioValue.value) {
    case 1:
      emit('update', 'month', '*')
      break
    case 2:
      emit('update', 'month', cycleTotal.value)
      break
    case 3:
      emit('update', 'month', averageTotal.value)
      break
    case 4:
      emit('update', 'month', checkboxString.value)
      break
  }
}

function cycleChange() {
  if (radioValue.value === 2) {
    emit('update', 'month', cycleTotal.value)
  }
}

function averageChange() {
  if (radioValue.value === 3) {
    emit('update', 'month', averageTotal.value)
  }
}

function checkboxChange() {
  if (radioValue.value === 4) {
    emit('update', 'month', checkboxString.value)
  }
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)

defineExpose({
  radioValue,
  cycle01,
  cycle02,
  average01,
  average02,
  checkboxList
})
</script>
