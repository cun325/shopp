<template>
  <div class="full-login-container">
    <!-- 左侧：Logo + 图片 + 标语 -->
    <div class="left-section">
      <div class="login-header">
        <img :src="logoSrc" alt="logo" />
        <span>鲜果云销</span>
      </div>
      <div class="image-section">
        <img :src="fruitsSrc" alt="Fruits" class="fruits-image" loading="lazy" />
      </div>
      <div class="slogan-section">让鲜果管理更简单</div>
    </div>

    <!-- 右侧：登录表单区域 -->
    <div class="right-section">
      <div class="form-card">
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
          <div class="input-group captcha-group">
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
      this.mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`模拟验证码已生成：${this.mockCode}`);
      alert(`验证码已发送（模拟值为：${this.mockCode}），请注意查收`);
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
  width: 100vw;
  background: #f5f6fa;
}
.left-section {
  width: 50%;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #e6ffe6 0%, #fff8e6 100%);
  padding: 0 32px;
  text-align: center;
}
.login-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  justify-content: flex-start;
  margin-left: -20px;
}
.login-header img {
  height: 54px;
  margin-right: 12px;
}
.login-header span {
  font-size: 28px;
  font-weight: bold;
  color: #2d3a4b;
  margin-right: 0;
}
.image-section {
  width: 220%;
  max-width: 500px;
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
  margin-left: -20px;
}
.image-section img {
  width: 180%;
  height: auto;
  border-radius: 17px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
.slogan-section {
  font-size: 22px;
  color: #333;
  text-align: center;
  margin-top: 16px;
  font-weight: 500;
  width: 100%;
}
.right-section {
  width: 50%;
  min-width: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.form-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  padding: 40px 32px 32px 32px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo-cloud {
  margin-bottom: 18px;
}
.logo-cloud img {
  width: 80px;
}
.form-card h2 {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: bold;
  color: #222;
}
.form-card p {
  color: #666;
  margin-bottom: 28px;
}
.input-group {
  position: relative;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
}
.input-group input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  outline: none;
  font-size: 16px;
  background: #f8f9fb;
  transition: border 0.2s;
}
.input-group input:focus {
  border: 1.5px solid #4fc08d;
}
.captcha-group {
  display: flex;
  align-items: center;
}
.captcha-group input {
  flex: 1;
  margin-right: 10px;
}
.captcha-btn {
  height: 40px;
  padding: 0 18px;
  background-color: #4fc08d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  white-space: nowrap;
  transition: background 0.2s;
  font-weight: 500;
}
.captcha-btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #4fc08d;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 17px;
  margin-top: 22px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.login-btn:hover {
  background-color: #3ca97a;
}
.security-info {
  margin-top: 22px;
  font-size: 13px;
  color: #888;
  text-align: center;
}
@media (max-width: 900px) {
  .full-login-container {
    flex-direction: column;
  }
  .left-section,
  .right-section {
    width: 100%;
    min-width: 0;
    padding: 32px 0;
  }
  .form-card {
    padding: 32px 12px 24px 12px;
  }
}
@media (max-width: 600px) {
  .form-card {
    max-width: 98vw;
    padding: 18px 2vw 12px 2vw;
  }
  .image-section {
    max-width: 90vw;
  }
  .login-header span {
    font-size: 20px;
  }
}
</style>
