var http = require('http');
var fs = require('fs');
var async = require('async');


var url = 'http://huaban.com/boards/25498000/?iwlq03e8&max=780917693&limit=101&wfl=1';  // 宫崎骏
// var url = 'http://huaban.com/boards/2502601/?ip2ptxup&max=31059796&limit=70&wfl=1';     // 动物
var imageUrlBase = 'http://img.hb.aicdn.com/';
var downloadPath = 'download/';

// 获取花瓣网数据
var fetchData = function(html) {

    console.log('开始抓取花瓣网数据');

    // 取到画板数据
    var board = /(app\.page\["board"\]).*};/.exec(html)[0];
    board = board.substring(17, board.length - 1).trim().substring(1);
    board = JSON.parse(board);

    // 画板照片数量
    var count = board.pin_count;
    console.log('画板照片数量: ' + count);
    // 照片
    // console.log(board)
    console.log(board.pins);
    console.log('即将下载' + board.pins.length + '张图片');

    // 创建文件夹
    downloadPath += board.board_id + '/';
    if(!fs.existsSync(downloadPath)) {
         fs.mkdirSync(downloadPath);
    }

    async.mapLimit(board.pins, 3, function(item, callback) {
            var imgUrl =  imageUrlBase + item.file.key;
            var types = {
                'image/png': '.png',
                'image/jpeg': '.jpg',
                'image/bmp': '.bmp',
                'image/gif': '.gif'
            };
            console.log(item.file.type);
            var filename = item.file.id + (types[item.file.type] || '.jpg');

            download(imgUrl, filename, callback);
        }, function (err, result) {
            console.log('完成情况：' + result);
        }
    );
};


// 下载
var download = function(imgUrl, filename, callback) {
    var filePath = downloadPath + filename;
    if (fs.existsSync(filePath)) {
        console.log('文件 ' + filePath + ' 已存在');
        callback(null, '文件已存在');
    } else {
        var ws = fs.createWriteStream(filePath);
        ws.on('finish', function() {
            console.log('' + filename + ' 已下载');
            callback(null, filename + '下载成功');
        });

        http.get(imgUrl, function(res) {
            res.pipe(ws);
        }).on('finish', function() {
            console.log('请求完成: ', imgUrl);
        }).on('error', function() {
            console.log('error');
        });
    }
};




// 爬取数据
http.get(url, function(res) {
    var html = '';

    res.on('data', function(data) {
        html += data;
    });

    res.on('end', function() {
        fetchData(html);
    });
}).on('error', function() {
    console.log('error');
});
