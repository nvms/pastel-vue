<script setup>
import { ref } from "vue"
import PastelBg from "../src/components/PastelBg.vue"
import Card from "../src/components/Card.vue"
import Display from "../src/components/Display.vue"
import MonoLabel from "../src/components/MonoLabel.vue"
import Field from "../src/components/Field.vue"
import Input from "../src/components/Input.vue"
import Checkbox from "../src/components/Checkbox.vue"
import Button from "../src/components/Button.vue"
import ArrowLink from "../src/components/ArrowLink.vue"
import Divider from "../src/components/Divider.vue"
import PinInput from "../src/components/PinInput.vue"
import Callout from "../src/components/Callout.vue"

const split = ref({ step: "credentials", email: "demo@pastel.dev", password: "hunter2hunter2", remember: true, pin: "" })
const centered = ref({ step: "credentials", email: "", password: "", remember: false, pin: "" })
const compact = ref({ step: "credentials", email: "", password: "", remember: false, pin: "" })

const reset = (s) => { s.step = "credentials"; s.pin = "" }
</script>

<template>
  <Story title="Login" :layout="{ type: 'single', iframe: true }">

    <!-- 1. Editorial split — pastel illustration on the left, form on the right -->
    <Variant title="Editorial split">
      <div class="login-split">
        <PastelBg variant="default" class="login-split__art">
          <div class="login-split__art-inner">
            <MonoLabel size="sm">Pastel · sign in</MonoLabel>
            <Display size="xl" as="h1" style="margin-top: 24px; max-width: 9ch;">
              A calmer<br/>console.
            </Display>
            <p style="margin-top: 20px; max-width: 36ch; color: var(--ink-60); font-size: 15px; line-height: 1.5;">
              Operate, configure, and verify your evaluation pipelines from one airy place.
            </p>
            <div style="margin-top: auto; display: flex; align-items: center; gap: 8px;">
              <MonoLabel size="xs">v1.4 · Pastel</MonoLabel>
            </div>
          </div>
        </PastelBg>

        <div class="login-split__form">
          <div class="login-split__form-inner">
            <Transition name="login-swap" mode="out-in">
              <div v-if="split.step === 'credentials'" key="creds" class="login-stack">
                <header style="display: flex; flex-direction: column; gap: 6px;">
                  <MonoLabel size="sm">Step 1 of 2</MonoLabel>
                  <h2 style="margin: 0; font-size: 28px; letter-spacing: -0.42px; font-weight: 500;">Sign in to Pastel</h2>
                  <p style="margin: 0; color: var(--ink-60);">Use your work email to continue.</p>
                </header>

                <Field label="Work email">
                  <Input v-model="split.email" type="email" placeholder="you@company.com" />
                </Field>

                <Field label="Password">
                  <Input v-model="split.password" type="password" placeholder="••••••••" />
                </Field>

                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <Checkbox v-model="split.remember" label="Remember this device" />
                  <ArrowLink href="#" size="sm">Forgot password</ArrowLink>
                </div>

                <Button variant="primary" @click="split.step = 'verify'">Continue</Button>

                <div style="display: flex; align-items: center; gap: 12px;">
                  <Divider />
                  <MonoLabel size="xs">or</MonoLabel>
                  <Divider />
                </div>

                <Button variant="outline" icon="lucide:key-round">Continue with SSO</Button>
              </div>

              <div v-else key="verify" class="login-stack">
                <header style="display: flex; flex-direction: column; gap: 6px;">
                  <MonoLabel size="sm">Step 2 of 2</MonoLabel>
                  <h2 style="margin: 0; font-size: 28px; letter-spacing: -0.42px; font-weight: 500;">Enter your code</h2>
                  <p style="margin: 0; color: var(--ink-60);">
                    Open your authenticator app and enter the 6-digit code for <strong style="color: var(--ink); font-weight: 500;">{{ split.email || "your account" }}</strong>.
                  </p>
                </header>

                <div style="display: flex; justify-content: center; padding: 8px 0 4px;">
                  <PinInput v-model="split.pin" :length="6" size="lg" autofocus />
                </div>

                <Callout variant="info" title="Lost your device?">
                  Use a one-time recovery code or ask an admin to reset your second factor.
                </Callout>

                <div style="display: flex; gap: 10px; margin-top: 4px;">
                  <Button variant="ghost" @click="reset(split)">Back</Button>
                  <Button variant="primary" :disabled="split.pin.length < 6" style="flex: 1;">Verify</Button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Variant>

    <!-- 2. Centered card on a soft pastel ground -->
    <Variant title="Centered on pastel">
      <PastelBg variant="soft" class="login-pastel">
        <div class="login-centered">
          <MonoLabel size="sm" style="display: block; text-align: center; color: var(--ink-60);">Pastel</MonoLabel>

          <Card padded elevated radius="comfy" class="login-centered__card">
            <Transition name="login-swap" mode="out-in">
              <div v-if="centered.step === 'credentials'" key="creds" class="login-stack">
                <h2 style="margin: 0; font-size: 24px; letter-spacing: -0.36px; font-weight: 500; text-align: center;">Welcome back</h2>
                <p style="margin: -4px 0 4px; color: var(--ink-60); text-align: center; font-size: 14px;">Sign in to continue to your workspace.</p>

                <Field label="Email">
                  <Input v-model="centered.email" type="email" placeholder="you@company.com" />
                </Field>
                <Field label="Password">
                  <Input v-model="centered.password" type="password" placeholder="••••••••" />
                </Field>

                <Button variant="primary" @click="centered.step = 'verify'">Sign in</Button>

                <p style="margin: 0; text-align: center; color: var(--ink-60); font-size: 13px;">
                  No account? <ArrowLink href="#" size="sm">Request access</ArrowLink>
                </p>
              </div>

              <div v-else key="verify" class="login-stack">
                <h2 style="margin: 0; font-size: 24px; letter-spacing: -0.36px; font-weight: 500; text-align: center;">Two-factor verification</h2>
                <p style="margin: -4px 0 8px; color: var(--ink-60); text-align: center; font-size: 14px;">
                  Enter the 6-digit code from your authenticator app.
                </p>

                <div style="display: flex; justify-content: center;">
                  <PinInput v-model="centered.pin" :length="6" size="md" autofocus />
                </div>

                <Button variant="primary" :disabled="centered.pin.length < 6">Verify and sign in</Button>

                <p style="margin: 0; text-align: center; font-size: 13px;">
                  <ArrowLink href="#" size="sm" @click="reset(centered)">Use a different account</ArrowLink>
                </p>
              </div>
            </Transition>
          </Card>

          <p style="margin: 16px 0 0; text-align: center; color: var(--ink-60); font-size: 12px;">
            Protected by Pastel · <a href="#" style="color: var(--ink-60);">Terms</a> · <a href="#" style="color: var(--ink-60);">Privacy</a>
          </p>
        </div>
      </PastelBg>
    </Variant>

    <!-- 3. Compact / minimal — single column, no chrome -->
    <Variant title="Compact minimal">
      <div class="login-compact">
        <div class="login-compact__inner">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="login-compact__mark" />
            <MonoLabel size="sm">Pastel</MonoLabel>
          </div>

          <Transition name="login-swap" mode="out-in">
            <div v-if="compact.step === 'credentials'" key="creds" class="login-stack" style="margin-top: 36px;">
              <h2 style="margin: 0; font-size: 32px; letter-spacing: -0.6px; font-weight: 500; line-height: 1.1;">
                Sign in
              </h2>
              <p style="margin: 4px 0 12px; color: var(--ink-60);">Welcome back. Pick up where you left off.</p>

              <Field label="Email">
                <Input v-model="compact.email" type="email" placeholder="you@company.com" />
              </Field>
              <Field label="Password" hint="At least 12 characters.">
                <Input v-model="compact.password" type="password" placeholder="••••••••" />
              </Field>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <Checkbox v-model="compact.remember" label="Stay signed in" />
                <ArrowLink href="#" size="sm">Forgot</ArrowLink>
              </div>

              <Button variant="primary" @click="compact.step = 'verify'">Continue</Button>
            </div>

            <div v-else key="verify" class="login-stack" style="margin-top: 36px;">
              <h2 style="margin: 0; font-size: 32px; letter-spacing: -0.6px; font-weight: 500; line-height: 1.1;">
                Verify it's you
              </h2>
              <p style="margin: 4px 0 18px; color: var(--ink-60);">
                Open your authenticator app and enter the current 6-digit code.
              </p>

              <PinInput v-model="compact.pin" :length="6" size="lg" autofocus />

              <div style="display: flex; gap: 10px; margin-top: 8px;">
                <Button variant="ghost" @click="reset(compact)">Cancel</Button>
                <Button variant="primary" :disabled="compact.pin.length < 6" style="flex: 1;">Verify</Button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Variant>

  </Story>
