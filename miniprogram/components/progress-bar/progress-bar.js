// 可移动区域的宽度
let movableAreaWidth = 0
// 移动园点的宽度
let movableViewWidth = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 当前的秒数
let currentSec = -1
let duration = 0 
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0
  },

  lifetimes: {
    ready() {
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 拖动移动园点时
    onChange(event) {
      // console.log(event)
      // 拖动时
      if(event.detail.source == 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
      }
    },
    // 放开移动园点时
    onTouchEnd() {
      // console.log(backgroundAudioManager.currentTime)
      // 这一步没必要
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
    },

    _getMovableDis() {
      // 返回 SelectorQuery 实例对象 获取 .movable-area .movable-view 节点的宽度
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        console.log(movableAreaWidth, movableViewWidth)
      })
    },

    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('Pause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        // console.log('onCanplay')
        // 获取 音乐的总时长
        console.log(backgroundAudioManager.duration)
        if(typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          },1000)
        }
      })
      // 监听音频播放进度更新事件
      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        // 获取当前播放时间
        const currentTime = backgroundAudioManager.currentTime
        // 获取当前音乐的总时间
        const duration = backgroundAudioManager.duration
        const sec = currentTime.toString().split('.')[0]
        // 进行一次判断 减少在1s内 setData 的次数
        if(sec != currentSec) {
          const currentTimeFmt = this._dateFormat(currentTime)
          this.setData({
            movableDis:(movableAreaWidth - movableViewWidth) * currentTime / duration,
            progress: currentTime / duration * 100,
            ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
          })
          currentSec = sec
        }
      })

      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
      })

      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },
    // 设置 音乐时长
    _setTime() {
      duration = backgroundAudioManager.duration
      // 对 duration 进行格式化
      const durationFmt = this._dateFormat(duration)
      console.log(durationFmt)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      // 分钟
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    }, 

    // 补零操作
    _parse0(sec) {
      return sec < 10? '0' + sec: sec
    }
  }
})
