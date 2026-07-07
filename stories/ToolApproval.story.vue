<script setup>
import { ref } from "vue"
import ToolApproval from "../src/components/ToolApproval.vue"
import ToolCall from "../src/components/ToolCall.vue"
import Button from "../src/components/Button.vue"

const publish = ref("pending")
const discard = ref("pending")
const discardReason = ref(null)
const onDiscardReject = (reason) => {
  discard.value = "rejected"
  discardReason.value = reason
}
const reset = () => {
  publish.value = "pending"
  discard.value = "pending"
  discardReason.value = null
}

// simulated prsm/ai wiring: an approval request arrives, the user decides,
// and the decision would be sent back with resolveApproval({ id, approved, reason })
const flow = ref([])
let step = 0
const runFlow = () => {
  flow.value = []
  step = 0
  flow.value.push({
    kind: "approval",
    id: "approval_1730000000000_ab12cd3",
    name: "oven.set_temperature",
    input: { station: "pastry", celsius: 230, mode: "convection" },
    description: "Wants to preheat the pastry oven to 230C in convection mode.",
    decision: "pending",
  })
}
const decideFlow = (item, approved) => {
  item.decision = approved ? "approved" : "rejected"
  if (approved && step === 0) {
    step = 1
    setTimeout(() => {
      flow.value.push({
        kind: "call",
        name: "oven.set_temperature",
        status: "success",
        input: { station: "pastry", celsius: 230, mode: "convection" },
        output: { station: "pastry", reached_in_s: 312 },
        durationMs: 640,
      })
    }, 500)
  }
}
</script>

<template>
  <Story title="ToolApproval">
    <Variant title="Pending">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px;">
        <ToolApproval
          name="menu.publish_recipe"
          :input="{ recipe_id: 'braised_short_rib_v3', venue: 'Cherry Creek' }"
          description="Wants to publish this recipe to the live menu at Cherry Creek."
          :decision="publish"
          @approve="publish = 'approved'"
          @reject="publish = 'rejected'"
        />
        <Button variant="subtle" size="sm" style="align-self: flex-start;" @click="reset">Reset</Button>
      </div>
    </Variant>

    <Variant title="Reject with reason">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px;">
        <ToolApproval
          name="pantry.discard_expired"
          :input="{ station: 'walk-in', older_than_days: 4 }"
          description="Wants to discard every walk-in item older than four days."
          :decision="discard"
          with-reason
          @approve="discard = 'approved'"
          @reject="onDiscardReject"
        />
        <p v-if="discardReason" style="font-size: 13px; color: var(--ink-60);">
          Reject reason sent to resolveApproval: "{{ discardReason }}"
        </p>
        <Button variant="subtle" size="sm" style="align-self: flex-start;" @click="reset">Reset</Button>
      </div>
    </Variant>

    <Variant title="Resolved states">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px;">
        <ToolApproval
          name="menu.publish_recipe"
          :input="{ recipe_id: 'braised_short_rib_v3' }"
          decision="approved"
          :animate-in="false"
        />
        <ToolApproval
          name="pantry.discard_expired"
          :input="{ station: 'walk-in', older_than_days: 4 }"
          decision="rejected"
          :animate-in="false"
        />
      </div>
    </Variant>

    <Variant title="Approval flow (simulated)">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px;">
        <Button variant="primary" style="align-self: flex-start;" @click="runFlow">Ask the agent to preheat</Button>
        <template v-for="(item, i) in flow" :key="i">
          <ToolApproval
            v-if="item.kind === 'approval'"
            :name="item.name"
            :input="item.input"
            :description="item.description"
            :decision="item.decision"
            @approve="decideFlow(item, true)"
            @reject="decideFlow(item, false)"
          />
          <ToolCall
            v-else
            :name="item.name"
            :status="item.status"
            :input="item.input"
            :output="item.output"
            :duration-ms="item.durationMs"
          />
        </template>
      </div>
    </Variant>
  </Story>
</template>