</template>

<style scoped>
/* shared: each step swap fades + slides */
.login-swap-enter-active,
.login-swap-leave-active { transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
.login-swap-enter-from { opacity: 0; transform: translateY(8px); }
.login-swap-leave-to   { opacity: 0; transform: translateY(-6px); }

.login-stack { display: flex; flex-direction: column; gap: 14px; }

/* 1. split */
.login-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: var(--paper);
}
.login-split__art {
  display: flex;
  padding: 48px;
}
.login-split__art-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 460px;
  margin: auto auto auto 0;
  min-height: 60vh;
}
.login-split__form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}
.login-split__form-inner {
  width: 100%;
  max-width: 380px;
}

/* 2. centered */
.login-pastel { min-height: 100vh; padding: 64px 24px; display: flex; align-items: center; justify-content: center; }
.login-centered { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; }
.login-centered__card { box-shadow: var(--shadow-medium); }

/* 3. compact */
.login-compact {
  min-height: 100vh;
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}
.login-compact__inner { width: 100%; max-width: 360px; }
.login-compact__mark {
  width: 22px; height: 22px;
  border-radius: 6px;
  background:
    radial-gradient(80% 100% at 0% 0%, rgba(189, 187, 255, 0.95), transparent 65%),
    radial-gradient(90% 100% at 100% 100%, rgba(255, 214, 245, 0.85), transparent 65%),
    var(--midnight);
}
</style>
