<script setup lang="ts">
import { ref, onMounted } from 'vue';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type Log = {
  _id: string;
  type: string;
  level: string;
  action?: string;
  userId?: number;
  message: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
};

type ReportData = {
  data: any[];
  startDate?: string;
  endDate?: string;
  period?: string;
  groupBy?: string;
  limit?: number;
};

const activeTab = ref<'logs' | 'activity' | 'top-users' | 'crud' | 'trends' | 'anomalies'>('logs');
const loading = ref(false);
const error = ref<string | null>(null);

const logs = ref<Log[]>([]);
const totalLogs = ref(0);

const filter = ref({
  userId: '' as string | number,
  type: '' as string,
  level: '' as string,
  action: '' as string,
  startDate: '',
  endDate: '',
  limit: 50,
  offset: 0
});

const reportData = ref<ReportData | null>(null);

const reportParams = ref({
  startDate: getDefaultStartDate(),
  endDate: getDefaultEndDate(),
  period: 'day' as 'day' | 'week' | 'month',
  groupBy: 'day' as 'hour' | 'day' | 'week' | 'month',
  limit: 10,
  threshold: 3
});

function getDefaultStartDate() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function getDefaultEndDate() {
  return new Date().toISOString().split('T')[0];
}

const colors: Record<string, string> = {
  login: '#06b6d4',
  logout: '#8b5cf6',
  create: '#10b981',
  update: '#f59e0b',
  delete: '#ef4444',
  register: '#ec4899'
};

function getColor(action: string): string {
  return colors[action] || '#6b7280';
}

function getPieStyle() {
  const data = reportData.value?.data || [];
  const total = data.reduce((sum: number, i: any) => sum + i.count, 0) || 1;
  
  let currentPercent = 0;
  const segments = data.map(item => {
    const color = getColor(item.action);
    const percent = (item.count / total) * 100;
    const start = currentPercent;
    const end = currentPercent + percent;
    currentPercent = end;
    return `${color} ${start}% ${end}%`;
  }).join(', ');
  
  const grayPercent = 100 - currentPercent;
  return {
    background: segments ? `conic-gradient(${segments}, #374151 ${currentPercent}% 100%)` : '#374151'
  };
}

function getBarHeight(value: number): number {
  const max = Math.max(...(reportData.value?.data?.map((i: any) => i.count || i.totalActions) || [1]));
  return max > 0 ? (value / max) * 100 : 0;
}

function getUserColor(idx: number): string {
  const userColors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
  return userColors[idx] || '#6b7280';
}

