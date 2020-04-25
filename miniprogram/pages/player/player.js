let musiclist = []
// 正在播放歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    // false 表示不播放 true 表示正在播放
    isPlaying: false,
    // 表示当前歌词是否显示
    isLyricShow: false,
    lyric: '',
    isSame: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    musiclist = wx.getStorageSync('musiclist')
    nowPlayingIndex = options.index
    this._loadMusicDetail(options.musicid)
  },

  _loadMusicDetail(musicid) {
    if(musicid == app.getPlayMusciId()) {
      this.setData({
        isSame: true
      })
    }else {
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame) {
      backgroundAudioManager.stop()
    }
    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title: music.name
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    app.setPlayMusicId(musicid)

    wx.showLoading({
      title: '歌曲加载中',
    })

    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicid,
        $url: 'musicUrl'
      }
    }).then(res => {
      let result = JSON.parse(res.result)
      if(result.data[0].url == null) {
        wx.showToast({
          title: '暂无音源',
        })
        return
      }
      if(!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
      }

      this.setData({
        isPlaying: true
      })
      wx.hideLoading()

      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicid,
          $url: 'lyric'
        }
      }).then(res => {
        console.log(res)
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },

  togglePlaying() {
    // 表示正在播放
    if(this.data.isPlaying) {
      // 暂停音乐
      backgroundAudioManager.pause()
    } else {
      // 播放音乐
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  // 上一首
  onPrev() {
    nowPlayingIndex -- 
    if(nowPlayingIndex<0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  //下一首
  onNext() {
    nowPlayingIndex ++ 
    if(nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdate(event) {
    // 把 progress-bar 组件 的 currentTime 传递到 lyric 组件
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  onPlay() {
    this.setData({
      isPlaying: true
    })
  },
  onPause(){
    this.setData({
      isPlaying: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})