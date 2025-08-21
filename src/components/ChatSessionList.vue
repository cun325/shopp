<template>
  <div class="cs-session-list">
    <div
      v-for="session in sessions"
      :key="session.id"
      :class="['cs-session-item', session.id === currentSessionId ? 'active' : '', session.top ? 'top' : '']"
      @click="$emit('select', session)"
    >
      <el-avatar :src="session.avatar" size="small" />
      <div class="cs-session-info">
        <div class="cs-session-title">
          <span>{{ session.name }}</span>
          <span class="cs-session-time">{{ session.time }}</span>
        </div>
        <div class="cs-session-msg">
          <span>{{ session.lastMsg }}</span>
          <el-tag v-if="session.status === 'pending'" size="mini" type="danger">未处理</el-tag>
          <el-tag v-if="session.ai" size="mini" type="info">AI回复</el-tag>
          <el-tag v-if="session.status === 'done'" size="mini" type="success">已完成</el-tag>
          <el-tag v-if="session.status === 'processing'" size="mini" type="warning">处理中</el-tag>
          <span v-if="session.unread > 0" class="cs-unread-dot">{{ session.unread > 99 ? '99+' : session.unread }}</span>
        </div>
      </div>
      <div class="cs-session-actions">
        <el-button @click.stop="$emit('top', session)" icon="el-icon-top" circle size="mini" title="置顶" />
        <el-button @click.stop="$emit('delete', session)" icon="el-icon-delete" circle size="mini" title="删除" />
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  sessions: Array,
  currentSessionId: [String, Number],
});
defineEmits(['select', 'top', 'delete']);
</script>
<style scoped>
.cs-session-list { flex: 1; overflow-y: auto; }
.cs-session-item { display: flex; align-items: flex-start; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f5f5f5; transition: background 0.2s; position: relative; }
.cs-session-item.active { background: #f0f7ff; }
.cs-session-item.top { background: #f9f5ff; }
.cs-session-info { margin-left: 10px; flex: 1; }
.cs-session-title { display: flex; justify-content: space-between; font-weight: 500; color: #222; }
.cs-session-time { font-size: 12px; color: #bbb; }
.cs-session-msg { font-size: 14px; color: #888; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
.cs-unread-dot { background: #f56c6c; color: #fff; border-radius: 10px; font-size: 12px; padding: 0 6px; margin-left: 6px; min-width: 18px; text-align: center; }
.cs-session-actions { display: flex; flex-direction: column; gap: 4px; margin-left: 8px; }
</style> 