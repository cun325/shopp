<template>
  <div class="cs-chat-body">
    <div
      v-for="msg in messages"
      :key="msg.id"
      :class="['cs-msg', msg.from === 'ai' || msg.from === 'me' ? 'right' : 'left', msg.ai ? 'ai' : '']"
    >
      <el-avatar v-if="msg.from === 'user'" :src="userAvatar" size="small" class="cs-msg-avatar" />
      <div class="cs-msg-content">
        <div class="cs-msg-bubble">
          <span v-if="msg.ai" class="cs-ai-label">AI回复</span>
          <span v-if="msg.type === 'image'">
            <el-image :src="msg.content" fit="cover" style="max-width:180px;max-height:120px;border-radius:8px;box-shadow:0 2px 8px #e0e0e0;" />
          </span>
          <span v-else v-html="msg.content"></span>
        </div>
        <div class="cs-msg-meta">
          <span class="cs-msg-time">{{ msg.time }}</span>
          <span v-if="msg.read" class="cs-msg-read">已读</span>
          <el-button v-if="msg.from==='me'" @click="$emit('recall', msg)" text size="mini">撤回</el-button>
          <el-button v-if="msg.from==='me'" @click="$emit('delete', msg)" text size="mini">删除</el-button>
        </div>
      </div>
      <el-avatar v-if="msg.from === 'ai' || msg.from === 'me'" :src="aiAvatar" size="small" class="cs-msg-avatar" />
    </div>
  </div>
</template>
<script setup>
defineProps({
  messages: Array,
  userAvatar: String,
  aiAvatar: String,
});
defineEmits(['recall', 'delete']);
</script>
<style scoped>
.cs-chat-body { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.cs-msg { display: flex; align-items: flex-end; margin-bottom: 4px; animation: fadeInUp 0.3s; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.cs-msg.left { flex-direction: row; justify-content: flex-start; }
.cs-msg.right { flex-direction: row-reverse; justify-content: flex-end; }
.cs-msg.right .cs-msg-bubble { background: linear-gradient(90deg, #e6f0ff 0%, #f0f7ff 100%); border-radius: 16px 16px 4px 16px; color: #246bfa; }
.cs-msg.left .cs-msg-bubble { background: #fff; border-radius: 16px 16px 16px 4px; color: #222; }
.cs-msg-bubble { background: #fff; border-radius: 16px 16px 16px 4px; padding: 12px 18px; font-size: 15px; color: #222; margin-bottom: 2px; position: relative; box-shadow: 0 2px 8px rgba(36, 107, 250, 0.06); transition: box-shadow 0.2s, transform 0.2s; }
.cs-msg-bubble:hover { box-shadow: 0 4px 16px rgba(36, 107, 250, 0.12); transform: translateY(-2px) scale(1.03); }
.cs-ai-label { font-size: 12px; color: #fff; background: linear-gradient(90deg, #a084e8 0%, #7c5dfa 100%); border-radius: 6px; padding: 2px 10px; margin-right: 8px; font-weight: 500; letter-spacing: 1px; }
.cs-msg-meta { font-size: 12px; color: #bbb; margin-top: 2px; display: flex; align-items: center; gap: 8px; }
.cs-msg-read { color: #67c23a; margin-left: 4px; }
.cs-msg-avatar { margin: 0 8px; }
</style> 