// pages/play/play.js
Page({
    // 页面初始信息
    data: {
        // 歌曲id
        musicID:"12345",
        idList:[],
        // 播放状态
        action:{
            "method":'pause'
        },
        // 唱片图片地址
        imgurl:'',
        // 歌名
        musicName:'',
        // 歌词列表
        lyricList:[],
        // 当前播放歌词的下标（索引）
        index:-1,
        // 歌词向上滚动
        top:0,
        short:true,
        long:true,
        medium:true,
        // 模式转换
        mode:'loop',
        // 进度条时间跟踪
        beginTime:'00:00',
        endTime:'03:30',
        maxTime:0,
        playtime:0
    },
    // 生命周期
    onLoad(options) {
        // console.log(options.idList)
        var idlist=options.idList.split(',')
        // console.log(idlist)
        this.setData({
            musicID:options.id,
            idList:idlist
        })
        // 获取唱片信息
        this.musicShow()
        this.lyricShow()
    },
    // 播放资源请求
    // 请求唱片图片、歌名
    musicShow:function () {
        var position='https://music.163.com/api/song/detail/?id=' + this.data.musicID + '&ids=[' + this.data.musicID + ']'
        var that=this
        wx.request({
          url: position,
          success:function (res) {
            //   console.log(res)
              var picture_src=res.data.songs[0].album.blurPicUrl
              var name=res.data.songs[0].name
              that.setData({
                  musicName:name,
                  imgurl:picture_src
              })
          }
        })
    },
    // 请求歌词列表，并做拆分
    lyricShow:function () {
        var that=this
        var lyric_position='https://music.163.com/api/song/lyric?os=pc&id=' + this.data.musicID + '&lv=-1&tv=-1'
        wx.request({
            url: lyric_position,
            success:function (e) {
                var data=e.data.lrc.lyric
                data=data.split('\n')
                // console.log(data)
                // 最终存放歌词的列表
                var lyricList=[]
                // 正则表达式 [01:16.310]
                var re=/\[\d{2}\:\d{2}\.\d{2,3}\]/
                for(var i=0;i<data.length;i++){
                    // 时间点索引
                    var date=data[i].match(re)
                    // console.log(date)
                    if(date != null){
                        // 时间点对应歌词
                        var lyricdata=data[i].replace(re,'')
                        lyricdata=lyricdata.trim()
                        // 时间节点
                        var timeStr=date[0]
                        if(timeStr != null && lyricdata != null && lyricdata != ''){
                            // 拆分时间点
                            var timeslice=timeStr.slice(1,-1)
                            var timestr=timeslice.split(':')
                            // 计算时间点在时间轴对应的秒数
                            var time=parseFloat(timestr[0])*60 + parseFloat(timestr[1])
                            lyricList.push([time,lyricdata])
                        }
                    }
                }
                // 存储到data中
                that.setData({
                    lyricList:lyricList,
                    // 歌词滚动清零
                    top:0
                })
            }
        })
    },
    // 歌词播放
    timechange:function (res) {
        var that=this
        var playtime=res.detail.currentTime
        var timeList=this.data.lyricList
        var preindex=that.data.index
        for(var i=0;i<timeList.length-1;i++){
            // 判断区间
            if( timeList[i][0] < playtime && playtime < timeList[i+1][0] ){
                // console.log(timeList[i][1])
                // 添加到index中
                that.setData({
                    index:i
                })
            }
        }
        // 进度条跟踪
        // console.log(res.detail.duration)
        // 总时间
        var totalTime=res.detail.duration
        var totalMin=Math.floor(totalTime/60)
        var totalSecond=Math.floor(totalTime%60)
        // 个位数补零
        if(totalMin<10){
            totalMin='0'+totalMin
        }
        if(totalSecond<10){
            totalSecond='0'+totalSecond
        }
        // 当前时间点跟踪
        // console.log(playtime)
        var playtime_min=Math.floor(playtime/60)
        var playtime_snd=Math.floor(playtime)%60
        if(playtime_min<10){
            playtime_min='0'+playtime_min
        }
        if(playtime_snd<10){
            playtime_snd='0'+playtime_snd
        }
        // 格式化data中endTime和beginTime
        this.setData({
            endTime:totalMin+':'+totalSecond,
            beginTime:playtime_min+':'+playtime_snd,
            maxTime:totalTime,
            playtime:playtime
        })
        // 歌词跟踪滚动
        var index=that.data.index
        var lyricList=that.data.lyricList
        if(index==preindex) return
        else{
            if(index > 0){
                if(lyricList[index][1].length < 25 && lyricList[index+1][1].length < 25){
                    that.setData({
                        top:that.data.top+37.86,
                    })
                }
                if(lyricList[index][1].length >= 25 && lyricList[index+1][1].length >= 25){
                    that.setData({
                        top:that.data.top+60.71,
                    })
                }
                if(lyricList[index][1].length >= 25 && lyricList[index+1][1].length < 25){
                    that.setData({
                        top:that.data.top+49.285,
                    })
                }
                if(lyricList[index][1].length < 25 && lyricList[index+1][1].length >= 25){
                    that.setData({
                        top:that.data.top+49.285,
                    })
                }
            }
        }
    },
    // 播放暂停键
    pause:function () {
        if(this.data.action.method=='play'){
            // console.log('play')
            this.setData({
                action:{
                    "method":'pause'
                }
            })
        }else{
            this.setData({
                action:{
                    "method":'play'
                }
            })
        }
    },
    // 模式转换 图标的变换
    changemode:function () {
        if(this.data.mode=='loop'){
            this.setData({
                mode:'single'
            })
        }else{
            this.setData({
                mode:'loop'
            })
        }
    },
    // 模式实现
    reachMode:function () {
        var mode=this.data.mode
        // 单曲循环
        if(mode=='loop'){
            // 保持当前音乐id
            this.setData({
                musicID:this.data.musicID,
                action:{
                    method:'play'
                },
                // 歌词栏滚动清零
                top:0
            })
        }
        // 播放一次
        else{
            this.playNextmusic()
        }
    },
    // 播放下一首
    playNextmusic:function () {
        // 检索当前播放的id
        var id=this.data.musicID
        var idlist=this.data.idList
        var index=-1
        for(var i=0;i<idlist.length;i++){
            if(idlist[i]==id){
                index=i
                break
            }
        }
        if(index==idlist.length-1){
            this.setData({
                musicID:idlist[0]
            })
        }else{
            this.setData({
                musicID:idlist[index+1]
            })
        }
        // 更新播放状态
        this.setData({
            action:{
                method:'play'
            }
        })
        // 更新歌词、图片
        this.musicShow()
        this.lyricShow()
    },
    // 播放上一首
    playPrevmusic:function () {
        var id=this.data.musicID
        var idlist=this.data.idList
        var index=-1
        for(var i=0;i<idlist.length;i++){
            if(idlist[i]==id){
                index=i
                break
            }
        }
        if(index==0){
            this.setData({
                musicID:idlist[idlist.length-1]
            })
        }else{
            this.setData({
                musicID:idlist[index-1]
            })
        }
        // 更新播放状态
        this.setData({
            action:{
                method:'play'
            }
        })
        // 更新歌词、图片
        this.musicShow()
        this.lyricShow()
    },
    // 拖动进度条
    changePlaytime:function (sth) {
        // console.log(sth)
        var move=sth.detail.value
        this.setData({
            playtime:move,
            action:{
                method:'setCurrentTime',
                data:move
            }
        })
        this.setData({
            action:{
                method:'play'
            }
        })
    }
})