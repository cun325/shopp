<template>

  <div class="chat-app" :style="{ transform: 'scale(1)', transformOrigin: '0 0' }">
    <div class="chat-sidebar">
      <el-input 
        placeholder="搜索最近联系人" 
        prefix-icon="el-icon-search" 
        v-model="searchQuery">
      </el-input>
      <el-scrollbar style="height: calc(100vh - 120px)">
        <el-menu 
          :default-active="activeChat" 
          @select="handleSelectChat">
          <el-menu-item 
            v-for="chat in filteredChats" 
            :key="chat.userId || chat.id" 
            :index="(chat.userId || chat.id).toString()">
            <el-avatar :src="chat.userAvatar || 'https://example.com/default-avatar.png'" size="small"></el-avatar>
            <span class="chat-name">{{ chat.userName || '未知用户' }}</span>
            <el-badge 
              :value="chat.unreadCount || 0" 
              :hidden="!chat.unreadCount || chat.unreadCount === 0" 
              class="item">
            </el-badge>
            <span class="time">{{ formatTime(chat.createTime) }}</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="chat-window" v-if="selectedChat">
      <div class="chat-header">
        <h2 class="chat-title">{{ selectedChat.userName || '未知用户' }}</h2>
      </div>
      <div class="chat-messages">
        <el-scrollbar ref="messageScrollbar" style="height: calc(100vh - 240px)">
          <div 
            v-for="message in chatMessages" 
            :key="message.id" 
            :class="['message', message.isOwn ? 'from-me' : 'from-user']">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.createTime) }}</div>
          </div>
        </el-scrollbar>
      </div>
      <div class="chat-input">
        <el-input 
          type="textarea" 
          placeholder="请输入消息，按Enter键或点击发送按钮发送" 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          :rows="2">
        </el-input>
        <el-button 
          type="primary" 
          @click="sendMessage"
          :loading="sendingReply">
          发送
        </el-button>
      </div>
    </div>
    <div class="chat-window placeholder" v-else>
      <div class="placeholder-content">
        <p>请选择一个用户开始对话</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

// 响应式数据
const searchQuery = ref('')
const activeChat = ref('')
const newMessage = ref('')
const sendingReply = ref(false)
const stompClient = ref(null)
const isConnected = ref(false)
const messages = ref([]) // 所有消息列表
const chatMessages = ref([]) // 当前聊天消息列表
const selectedChat = ref(null)
const messageScrollbar = ref(null)