async function loadLogs() {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    if (filter.value.userId) params.append('userId', String(filter.value.userId));
    if (filter.value.type) params.append('type', filter.value.type);
    if (filter.value.level) params.append('level', filter.value.level);
    if (filter.value.action) params.append('action', filter.value.action);
    if (filter.value.startDate) params.append('startDate', filter.value.startDate);
    if (filter.value.endDate) params.append('endDate', filter.value.endDate);
    params.append('limit', String(filter.value.limit));
    params.append('offset', String(filter.value.offset));

    const res = await fetch(`${API_BASE}/logs?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load logs');
    const data = await res.json();
    logs.value = data.logs;
    totalLogs.value = data.total;
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function loadActivityReport() {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    if (reportParams.value.startDate) params.append('startDate', reportParams.value.startDate);
    if (reportParams.value.endDate) params.append('endDate', reportParams.value.endDate);
    if (reportParams.value.period) params.append('period', reportParams.value.period);

    const res = await fetch(`${API_BASE}/logs/reports/activity?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load activity report');
    reportData.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function loadTopUsersReport() {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    if (reportParams.value.startDate) params.append('startDate', reportParams.value.startDate);
    if (reportParams.value.endDate) params.append('endDate', reportParams.value.endDate);
    if (reportParams.value.limit) params.append('limit', String(reportParams.value.limit));

    const res = await fetch(`${API_BASE}/logs/reports/top-users?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load top users report');
    reportData.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function loadCrudReport() {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    if (reportParams.value.startDate) params.append('startDate', reportParams.value.startDate);
    if (reportParams.value.endDate) params.append('endDate', reportParams.value.endDate);

    const res = await fetch(`${API_BASE}/logs/reports/crud?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load CRUD report');
    reportData.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function loadTrendsReport() {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    if (reportParams.value.startDate) params.append('startDate', reportParams.value.startDate);
    if (reportParams.value.endDate) params.append('endDate', reportParams.value.endDate);
    if (reportParams.value.groupBy) params.append('groupBy', reportParams.value.groupBy);

    const res = await fetch(`${API_BASE}/logs/reports/trends?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load trends report');
    reportData.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function loadAnomaliesReport() {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    params.append('threshold', String(reportParams.value.threshold));

    const res = await fetch(`${API_BASE}/logs/reports/anomalies?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load anomalies report');
    reportData.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

function loadReport() {
  switch (activeTab.value) {
    case 'activity': loadActivityReport(); break;
    case 'top-users': loadTopUsersReport(); break;
    case 'crud': loadCrudReport(); break;
    case 'trends': loadTrendsReport(); break;
    case 'anomalies': loadAnomaliesReport(); break;
  }
}

function getReportType(): string {
  switch (activeTab.value) {
    case 'activity': return 'activity';
    case 'top-users': return 'top-users';
    case 'crud': return 'crud';
    case 'trends': return 'trends';
    case 'anomalies': return 'anomalies';
    default: return '';
  }
}

async function exportJSON() {
  const type = getReportType();
  if (!type) return;
  const params = new URLSearchParams();
  if (reportParams.value.startDate) params.append('startDate', reportParams.value.startDate);
  if (reportParams.value.endDate) params.append('endDate', reportParams.value.endDate);
  if (reportParams.value.period) params.append('period', reportParams.value.period);
  if (reportParams.value.groupBy) params.append('groupBy', reportParams.value.groupBy);
  if (reportParams.value.limit) params.append('limit', String(reportParams.value.limit));
  if (reportParams.value.threshold) params.append('threshold', String(reportParams.value.threshold));
  
  window.open(`${API_BASE}/logs/reports/export/json?type=${type}&${params}`, '_blank');
}

async function exportCSV() {
  const type = getReportType();
  if (!type) return;
  const params = new URLSearchParams();
  if (reportParams.value.startDate) params.append('startDate', reportParams.value.startDate);
  if (reportParams.value.endDate) params.append('endDate', reportParams.value.endDate);
  if (reportParams.value.period) params.append('period', reportParams.value.period);
  if (reportParams.value.groupBy) params.append('groupBy', reportParams.value.groupBy);
  if (reportParams.value.limit) params.append('limit', String(reportParams.value.limit));
  if (reportParams.value.threshold) params.append('threshold', String(reportParams.value.threshold));
  
  window.open(`${API_BASE}/logs/reports/export/csv?type=${type}&${params}`, '_blank');
}

function changeTab(tab: typeof activeTab.value) {
  activeTab.value = tab;
  reportData.value = null;
  if (tab !== 'logs') {
    loadReport();
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

function formatSeverity(severity: string) {
  const colors: Record<string, string> = {
    low: '#34d399',
    medium: '#fbbf24',
    high: '#ef4444'
  };
  return colors[severity] || '#9fb3d1';
}

onMounted(() => {
  loadLogs();
});
</script>

<template>
  <div class="admin-card">
    <h1>System Logs & Reports</h1>

    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'logs' }"
        @click="changeTab('logs')"
      >
        Logs
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'activity' }"
        @click="changeTab('activity')"
      >
        User Activity
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'top-users' }"
        @click="changeTab('top-users')"
      >
        Top Users
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'crud' }"
        @click="changeTab('crud')"
      >
        CRUD Stats
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'trends' }"
        @click="changeTab('trends')"
      >
        Trends
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'anomalies' }"
        @click="changeTab('anomalies')"
      >
        Anomalies
      </button>
    </div>

    <div v-if="activeTab === 'logs'" class="tab-content">
      <div class="filters">
        <div class="filter-row">
          <select v-model="filter.type">
            <option value="">All Types</option>
            <option value="user_action">User Action</option>
            <option value="error">Error</option>
          </select>
          <select v-model="filter.level">
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          <select v-model="filter.action">
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="register">Register</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <input type="number" v-model="filter.userId" placeholder="User ID" />
        </div>
        <div class="filter-row">
          <input type="date" v-model="filter.startDate" />
          <input type="date" v-model="filter.endDate" />
          <input type="number" v-model="filter.limit" placeholder="Limit" style="width: 80px" />
          <button class="btn" @click="loadLogs">Apply Filters</button>
        </div>
      </div>

      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div class="total">Total: {{ totalLogs }} logs</div>
        <div class="logs-table-wrap">
          <table class="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Level</th>
                <th>Action</th>
                <th>User ID</th>
                <th>Message</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log._id">
                <td>{{ formatDate(log.timestamp) }}</td>
                <td>
                  <span class="badge" :class="'type-' + log.type">{{ log.type }}</span>
                </td>
                <td>
                  <span class="badge" :class="'level-' + log.level">{{ log.level }}</span>
                </td>
                <td>{{ log.action || '-' }}</td>
                <td>{{ log.userId || '-' }}</td>
                <td class="message-cell">{{ log.message }}</td>
                <td>
                  <span v-if="log.metadata" class="metadata-btn" @click="log.metadata = log.metadata">
                    {{ typeof log.metadata === 'object' ? JSON.stringify(log.metadata) : log.metadata }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="tab-content">
      <div class="report-filters">
        <template v-if="activeTab !== 'anomalies'">
          <label>Start Date: <input type="date" v-model="reportParams.startDate" /></label>
          <label>End Date: <input type="date" v-model="reportParams.endDate" /></label>
        </template>
        <template v-if="activeTab === 'activity'">
          <label>Period: 
            <select v-model="reportParams.period">
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </label>
        </template>
        <template v-if="activeTab === 'top-users'">
          <label>Limit: <input type="number" v-model="reportParams.limit" style="width: 80px" /></label>
        </template>
        <template v-if="activeTab === 'trends'">
          <label>Group By: 
            <select v-model="reportParams.groupBy">
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </label>
        </template>
        <template v-if="activeTab === 'anomalies'">
          <label>Threshold: <input type="number" v-model="reportParams.threshold" style="width: 80px" /></label>
        </template>
        <button class="btn" @click="loadReport">Load Report</button>
        <button class="btn btn-secondary" @click="exportJSON" :disabled="!reportData">Export JSON</button>
        <button class="btn btn-secondary" @click="exportCSV" :disabled="!reportData">Export CSV</button>
      </div>

      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="reportData">
        <div class="report-info">
          <span v-if="reportData.startDate">Period: {{ reportData.startDate }} - {{ reportData.endDate }}</span>
        </div>

        <div v-if="activeTab === 'activity'" class="report-content">
          <h3>User Activity by Period</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Period</th>
                <th>Total Actions</th>
                <th>Login</th>
                <th>Logout</th>
                <th>Create</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in reportData.data" :key="idx">
                <td>{{ item._id?.userId }}</td>
                <td>{{ item._id?.period }}</td>
                <td>{{ item.totalActions }}</td>
                <td>{{ item.loginCount }}</td>
                <td>{{ item.logoutCount }}</td>
                <td>{{ item.createCount }}</td>
                <td>{{ item.updateCount }}</td>
                <td>{{ item.deleteCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'top-users'" class="report-content">
          <h3>Top {{ reportData.limit }} Active Users</h3>
          
          <div class="charts-container">
            <div class="chart-box">
              <h4>Actions by User</h4>
              <div class="bar-chart">
                <div v-for="(item, idx) in reportData.data.slice(0, 10)" :key="item.userId" class="bar-group">
                  <div class="bar-container">
                    <div class="bar" :style="{height: getBarHeight(item.totalActions) + '%', background: getUserColor(idx)}">
                      <span class="bar-value">{{ item.totalActions }}</span>
                    </div>
                  </div>
                  <span class="bar-label">User {{ item.userId }}</span>
                </div>
              </div>
            </div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Total Actions</th>
                <th>Logins</th>
                <th>Creates</th>
                <th>Updates</th>
                <th>Deletes</th>
                <th>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in reportData.data" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ item.userId }}</td>
                <td>{{ item.totalActions }}</td>
                <td>{{ item.loginCount }}</td>
                <td>{{ item.createCount }}</td>
                <td>{{ item.updateCount }}</td>
                <td>{{ item.deleteCount }}</td>
                <td>{{ item.lastActivity ? formatDate(item.lastActivity) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'crud'" class="report-content">
          <h3>CRUD Operations Statistics</h3>
          
          <div class="charts-container">
            <div class="chart-box">
              <h4>Distribution</h4>
              <div class="pie-chart" :style="getPieStyle()">
              </div>
              <div class="pie-legend">
                <div v-for="item in reportData.data" :key="item.action" class="legend-item">
                  <span class="legend-color" :style="{background: getColor(item.action)}"></span>
                  <span>{{ item.action }}: {{ item.count }} ({{ item.percentage }}%)</span>
                </div>
              </div>
            </div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData.data" :key="item.action">
                <td>{{ item.action }}</td>
                <td>{{ item.count }}</td>
                <td>{{ item.percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'trends'" class="report-content">
          <h3>Time Series Trends</h3>
          
          <div class="charts-container">
            <div class="chart-box">
              <h4>Events Over Time</h4>
              <div class="bar-chart">
                <div v-for="item in reportData.data" :key="item.date" class="bar-group">
                  <div class="bar-container">
                    <div class="bar" :style="{height: getBarHeight(item.count) + '%'}">
                      <span class="bar-value">{{ item.count }}</span>
                    </div>
                    <div class="bar bar-errors" :style="{height: getBarHeight(item.errors) + '%'}"></div>
                  </div>
                  <span class="bar-label">{{ item.date.slice(5) }}</span>
                </div>
              </div>
              <div class="bar-legend">
                <span class="legend-color" style="background: #06b6d4"></span> Events
                <span class="legend-color" style="background: #ef4444; margin-left: 10px"></span> Errors
              </div>
            </div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Events Count</th>
                <th>Unique Users</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData.data" :key="item.date">
                <td>{{ item.date }}</td>
                <td>{{ item.count }}</td>
                <td>{{ item.uniqueUsers }}</td>
                <td>{{ item.errors }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'anomalies'" class="report-content">
          <h3>User Behavior Anomalies</h3>
          <table class="report-table" v-if="reportData.data.length > 0">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Total Actions (7 days)</th>
                <th>Actions Last Hour</th>
                <th>Action Variety</th>
                <th>Last Activity</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData.data" :key="item.userId">
                <td>{{ item.userId }}</td>
                <td>{{ item.totalActions }}</td>
                <td>{{ item.actionsLastHour }}</td>
                <td>{{ item.actionVariety }}</td>
                <td>{{ item.lastActivity ? formatDate(item.lastActivity) : '-' }}</td>
                <td>
                  <span class="severity-badge" :style="{ background: formatSeverity(item.severity) }">
                    {{ item.severity }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">No anomalies detected</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-card {
  background: linear-gradient(180deg, rgba(11, 22, 48, 0.72), rgba(7, 16, 35, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 1.6rem;
  border-radius: 16px;
  box-shadow: 0 18px 60px rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(8px);
  color: #e6eef8;
}

.admin-card > h1 {
  margin: 0 0 1rem 0;
  font-size: 1.7rem;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab {
  padding: 0.6rem 1rem;
  border: none;
  background: rgba(255, 255, 255, 0.03);
  color: var(--muted);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s;
  font-weight: 600;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.tab.active {
  background: linear-gradient(90deg, var(--accent1), var(--accent2));
  color: #041024;
}

.tab-content {
  min-height: 400px;
}

.filters {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}

.filter-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.filter-row select,
.filter-row input {
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  font-size: 0.9rem;
}

.btn {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, var(--accent1), var(--accent2));
  color: #041024;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e6eef8;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.total {
  margin-bottom: 0.8rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.logs-table-wrap {
  overflow: auto;
  max-height: 500px;
  border-radius: 10px;
}

.logs-table,
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.logs-table th,
.logs-table td,
.report-table th,
.report-table td {
  padding: 0.6rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logs-table th,
.report-table th {
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  background: rgba(11, 22, 48, 0.9);
}

.message-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-user_action { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
.type-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.level-info { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.level-warn { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.level-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.metadata-btn {
  font-size: 0.75rem;
  color: var(--accent1);
  cursor: pointer;
}

.report-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.report-filters label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.report-filters select,
.report-filters input {
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
}

.report-info {
  margin-bottom: 1rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.report-content h3 {
  margin: 0 0 1rem 0;
  color: #fff;
}

.severity-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #041024;
  text-transform: uppercase;
}

.no-data {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
}

.error {
  padding: 0.8rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.charts-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.chart-box {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 300px;
}

.chart-box h4 {
  margin: 0 0 1rem 0;
  color: var(--accent1);
}

.pie-chart {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: #374151;
  margin: 0 auto 1rem;
  position: relative;
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 200px;
  padding: 1rem 0;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-container {
  height: 160px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
}

.bar {
  width: 20px;
  background: #06b6d4;
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  position: relative;
  transition: height 0.3s;
}

.bar-errors {
  background: #ef4444;
  width: 12px;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--muted);
}

.bar-label {
  font-size: 0.7rem;
  color: var(--muted);
  margin-top: 0.3rem;
}

.bar-legend {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
}
</style>
