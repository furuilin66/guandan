const app = getApp()

Page({
  data: {
    rankings: []
  },

  onShow() {
    this.fetchLeaderboard();
  },

  onPullDownRefresh() {
    this.fetchLeaderboard(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchLeaderboard(cb) {
    wx.showLoading({ title: '加载中...' });

    wx.request({
      url: `${app.globalData.apiBaseUrl}/matches/leaderboard`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.rankings) {
          const rankings = res.data.rankings.map(item => ({
            ...item,
            showDetail: false
          }));
          this.setData({ rankings });
        } else {
          wx.showToast({
            title: '获取排行榜失败',
            icon: 'none'
          });
        }
        if (cb) cb();
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        if (cb) cb();
      }
    });
  },

  toggleDetail(e) {
    const index = e.currentTarget.dataset.index;
    const rankings = this.data.rankings;
    rankings[index].showDetail = !rankings[index].showDetail;
    this.setData({ rankings });
  },

  exportToExcel() {
    wx.showLoading({ title: '生成中...' });
    
    // Download file from backend
    wx.downloadFile({
      url: `${app.globalData.apiBaseUrl}/matches/leaderboard/export`,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const filePath = res.tempFilePath;
          
          // Open document
          wx.openDocument({
            filePath: filePath,
            showMenu: true, // Enable sharing menu
            fileType: 'xlsx',
            success: function () {
              console.log('Open document success');
            },
            fail: function (err) {
              console.error('Open document fail', err);
              wx.showToast({
                title: '打开文件失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '导出失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('Download fail', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
})