// 获取消息列表
async function fetchMessages() {
  try {
    const params = {
      page: 1,
      size: 100,
      search: searchQuery.value
    }

    // 修复API端点，去掉前面的/api，因为request.js中已经设置了baseURL为/api
    const response = await request.get('/messages/user/list', { params })

    if (response.data) {
      messages.value = response.data.list || []
      // 如果有激活的聊天，刷新聊天消息
      if (activeChat.value) {
        await loadChatMessages(activeChat.value)
      }
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    ElMessage.error('获取消息列表失败')
  }
}

// 连接WebSocket
function connectWebSocket() {
  try {
    // 获取认证token
    const token = localStorage.getItem('token') || 'admin-token'

    // 创建SockJS连接，使用相对路径避免跨域问题
    const socket = new SockJS('/ws')

    // 创建STOMP客户端
    stompClient.value = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // 仅在开发环境启用调试
        if (process.env.NODE_ENV === 'development') {
          console.log('STOMP Debug:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 15000,  // 更频繁的心跳
      heartbeatOutgoing: 15000,
      // WebSocket断开连接时的回调
      onWebSocketError: (error) => {
        console.error('WebSocket 错误:', error);
      },
      onDisconnect: () => {
        console.log('STOMP连接已断开');
        isConnected.value = false;
      }
    });

    // 连接成功回调
    stompClient.value.onConnect = (frame) => {
      console.log('STOMP连接已建立:', frame);
      isConnected.value = true;

      // 订阅客服消息
      stompClient.value.subscribe('/topic/service', (message) => {
        handleCustomerServiceMessage(JSON.parse(message.body));
      });
    };

    // 连接错误回调
    stompClient.value.onStompError = (frame) => {
      console.error('STOMP连接错误:', frame.headers['message'])
      console.error('详细信息:', frame.body)
      isConnected.value = false
    }

    // 激活连接
    stompClient.value.activate()
  } catch (error) {
    console.error('创建STOMP连接失败:', error)
  }
}

// 处理客服消息
function handleCustomerServiceMessage(message) {
  console.log('收到客服消息:', message)
  ElMessage.info('收到新的客服消息')

  // 只处理title为"客服消息"或"客户消息"的消息
  if (message.title !== '客服消息' && message.title !== '客户消息') {
    return
  }

  // 如果是当前选中的用户发来的消息，更新聊天记录
  if (selectedChat.value && selectedChat.value.userId === message.userId) {
    // 添加新消息到聊天记录中
    const newMessage = {
      ...message,
      isOwn: message.title === '客服消息' // 客服消息显示在右边
    }
    
    // 检查是否已存在该消息
    const exists = chatMessages.value.some(msg => msg.id === newMessage.id)
    if (!exists) {
      // 只添加title为"客服消息"或"客户消息"的消息
      if (newMessage.title === '客服消息' || newMessage.title === '客户消息') {
        chatMessages.value.push(newMessage)
        
        // 滚动到底部
        nextTick(() => {
          if (messageScrollbar.value) {
            const scrollElement = messageScrollbar.value.wrapRef
            scrollElement.scrollTop = scrollElement.scrollHeight
          }
        })
      }
    }
  }
  
  // 刷新消息列表
  fetchMessages()
}

// 加载特定用户的聊天消息
async function loadChatMessages(userId) {
  try {
    // 修复API端点，去掉前面的/api，因为request.js中已经设置了baseURL为/api
    const params = {
      page: 1,
      size: 100
    }
    const response = await request.get(`/messages/admin/chat/user/${userId}`, { params })
    if (response.data) {
      // 只显示title为"客服消息"或"客户消息"的消息
      // "客服消息"显示在右边，"客户消息"显示在左边
      chatMessages.value = response.data.list
        .filter(msg => msg.title === '客服消息' || msg.title === '客户消息')
        .map(msg => ({
          ...msg,
          isOwn: msg.title === '客服消息' // 客服消息显示在右边
        }))
      
      // 滚动到底部
      nextTick(() => {
        if (messageScrollbar.value) {
          const scrollElement = messageScrollbar.value.wrapRef
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      })
    }
  } catch (error) {
    console.error('加载聊天消息失败:', error)
    ElMessage.error('加载聊天消息失败')
  }
}

// 选择聊天
function handleSelectChat(userId) {
  activeChat.value = userId
  // 从filteredChats中找到选中的用户信息
  const chat = filteredChats.value.find(msg => msg.userId === parseInt(userId))
  if (chat) {
    selectedChat.value = {
      ...chat,
      userId: parseInt(userId)
    }
    // 加载该用户的聊天消息
    loadChatMessages(parseInt(userId))
  } else {
    // 如果在filteredChats中找不到，尝试在messages中查找
    const chatFromMessages = messages.value.find(msg => msg.userId === parseInt(userId))
    if (chatFromMessages) {
      selectedChat.value = {
        ...chatFromMessages,
        userId: parseInt(userId)
      }
      loadChatMessages(parseInt(userId))
    }
  }
}

// 发送消息
async function sendMessage() {
  if (!newMessage.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  if (!selectedChat.value) {
    ElMessage.error('未选择用户')
    return
  }

  try {
    sendingReply.value = true
    const messageData = {
      userId: selectedChat.value.userId,
      content: newMessage.value.trim(),
      title: '客服消息',  // 确保title为"客服消息"
      messageType: 2,     // 确保messageType为2，表示客服消息
      senderType: 3       // 明确标识为客服发送
    }

    // 修复API端点，使用正确的路径（通过Nginx代理）
    const response = await request.post('/admin/message/send-system', messageData)

    if (response.code === 200) {
      ElMessage.success('消息发送成功')
      newMessage.value = ''

      // 通过WebSocket推送消息给用户
      if (isConnected.value && stompClient.value) {
        const serviceMessage = {
          type: 'customer_service_reply',
          userId: selectedChat.value.userId,
          content: messageData.content,
          timestamp: new Date().getTime(),
          messageId: response.data,
          id: response.data,
          senderType: 3, // 客服发送
          title: '客服消息', // 确保title为"客服消息"
          messageType: 2  // 确保messageType为2，表示客服消息
        }

        // 发送消息到WebSocket
        stompClient.value.publish({
          destination: "/app/service/" + selectedChat.value.userId,
          body: JSON.stringify(serviceMessage)
        });
      }

      // 更新本地消息列表
      const newMsg = {
        ...messageData,
        id: response.data,
        createTime: new Date().toISOString(),
        isOwn: messageData.title === '客服消息' // 客服消息显示在右边
      };
      chatMessages.value.push(newMsg);

      // 滚动到底部
      nextTick(() => {
        if (messageScrollbar.value) {
          const scrollElement = messageScrollbar.value.wrapRef
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      })
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('消息发送失败: ' + (error.message || '未知错误'))
  } finally {
    sendingReply.value = false
  }
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  
  // 如果是今天，只显示时分
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // 如果是今年，显示月日时分
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + 
           date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // 其他情况显示完整日期
  return date.toLocaleString('zh-CN')
}

// 计算属性：过滤后的聊天列表
const filteredChats = computed(() => {
  if (!searchQuery.value) {
    // 按用户去重，保留每个用户的最新消息
    const userMap = new Map()
    messages.value.forEach(msg => {
      // 确保用户信息存在
      if (msg.userId) {
        if (!userMap.has(msg.userId) || new Date(msg.createTime) > new Date(userMap.get(msg.userId).createTime)) {
          // 添加用户名称和头像信息
          userMap.set(msg.userId, {
            ...msg,
            userName: msg.userName || `用户${msg.userId}`,
            userAvatar: msg.userAvatar || 'https://example.com/default-avatar.png'
          })
        }
      }
    })
    return Array.from(userMap.values())
  }
  
  return messages.value.filter(chat => 
    (chat.userName && chat.userName.includes(searchQuery.value)) || 
    (chat.content && chat.content.includes(searchQuery.value))
  )
})

// 页面加载时获取数据
onMounted(() => {
  fetchMessages()
  connectWebSocket()
})

// 组件卸载时断开WebSocket连接
onUnmounted(() => {
  if (stompClient.value) {
    stompClient.value.deactivate()
  }
})
</script>

<style scoped>
.chat-app {
  display: flex;
  height: calc(100vh - 60px);
  width: 100%;
  background: #f5f7fa;
  font-size: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chat-sidebar {
  width: 30%;
  border-right: 1px solid #ebeef5;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.chat-sidebar .el-input {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.chat-window {
  width: 70%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-window.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #909399;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.chat-title {
  font-size: 17px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  margin: 15px 0;
  max-width: 80%;
  position: relative;
}

.message.from-user {
  margin-right: auto;
  text-align: left;
}

.message.from-me {
  margin-left: auto;
  text-align: right;
}

.message-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 8px;
  background: #f0f0f0;
  word-wrap: break-word;
}

.message.from-user .message-content {
  background: #f0f0f0;
  color: #333;
}

.message.from-me .message-content {
  background: #409eff;
  color: white;
}

.message-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 8px;
  word-wrap: break-word;
  margin: 5px 0;
}

.message-time {
  font-size: 11px;
  color: #666;
  text-align: center;
  margin-top: 3px;
}

.message.from-user .message-content {
  background: #f0f0f0;
  color: #333;
  border-radius: 8px 8px 8px 4px;
}

.message.from-me .message-content {
  background: #409eff;
  color: white;
  border-radius: 8px 8px 4px 8px;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-input .el-textarea {
  flex: 1;
}

.chat-input .el-button {
  align-self: flex-end;
}

.chat-name {
  margin-left: 10px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  float: right;
  font-size: 12px;
  color: #999;
  margin-right: 10px;
}

.item {
  margin-right: 5px;
}

:deep(.el-menu) {
  border: none;
}

:deep(.el-menu-item) {
  height: auto;
  line-height: normal;
  padding: 15px 20px;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
}
</style>