// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {OPENID} = cloud.getWXContext()

  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    pages: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      thing1: {
        value: '云开发',
      },
      thing4: {
        value: event.content
      }
    },
    templateId: 'MeaHXRxfDMqtwtEoxVEAz-S0o94Zzk5R01lsLKflv64',
    formId: event.formId
  })
  return result
}