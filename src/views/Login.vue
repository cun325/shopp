<template>
  <div class="full-login-container">
    <!-- 左侧：Logo + 图片 + 标语 -->
    <div class="left-section">
      <!-- 头部 Logo -->
      <div class="login-header">
        <img :src="logoSrc" alt="logo" />
        <span>鲜果云销</span>
      </div>

      <!-- 图片展示 -->
      <div class="image-section">
        <img :src="fruitsSrc" alt="Fruits" class="fruits-image" loading="lazy" />
      </div>

      <!-- 标语 -->
      <div class="slogan-section">让生鲜管理更简单</div>
    </div>

    <!-- 右侧：登录表单区域 -->
    <div class="right-section">
      <div class="form-container">
        <div class="logo-cloud">
          <img src="@/assets/cloud.png" alt="cloud logo" />
        </div>
        <h2>欢迎登录</h2>
        <p>鲜果云销管理系统</p>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <div class="icon"><i class="fas fa-user"></i></div>
            <input
              type="text"
              v-model="phonenum"
              placeholder="手机号"
              required
              pattern="\d{11}"
              title="请输入11位手机号码"
            />
          </div>
          <div class="input-group">
            <div class="icon"><i class="fas fa-shield-alt"></i></div>
            <input type="text" v-model="code" placeholder="请输入验证码" required />
            <button
              type="button"
              class="captcha-btn"
              :disabled="isSending || !isPhoneNumberValid"
              @click="sendVerificationCode"
            >
              {{ isSending ? `${countdown}秒后重发` : "获取验证码" }}
            </button>
          </div>
          <button type="submit" class="login-btn">登录</button>
        </form>

        <div class="security-info">
          <i class="fas fa-shield-alt"></i> 本网站采用SSL加密传输，保障您的信息安全
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      logoSrc: require("@/assets/logo2.png"),
      fruitsSrc: require("@/assets/sg.png"),
      phonenum: "",
      code: "",
      isSending: false,
      countdown: 60,
      mockCode: "", // 模拟的验证码
    };
  },
  computed: {
    isPhoneNumberValid() {
      return /^\d{11}$/.test(this.phonenum);
    },
  },
  methods: {
    async handleLogin() {
      if (!this.isPhoneNumberValid) {
        alert("请输入正确的11位手机号");
        return;
      }

      if (this.code === this.mockCode) {
        alert("登录成功！");
        this.$router.push("/index"); // 跳转到首页
      } else {
        alert("验证码错误，请重新输入");
      }
    },

    sendVerificationCode() {
      if (!this.isPhoneNumberValid) {
        alert("请输入正确的11位手机号");
        return;
      }

      this.isSending = true;

      // 模拟生成一个随机验证码
      this.mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`模拟验证码已生成：${this.mockCode}`); // 控制台输出，便于调试

      alert(`验证码已发送（模拟值为：${this.mockCode}），请注意查收`);

      // 倒计时逻辑
      let timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
          this.isSending = false;
          this.countdown = 60;
        }
      }, 1000);
    },
  },
};
</script>

<style scoped>
.full-login-container {
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  height: 100vh;
  background-color: #f9f9f9;
  width: 100%;
}

.left-section {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #e6ffe6 0%, #fff8e6 100%);
  padding: 40px;
}

.right-section {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  background-color: #fff;
}

.login-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.login-header img {
  height: 50px;
  margin-right: 10px;
}

.login-header span {
  font-size: 24px;
  font-weight: bold;
}

.image-section {
  width: 100%;
  max-width: 500px;
  margin-bottom: 30px;
}

.image-section img {
  width: 100%;
  height: auto;
}

.slogan-section {
  font-size: 24px;
  color: #333;
  text-align: center;
}

.form-container {
  max-width: 400px;
  margin: auto;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.logo-cloud {
  margin-bottom: 20px;
}

.logo-cloud img {
  width: 100px;
}

.form-container h2 {
  margin-bottom: 10px;
}

.form-container p {
  color: #666;
  margin-bottom: 30px;
}

.input-group {
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.input-group input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
}

.captcha-btn {
  width: 40%;
  margin-left: 10px;
  padding: 10px 20px;
  background-color: green;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.captcha-btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: green;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: darkgreen;
}

.security-info {
  margin-top: 20px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .full-login-container {
    flex-direction: column;
  }

  .left-section,
  .right-section {
    width: 100%;
  }

  .image-section {
    max-width: 300px;
  }
}
</style>
