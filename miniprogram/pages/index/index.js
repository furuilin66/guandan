const app = getApp()

Page({
  data: {
    teamName: '',
    teams: [],
    teamsIndex: -1,
    isResetModalOpen: false,
    resetPassword: ''
  },

  onLoad() {
    // Check for access permission first
    const hasAccess = wx.getStorageSync('hasAccess');
    if (!hasAccess) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    if (app.globalData.teamId) {
      wx.redirectTo({
        url: '/pages/record/record'
      })
      return;
    }
    this.fetchTeams();
  },

  fetchTeams() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/teams`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            teams: res.data
          });
        }
      }
    })
  },

  bindTeamNameInput(e) {
    this.setData({
      teamName: e.detail.value,
      teamsIndex: -1 // Reset picker selection if user types
    })
  },

  onTeamPickerChange(e) {
    const index = e.detail.value;
    const selectedTeam = this.data.teams[index];
    this.setData({
      teamsIndex: index,
      teamName: selectedTeam.teamName
    })
  },

  handleLogin() {
    const { teamName } = this.data;
    if (!teamName) {
      wx.showToast({
        title: '请输入队伍名称',
        icon: 'none'
      })
      return;
    }
    this.doLogin(teamName);
  },

  doLogin(teamName) {
    wx.showLoading({ title: '登录中...' })
    wx.request({
      url: `${app.globalData.apiBaseUrl}/teams/login`,
      method: 'POST',
      data: { teamName },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const { teamId, teamName: name } = res.data;
          app.globalData.teamId = teamId;
          app.globalData.teamName = name;
          wx.setStorageSync('teamInfo', { teamId, teamName: name });
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/record/record'
            })
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.error || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  goToLeaderboard() {
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    })
  },

  // Reset Data functions
  handleResetData() {
    this.setData({
      isResetModalOpen: true,
      resetPassword: ''
    });
  },

  bindResetPasswordInput(e) {
    this.setData({
      resetPassword: e.detail.value
    });
  },

  cancelReset() {
    this.setData({
      isResetModalOpen: false,
      resetPassword: ''
    });
  },

  confirmReset() {
    const { resetPassword } = this.data;
    if (!resetPassword) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '重置中...' });

    wx.request({
      url: `${app.globalData.apiBaseUrl}/auth/reset`,
      method: 'POST',
      data: { password: resetPassword },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({ title: '重置成功', icon: 'success' });
          this.setData({
            isResetModalOpen: false,
            teams: [],
            teamName: '',
            teamsIndex: -1
          });
          // Refresh teams list (should be empty now)
          this.fetchTeams();
        } else {
          wx.showToast({
            title: res.data.error || '重置失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    })
  }
})
