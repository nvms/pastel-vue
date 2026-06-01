<script setup>
import { ref, watch } from "vue"
import Button from "./Button.vue"
import EvalAssertion from "./EvalAssertion.vue"
import { DEFAULT_MODEL_PRICING } from "../pricing.js"

const props = defineProps({
  // an array of assertion objects
  modelValue: { type: Array, default: () => [] },
  models: { type: Array, default: () => DEFAULT_MODEL_PRICING },
})
const emit = defineEmits(["update:modelValue"])

let uid = 0
const ids = ref(props.modelValue.map(() => ++uid))

// reconcile if a caller replaces modelValue with a different-length array
watch(
  () => props.modelValue.length,
  (n) => {
    while (ids.value.length < n) ids.value.push(++uid)
    while (ids.value.length > n) ids.value.pop()
  },
)

const updateAt = (i, val) => {
  const next = props.modelValue.slice()
  next[i] = val
  emit("update:modelValue", next)
}
const removeAt = (i) => {
  ids.value.splice(i, 1)
  emit("update:modelValue", props.modelValue.filter((_, idx) => idx !== i))
}
const add = () => {
  ids.value.push(++uid)
  emit("update:modelValue", [...props.modelValue, { type: "equals", expected: "" }])
}
</script>

<template>
  <div class="pc-assertions">
    <TransitionGroup name="pc-asn" tag="div" class="pc-assertions__list">
      <EvalAssertion
        v-for="(a, i) in modelValue"
        :key="ids[i]"
        :model-value="a"
        :models="models"
        :style="{ '--row-delay': `${Math.min(i, 8) * 35}ms` }"
        @update:model-value="(v) => updateAt(i, v)"
        @remove="removeAt(i)"
      />
    </TransitionGroup>
    <Button variant="outline" size="sm" icon="lucide:plus" @click="add">Add check</Button>
  </div>
</template>

<style scoped>
.pc-assertions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}
.pc-assertions__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
.pc-assertions__list:empty { display: none; }

.pc-asn-enter-active {
  transition:
    opacity 320ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 320ms cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--row-delay, 0ms);
}
.pc-asn-leave-active {
  transition:
    opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}
.pc-asn-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.pc-asn-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
.pc-asn-move {
  transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .pc-asn-enter-active,
  .pc-asn-leave-active,
  .pc-asn-move { transition: none; }
}
</style>
