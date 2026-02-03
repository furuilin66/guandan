const app = getApp()

Page({
  data: {
    teamName: '',
    rounds: ['第1轮', '第2轮', '第3轮'],
    roundIndex: 0,
    opponentName: '',
    teams: [],
    opponentIndex: -1,
    levels: [
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 },
      { label: '8', value: 8 },
      { label: '9', value: 9 },
      { label: '10', value: 10 },
      { label: 'J', value: 11 },
      { label: 'Q', value: 12 },
      { label: 'K', value: 13 },
      { label: 'A', value: 14 }
    ],
    selectedLevel: null,
    isEditingTeam: false,
    newTeamName: '',
    matchHistory: []
  },

  onLoad() {
    if (!app.globalData.teamId) {
      wx.redirectTo({ url: '/pages/index/index' })
      return;
    }
    this.setData({
      teamName: app.globalData.teamName
    })
    this.fetchTeams();
    this.fetchMatchHistory();
  },

  fetchTeams() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/teams`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          // Filter out current team from opponent list
          const opponents = res.data.filter(t => t.teamId !== app.globalData.teamId);
          this.setData({
            teams: opponents
          });
        }
      }
    })
  },

  fetchMatchHistory() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/matches/team/${app.globalData.teamId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const matches = res.data.matches.sort((a, b) => a.round - b.round);
          this.setData({
            matchHistory: matches
          });
        }
      }
    })
  },

  handleRefreshTeams() {
    this.fetchTeams();
    wx.showToast({ title: '已刷新对手列表', icon: 'none' });
  },

  handleLogout() {
    app.globalData.teamId = null;
    app.globalData.teamName = null;
    wx.removeStorageSync('teamInfo');
    wx.reLaunch({ url: '/pages/index/index' });
  },

  bindRoundChange(e) {
    this.setData({
      roundIndex: e.detail.value
    })
  },

  bindOpponentPickerChange(e) {
    const index = e.detail.value;
    const selectedOpponent = this.data.teams[index];
    this.setData({
      opponentIndex: index,
      opponentName: selectedOpponent.teamName
    })
  },

  selectLevel(e) {
    this.setData({
      selectedLevel: e.currentTarget.dataset.value
    })
  },

  handleSubmit() {
    const { roundIndex, opponentName, selectedLevel } = this.data;
    if (!selectedLevel) {
      wx.showToast({ title: '请选择本局得分', icon: 'none' });
      return;
    }
    if (!opponentName) {
      wx.showToast({ title: '请选择对手队伍', icon: 'none' });
      return;
    }

    const round = parseInt(roundIndex) + 1;

    wx.showLoading({ title: '提交中...' });

    wx.request({
      url: `${app.globalData.apiBaseUrl}/matches/record`,
      method: 'POST',
      data: {
        teamId: app.globalData.teamId,
        round,
        opponentName,
        level: selectedLevel
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.success) {
          wx.showToast({
            title: `提交成功! 得分:${res.data.score}`,
            icon: 'success'
          });
          // Clear form
          this.setData({
            opponentName: '',
            opponentIndex: -1,
            selectedLevel: null
          });
          // Refresh match history
          this.fetchMatchHistory();
        } else {
          wx.showToast({
            title: res.data.error || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    })
  },

  goToLeaderboard() {
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    })
  },

  // Edit Team Name functions
  handleEditTeamName() {
    this.setData({
      isEditingTeam: true,
      newTeamName: this.data.teamName
    });
  },

  bindNewTeamNameInput(e) {
    this.setData({
      newTeamName: e.detail.value
    });
  },

  cancelEditTeam() {
    this.setData({
      isEditingTeam: false
    });
  },

  saveTeamName() {
    const { newTeamName } = this.data;
    if (!newTeamName || !newTeamName.trim()) {
      wx.showToast({ title: '队伍名称不能为空', icon: 'none' });
      return;
    }
    
    if (newTeamName === this.data.teamName) {
      this.cancelEditTeam();
      return;
    }

    wx.showLoading({ title: '修改中...' });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/teams/${app.globalData.teamId}`,
      method: 'PUT',
      data: { teamName: newTeamName },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // Update global data and local storage
          app.globalData.teamName = newTeamName;
          const teamInfo = wx.getStorageSync('teamInfo');
          if (teamInfo) {
            teamInfo.teamName = newTeamName;
            wx.setStorageSync('teamInfo', teamInfo);
          }
          
          this.setData({
            teamName: newTeamName,
            isEditingTeam: false
          });
          
          wx.showToast({ title: '修改成功', icon: 'success' });
        } else {
          wx.showToast({
            title: res.data.error || '修改失败',
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
