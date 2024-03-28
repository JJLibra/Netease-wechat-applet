// pages/musicList/musicList.js
Page({
    data: {
        // 轮播图数据列表
        lunboList:['http://p1.music.126.net/yzXXm4gz96ZDr-6daB-UKA==/109951168614611102.jpg','http://p1.music.126.net/KjeBcU7ouJT8gkN0m8tQTw==/109951168614613394.jpg','http://p1.music.126.net/Xyt67XYPVLODxu0GmBnttQ==/109951168614645370.jpg','http://p1.music.126.net/Pql6jt-xzDmPvl1e0L03qA==/109951168614633089.jpg','http://p1.music.126.net/xnm-NScMfg6Q8F-MJ6_CVg==/109951168616137419.jpg'],
        // 音乐列表数据列表
        musicList:[],
        picUrl:[],
        idList:[],
        // 关键词
        keyword:'',
        // 列表显示音乐数目
        musicLimit:6,
        search_flag:true
    },
    // 生命周期
    // 下拉加载数据
    onReachBottom:function () {
        var limit=this.data.musicLimit
        var keyword=this.data.keyword
        if(keyword!=""&&this.data.search_flag){
            limit+=5
            this.setData({
                musicLimit:limit
            })
            this.search()
        }
    },
    // 播放歌曲
    play:function(e) {
        // console.log(e)
        var musicid=e.currentTarget.dataset.id
        var idList=this.data.idList
        wx.navigateTo({
          url: '/pages/play/play?id=' + musicid + '&idList=' + idList,
        })    
    },
    // 搜索
    search:function () {
        this.setData({
            search_flag:false
        })
        var limit=this.data.musicLimit
        var keyword=this.data.keyword
        var basicdataSrc='https://music.163.com/api/search/get?s=' +keyword+ '&type=1&limit='+limit
        var that=this
        // 请求接口
        wx.request({
          url: basicdataSrc,
          success:function (res) {
            // console.log(res.data.result.songs)
            var songs=res.data.result.songs
            var musiclist=[]
            var idList=[]
            for(var i=0;i<limit;i++){
                var musicName=songs[i].name
                var author=songs[i].artists[0].name
                var id=songs[i].id
                idList.push(id)
                musiclist.push({
                    "musicName":musicName,
                    "author":author,
                    "id":id
                })
            }
            that.setData({
                idList:idList,
                musicList:musiclist
            })
            // 清空音乐列表
            that.setData({
                picUrl:[]
            })
            // that.showPicurl()，可以实现效果，但是存在bug
            // 通过id获取封面信息
            that.getPicture(that.data.idList,0,that.data.idList.length)
          },
          complete:function () {
              that.setData({
                  search_flag:true
              })
          }
        })
    },
    // 获取封面信息
    getPicture:function (idlist,i,length) {
        var pic=this.data.picUrl
        var that=this
        var pictureUrl='https://music.163.com/api/song/detail/?id='+idlist[i]+'&ids=['+idlist[i]+']'
        wx.request({
          url: pictureUrl,
          success:function (e) {
            //   console.log(e.data.songs[0].album.blurPicUrl)
              var img=e.data.songs[0].album.blurPicUrl
              pic.push(img)
              that.setData({
                picUrl:pic
              })
            //   递归条件
              if(++i<length){
                  that.getPicture(idlist,i,length)
              }
          }
        })
    },
    // 获取输入框keyword
    keychange:function (res) {
        // console.log(res)
        this.setData({
            keyword:res.detail.value,
            musicLimit:6
        })
    }
})