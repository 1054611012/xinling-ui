<template>
	<el-form size="small">
		<el-form-item>
			<el-radio v-model='radioValue' :label="1">
				秒，允许的通配符[, - * /]
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="2">
				周期从
				<el-input-number v-model='cycle01' :min="0" :max="58" /> -
				<el-input-number v-model='cycle02' :min="cycle01 ? cycle01 + 1 : 1" :max="59" /> 秒
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="3">
				从
				<el-input-number v-model='average01' :min="0" :max="58" /> 秒开始，每
				<el-input-number v-model='average02' :min="1" :max="59 - average01 || 0" /> 秒执行一次
			</el-radio>
		</el-form-item>

		<el-form-item>
			<el-radio v-model='radioValue' :label="4">
				指定
				<el-select clearable v-model="checkboxList" placeholder="可多选" multiple style="width:100%">
					<el-option v-for="item in 60" :key="item" :value="item-1">{{item-1}}</el-option>
				</el-select>
			</el-radio>
		</el-form-item>
	</el-form>

</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps(['check', 'radioParent'])
const emit = defineEmits(['update'])

const radioValue = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])

const checkNum = (value, min, max) => {
  value = Math.floor(value)
  if (value < min) value = min
  if (value > max) value = max
  return value
}

const cycleTotal = computed(() => {
  const c01 = checkNum(cycle01.value, 0, 58)
  const c02 = checkNum(cycle02.value, c01 ? c01 + 1 : 1, 59)
  return c01 + '-' + c02
})

const averageTotal = computed(() => {
  const a01 = checkNum(average01.value, 0, 58)
  const a02 = checkNum(average02.value, 1, 59 - a01 || 0)
  return a01 + '/' + a02
})

const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str === '' ? '*' : str
})

function radioChange() {
  switch (radioValue.value) {
    case 1:
      emit('update', 'second', '*', 'second')
      break
    case 2:
      emit('update', 'second', cycleTotal.value)
      break
    case 3:
      emit('update', 'second', averageTotal.value)
      break
    case 4:
      emit('update', 'second', checkboxString.value)
      break
  }
}

function cycleChange() {
  if (radioValue.value === 2) {
    emit('update', 'second', cycleTotal.value)
  }
}

function averageChange() {
  if (radioValue.value === 3) {
    emit('update', 'second', averageTotal.value)
  }
}

function checkboxChange() {
  if (radioValue.value === 4) {
    emit('update', 'second', checkboxString.value)
  }
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)
watch(() => props.radioParent, (val) => {
  if (val !== undefined) {
    radioValue.value = val
  }
})

defineExpose({
  radioValue,
  cycle01,
  cycle02,
  average01,
  average02,
  checkboxList
})
</script>
