let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String
  },

  observers: {
    lyric(lrc) {
      console.log(lrc)
      if(lrc == '暂无歌词') {
        this.setData({
          lrcList: [
            {
              lrc,
              time: 0,
            }
          ],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, // 当前选中的歌词索引
    scrollTop: 0       // 滚动条滚动的高度
  },

  lifetimes: {
    ready() {
      this._getLyricHeight()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      console.log(currentTime)
      let lrcList = this.data.lrcList
      if(lrcList.length == 0) {
        return
      }
      if(currentTime > lrcList[lrcList.length-1].time) {
        if(this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }

      for(let i=0, len=lrcList.length; i<len; i++) {
        if(currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i-1,
            scrollTop: (i-1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      // console.log(line)
      let _lrcList = []
      line.forEach(elem => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time != null) {
          // 每一句歌词
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间 转换为 秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    },

    _getLyricHeight() {
      if(this.data.isLyricShow) {
        setTimeout(() => {
          // 返回 SelectorQuery 实例对象
          const query = this.createSelectorQuery()
          query.select('.lyric').boundingClientRect()
          // 高 的 值 可在rect 中获取
          query.exec(rect => {
            lyricHeight = rect[0].height
          })
        }, 2000);
      }
    }
  }
})
