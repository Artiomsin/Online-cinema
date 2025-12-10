<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const subscriptions = ref<any[]>([])
const userSubscriptions = ref<any[]>([])
const selectedSubscription = ref<number|null>(null)
const startDate = ref<string>('')   // always a string
const endDate = ref<string>('')     // always a string
const message = ref<string>('')

// load all available subscriptions
async function fetchSubscriptions() {
  const res = await fetch(`${API_BASE}/subscriptions`, { credentials: 'include' })
  subscriptions.value = await res.json()
}

// load subscriptions of the current user
async function fetchUserSubscriptions() {
  const res = await fetch(`${API_BASE}/users/subscriptions`, {
    credentials: 'include'
  })
  userSubscriptions.value = await res.json()
  
  const activeSubs = userSubscriptions.value.filter((s: any) => {
    const now = new Date()
    const end = new Date(s.endDate)
    return s.status === 'active' && end >= now
  })
  localStorage.setItem('userSubscriptions', JSON.stringify(activeSubs))
}

// recalculate end date
watch([selectedSubscription, startDate], () => {
  if (!selectedSubscription.value || !startDate.value) {
    endDate.value = ''
    return
  }
  const plan = subscriptions.value.find(s => s.id === selectedSubscription.value)
  if (!plan) {
    endDate.value = ''
    return
  }

  const start = new Date(startDate.value)
  const end = new Date(start)
  end.setDate(start.getDate() + plan.period)
  endDate.value = (end.toISOString().split('T')[0]) || ''
})

// assign subscription to user
async function assignSubscription() {
  if (!selectedSubscription.value || !startDate.value || !endDate.value) {
    message.value = 'Fill in the start date and select a plan'
    return
  }

  
  const plan = subscriptions.value.find(s => s.id === selectedSubscription.value)
  if (!plan) {
    message.value = 'Selected plan not found'
    return
  }

  const alreadyHas = userSubscriptions.value.some(
    (us: any) => us.title === plan.title && us.status === 'active'
  )
  if (alreadyHas) {
    message.value = `You already have an active subscription: ${plan.title}`
    return
  }

  const res = await fetch(`${API_BASE}/users/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      subscriptionId: selectedSubscription.value,
      start: startDate.value,
      end: endDate.value
    })
  })

  if (res.ok) {
    message.value = 'Subscription assigned successfully'
    await fetchUserSubscriptions()
  } else {
    message.value = 'Error assigning subscription'
  }
}


onMounted(() => {
  const saved = localStorage.getItem('userSubscriptions')
  if (saved) {
    userSubscriptions.value = JSON.parse(saved)
  }
  fetchSubscriptions()
  fetchUserSubscriptions()
})
</script>

<template>
  <div class="subscriptions-page">
    <h1>Subscriptions</h1>

    <!-- list of all available plans -->
    <div v-if="subscriptions.length">
      <ul class="subscription-list">
        <li v-for="s in subscriptions" :key="s.id" class="subscription-item">
          <strong>{{ s.title }}</strong> — {{ s.price }} ₽ / {{ s.period }} days
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No available subscriptions.</p>
    </div>

    <!-- assign subscription -->
    <div class="assign-card">
      <h2>Assign Subscription to User</h2>

      <div class="form-group">
        <label for="subscription">Select Subscription</label>
        <select id="subscription" v-model="selectedSubscription" class="input">
          <option disabled value="">-- select a plan --</option>
          <option v-for="s in subscriptions" :key="s.id" :value="s.id">
            {{ s.title }} — {{ s.price }} ₽ / {{ s.period }} days
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="start">Start Date</label>
          <input id="start" type="date" v-model="startDate" class="input" />
        </div>
        <div class="form-group">
          <label for="end">End Date</label>
          <input id="end" type="date" v-model="endDate" class="input" readonly />
          <small class="hint">End date is calculated automatically</small>
        </div>
      </div>

      <button class="btn" @click="assignSubscription">Assign</button>
      <p class="message">{{ message }}</p>
    </div>

    <!-- list of current user's subscriptions -->
    <div class="user-subscriptions">
      <h2>Your Subscriptions</h2>
      <div v-if="userSubscriptions.length">
        <ul class="subscription-list">
          <li v-for="us in userSubscriptions" :key="us.userSubscriptionId" class="subscription-item">
            <strong>{{ us.title }}</strong> — {{ us.price }} ₽ / {{ us.period }} days
            <div class="sub-meta">
              <span>Status: {{ us.status }}</span>
              <span> From {{ us.startDate }} to {{ us.endDate }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>You don’t have any active subscriptions yet.</p>
      </div>
    </div>
  </div>
</template>




<style scoped>
.subscriptions-page {
  max-width: 600px;
  margin: 2rem auto;
  background: #1e293b;
  color: #e2e8f0;
  padding: 2rem;
  border-radius: 12px;
}
.subscription-list {
  list-style: none;
  padding: 0;
}
.subscription-item {
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: .5rem;
}
.assign-card {
  margin-top: 2rem;
  background: rgba(255,255,255,0.08);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-row {
  display: flex;
  gap: 1rem;
}
label {
  margin-bottom: .4rem;
  font-size: .9rem;
  color: #cbd5e1;
}
.input {
  padding: .6rem .8rem;
  border-radius: 8px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #e2e8f0;
  transition: border-color .2s, box-shadow .2s;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.4);
  outline: none;
}
.btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: .7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background .2s, transform .1s;
}
.btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
}
.message {
  margin-top: 1rem;
  font-weight: bold;
}
</style>
