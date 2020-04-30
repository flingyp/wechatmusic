// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  externalClasses: [
    'iconfont', 'icon-pinglun', 'icon-fenxiang'
  ],

  /**
   * 组件的初始数据
   */
  data: {
    // 登录组件是否显示
    loginShow: false,
    // 底部弹出层是否显示
    modalShow: false,
    // 评论的内容
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      // 判断用户是否授权
      wx.getSetting({
        success: res => {
          console.log(res)
          if(res.authSetting['scope.userInfo']) {
            // 授权了
            wx.getUserInfo({
              success: res => {
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true
                })
              }
            })
          } else {
            // 未授权 显示 获取微信授权消息 
            this.setData({
              loginShow: true
            })
          }
        },
      })
    }, 

    onLoginsuccess() {
      // 授权框消失 评论框显示
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },

    onLoginfail() {
      wx.showModal({
        title: '授权用户才能评论',
        content: ''
      })
    },
  }
})
