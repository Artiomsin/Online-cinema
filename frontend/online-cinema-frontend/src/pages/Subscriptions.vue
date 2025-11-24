<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const subscriptions = ref<any[]>([])
const userSubscriptions = ref<any[]>([])
const selectedSubscription = ref<number|null>(null)
const startDate = ref<string>('')   // всегда строка
const endDate = ref<string>('')     // всегда строка
const message = ref<string>('')

// загрузка всех доступных подписок
async function fetchSubscriptions() {
  const res = await fetch(`${API_BASE}/subscriptions`, { credentials: 'include' })
  subscriptions.value = await res.json()
}

// загрузка подписок текущего пользователя
async function fetchUserSubscriptions() {
  const res = await fetch(`${API_BASE}/users/subscriptions`, {
    credentials: 'include'
  })
  userSubscriptions.value = await res.json()
}

// пересчёт даты окончания
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

// назначение подписки пользователю
async function assignSubscription() {
  if (!selectedSubscription.value || !startDate.value || !endDate.value) {
    message.value = 'Заполните дату начала и выберите план'
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
    message.value = 'Подписка назначена успешно'
    await fetchUserSubscriptions()
  } else {
    message.value = 'Ошибка при назначении подписки'
  }
}

onMounted(() => {
  fetchSubscriptions()
  fetchUserSubscriptions()
})
</script>

<template>
  <div class="subscriptions-page">
    <h1>Подписки</h1>

    <!-- список всех доступных планов -->
    <div v-if="subscriptions.length">
      <ul class="subscription-list">
        <li v-for="s in subscriptions" :key="s.id" class="subscription-item">
          <strong>{{ s.title }}</strong> — {{ s.price }} ₽ / {{ s.period }} дней
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Нет доступных подписок.</p>
    </div>

    <!-- назначение подписки -->
    <div class="assign-card">
      <h2>Назначить подписку пользователю</h2>

      <div class="form-group">
        <label for="subscription">Выберите подписку</label>
        <select id="subscription" v-model="selectedSubscription" class="input">
          <option disabled value="">-- выберите план --</option>
          <option v-for="s in subscriptions" :key="s.id" :value="s.id">
            {{ s.title }} — {{ s.price }} ₽ / {{ s.period }} дней
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="start">Дата начала</label>
          <input id="start" type="date" v-model="startDate" class="input" />
        </div>
        <div class="form-group">
          <label for="end">Дата окончания</label>
          <input id="end" type="date" v-model="endDate" class="input" readonly />
          <small class="hint">Дата окончания рассчитывается автоматически</small>
        </div>
      </div>

      <button class="btn" @click="assignSubscription">Назначить</button>
      <p class="message">{{ message }}</p>
    </div>

   
<!-- список подписок текущего пользователя -->
<div class="user-subscriptions">
  <h2>Ваши подписки</h2>
  <div v-if="userSubscriptions.length">
    <ul class="subscription-list">
      <li v-for="us in userSubscriptions" :key="us.userSubscriptionId" class="subscription-item">
        <strong>{{ us.title }}</strong> — {{ us.price }} ₽ / {{ us.period }} дней
        <div class="sub-meta">
          <span>Статус: {{ us.status }}</span>
          <span> С {{ us.startDate }} по {{ us.endDate }}</span>
        </div>
      </li>
    </ul>
  </div>
  <div v-else>
    <p>У вас пока нет оформленных подписок.</p>
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
