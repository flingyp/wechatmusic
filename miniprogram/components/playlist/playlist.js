Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object
    }
  },
  /**
   * 组件的监听器
   */
  observers: {
    ['playlist.playCount'](count) {
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },
 
  
  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _tranNumber(num, point) {
      // 把小数点后面的省去
      let numStr = num.toString().split('.')[0]
      if(numStr.length < 6) {
        // 表示播放量在 十万 以内
        return numStr
      } else if(numStr.length >=6 && numStr.length <=8) {
        // 表示播放量在 十万 以外 千万 以内
        // 小数部分
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万'
      } else if(numStr.length > 8) {
        // 表示播放量在 亿 以外
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point) 
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
      }
    }
  }
})
