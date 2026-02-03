Page({
  data: {
    password: ''
  },

  onLoad() {
    // Check if already authenticated
    const hasAccess = wx.getStorageSync('hasAccess');
    if (hasAccess) {
      wx.redirectTo({
        url: '/pages/index/index'
      });
    }
  },

  bindPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  handleLogin() {
    const { password } = this.data;
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    if (password === '123456') {
      wx.setStorageSync('hasAccess', true);
      wx.showToast({
        title: '验证成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }, 1000);
    } else {
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      });
    }
  }
})
