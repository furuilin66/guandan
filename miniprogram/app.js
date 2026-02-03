App({
  globalData: {
    teamId: null,
    teamName: null,
    apiBaseUrl: 'http://1.15.149.170:3002/api' // Updated to LAN IP
  },
  onLaunch() {
    // Check local storage for login
    const teamInfo = wx.getStorageSync('teamInfo');
    if (teamInfo) {
      this.globalData.teamId = teamInfo.teamId;
      this.globalData.teamName = teamInfo.teamName;
    }
  }
})
