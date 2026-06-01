<script setup>
import { ref } from "vue"
import Input from "../src/components/Input.vue"
import Textarea from "../src/components/Textarea.vue"
import Select from "../src/components/Select.vue"
import Checkbox from "../src/components/Checkbox.vue"
import Switch from "../src/components/Switch.vue"
import RadioGroup from "../src/components/RadioGroup.vue"
import Field from "../src/components/Field.vue"
import Button from "../src/components/Button.vue"

const name = ref("")
const email = ref("")
const bio = ref("")
const role = ref("admin")
const subscribed = ref(true)
const notif = ref(false)
const plan = ref("pro")
const roles = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
]
const plans = ["free", "pro", "enterprise"]
const billing = ref("annual")
const billingOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual - save 20%" },
  { value: "lifetime", label: "Lifetime" },
]
const tier = ref("pro")
const tierOptions = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
]
</script>

<template>
  <Story title="Forms">
    <Variant title="Inputs and labels">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 720px;">
        <Field label="Name" required>
          <Input v-model="name" placeholder="Jane Cooper" />
        </Field>
        <Field label="Email" hint="We never share it." required>
          <Input v-model="email" type="email" placeholder="jane@example.com" />
        </Field>
        <Field label="Bio" style="grid-column: span 2;">
          <Textarea v-model="bio" placeholder="A short description..." :rows="4" />
        </Field>
        <Field label="Role">
          <Select v-model="role" :options="roles" />
        </Field>
        <Field label="Plan">
          <Select v-model="plan" :options="plans" />
        </Field>
      </div>
    </Variant>
    <Variant title="Toggles">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <Checkbox v-model="subscribed" label="Subscribe to weekly updates" />
        <Checkbox :modelValue="true" label="Always required" disabled />
        <Switch v-model="notif" label="Push notifications" />
      </div>
    </Variant>
    <Variant title="Radio group">
      <div style="display: flex; flex-direction: column; gap: 28px; max-width: 480px;">
        <Field label="Billing cycle">
          <RadioGroup v-model="billing" :options="billingOptions" />
        </Field>
        <Field label="Plan tier" hint="Switch any time, prorated to the next cycle.">
          <RadioGroup v-model="tier" :options="tierOptions" direction="horizontal" />
        </Field>
      </div>
    </Variant>
    <Variant title="Validation">
      <Field label="API key" error="Must be a valid hex string" required>
        <Input :modelValue="'xyz'" invalid />
      </Field>
    </Variant>
    <Variant title="Submit row">
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Save changes</Button>
      </div>
    </Variant>
  </Story>
</template>
