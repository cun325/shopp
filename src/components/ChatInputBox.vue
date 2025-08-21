<template>
  <div class="cs-chat-footer">
    <el-input
      v-model="inputValue"
      type="textarea"
      :rows="2"
      placeholder="输入消息..."
      @keydown="handleInputKeydown"
    />
    <div class="cs-chat-actions">
      <el-upload
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-success="handleUpload"
        accept="image/*"
      >
        <el-button icon="el-icon-picture" circle size="small" title="发送图片" />
      </el-upload>
      <el-button icon="el-icon-smile" circle size="small" title="表情" @click="showEmoji = !showEmoji" />
      <el-button type="primary" @click="emitSend">发送</el-button>
      <el-button type="info" @click="emitAIReply" plain>使用AI回复</el-button>
    </div>
    <div v-if="showEmoji" class="emoji-panel">
      <span v-for="emoji in emojis" :key="emoji" class="emoji-item" @click="selectEmoji(emoji)">{{ emoji }}</span>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
const props = defineProps({ value: String });
const emit = defineEmits(['update:value', 'send', 'ai-reply', 'upload', 'emoji']);
const inputValue = ref(props.value || '');
watch(() => props.value, v => inputValue.value = v);
function handleInputKeydown(e) {
  if (e.key === 'Enter') {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Enter换行
      const textarea = e.target;
      const value = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = value.substring(0, start) + '\n' + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      inputValue.value = textarea.value;
      e.preventDefault();
    } else {
      emitSend();
      e.preventDefault();
    }
  }
}
function emitSend() { emit('send', inputValue.value); inputValue.value = ''; }
function emitAIReply() { emit('ai-reply'); }
function beforeUpload(file) { return file.type.startsWith('image/'); }
function handleUpload(res, file) { emit('upload', file); }
const showEmoji = ref(false);
const emojis = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😍','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👹','👺','💀','👻','👽','🤖','💩'];
function selectEmoji(emoji) { emit('emoji', emoji); showEmoji.value = false; }
</script>
<style scoped>
.cs-chat-footer { background: #fff; padding: 20px 32px; border-top: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 12px; border-radius: 0 0 12px 12px; box-shadow: 0 -2px 8px rgba(36, 107, 250, 0.04); }
.cs-chat-actions { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.emoji-panel { position: absolute; bottom: 60px; left: 40px; background: #fff; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 8px #e0e0e0; padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 6px; z-index: 10; }
.emoji-item { font-size: 22px; cursor: pointer; transition: transform 0.1s; }
.emoji-item:hover { transform: scale(1.2); }
</style> 