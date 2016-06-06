var http = require('http');
var fs = require('fs');
var async = require('async');


// var url = 'http://huaban.com/boards/25498000/?iwlq03e8&max=780917693&limit=1&wfl=1';  // 宫崎骏
var url = 'http://huaban.com/boards/16135147/?ip3ceizv&max=&limit=20&wfl=1';
var imageUrlBase = 'http://img.hb.aicdn.com/';
var downloadPath = 'download/';

// 保存所有图片
var images = [];

// 获取花瓣网数据
var fetchData = function(url, callback) {
    console.log('开始抓取花瓣网图片地址');

    // 爬取数据
    http.get(url, function(res) {
        var html = '';

        res.on('data', function(data) {
            html += data;
        });

        res.on('end', function() {
            // 取到画板数据
            var board = /(app\.page\["board"\]).*};/.exec(html)[0];
            board = board.substring(17, board.length - 1).trim().substring(1);
            board = JSON.parse(board);

            var pins = board.pins;
            images = images.concat(pins);
            console.log('最后一张的id', images[images.length - 1].pin_id);
            console.log('此时images长度', images.length);

            // 画板照片数量
            var count = board.pin_count;
            // console.log('画板照片总数量: ' + count);
            console.log('已抓取到' + board.pins.length + '张图片的地址');

            if (images.length == count || pins.length == 0) {
                // 不应该再继续抓取了
                console.log('抓取结束，即将下载' + images.length + '张图片');
                callback && callback();
                return;

            } else {
                // 加载更多
                loadMore(url);
            }
        });
    }).on('error', function() {
        console.log('error');
    });

};


var loadMore = function(url) {
    var nextUrl = url.replace(/max=\d*&/, 'max=' + images[images.length - 1].pin_id + '&');
    console.log('下一个地址', nextUrl);
    fetchData(nextUrl, todo);
};


var todo = function() {
    // 创建文件夹，文件夹名为画板ID
    downloadPath += images[0].board_id + '/';
    if(!fs.existsSync(downloadPath)) {
         fs.mkdirSync(downloadPath);
    }

    async.mapLimit(images, 3, function(item, callback) {

        var imgUrl =  imageUrlBase + item.file.key;
        var types = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/bmp': '.bmp',
            'image/gif': '.gif',
            'image/x-icon': '.ico',
            'image/tiff': '.tif',
            'image/vnd.wap.wbmp': '.wbmp'
        };
        // console.log(item.file.type);
        var filename = item.file.id + (types[item.file.type] || '.jpg');

        download(imgUrl, filename, callback);
    }, function (err, result) {
        console.log('完成情况：' + result);
    });
};


// 下载
var download = function(imgUrl, filename, callback) {
    var filePath = downloadPath + filename;
    if (fs.existsSync(filePath)) {
        console.log('图片 ' + filePath + ' 已存在');
        callback(null, '图片已存在');
    } else {
        var ws = fs.createWriteStream(filePath);
        ws.on('finish', function() {
            console.log('' + filename + ' 已下载');
            callback(null, filename + '下载成功');
        });

        http.get(imgUrl, function(res) {
            res.pipe(ws);
        }).on('finish', function() {
            console.log('http请求完成: ', imgUrl);
        }).on('error', function() {
            console.log('error');
        });
    }
};



fetchData(url, todo);
