// 输入文字最多个数
const MAX_WORDS_NUM = 140
// 最大上传图片的数量
const MAX_IMG_NUM = 9

const db = wx.cloud.database()
// 当前输入的文字内容
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true
  },

  onInput(event) {
    // console.log(event)
    let wordsNum = event.detail.value.length
    if(wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  // textarea 获取焦点时触发
  onFocus(event) {
    // event.detail.height 是键盘的高度 模拟器时获取的高度为0
    this.setData({
      footerBottom: event.detail.height
    })
  },
  // textarea 失去焦点时触发
  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },
  // 选择图片
  onChooseImage() {
    let max = MAX_WORDS_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 选择图片后 还能选择几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <=0 ? false : true
        })
      },
    })
  },
  // 删除图片
  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if(this.data.images.length < MAX_IMG_NUM) {
      this.setData({
        selectPhoto: true
      })
    }
  },
  // 阅览图片
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  // 发布
  send() {
    if(content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        mask: true
      })
      return
    }

    wx.showLoading({
      title: '正在发布中',
    })

    let promiseArr = []
    let fileIds = []
    // 图片上传 1.图片存储到云存储上
    for(let i = 0, len=this.data.images.length; i<len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item,
          success: (res) => {
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 存入到云数据库中
    Promise.all(promiseArr).then(res => {
      db.collection('blog').add({
        data: {
          // 输入的内容
          content,
          // 图片的fileid
          img: fileIds,
          // 用户信息
          ...userInfo,
          createTime: db.serverDate() // 服务端的时间
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回blog页面 并且刷新
        wx.navigateBack() 
        const pages = getCurrentPages()
        const prevPage = pages[(pages.length) - 2]
        prevPage.onPullDownRefresh()
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
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