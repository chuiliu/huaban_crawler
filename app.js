var http = require('http'),
    fs = require('fs'),
    async = require('async');

// 画板ID
var boardId = '16135155';
var url = 'http://huaban.com/boards/' + boardId + '/?ip44g0nc&max=&limit=20&wfl=1';


var imageUrlBase = 'http://img.hb.aicdn.com/',
// 下载本地路径
    downloadPath = 'download/',
// 保存所有图片
    images = [],
// 图片类型
    imagesTypes = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/bmp': '.bmp',
        'image/gif': '.gif',
        'image/x-icon': '.ico',
        'image/tiff': '.tif',
        'image/vnd.wap.wbmp': '.wbmp'
    };


/**
 * 获取花瓣网数据
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
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
            var board = getBoardObj(html);

            var pins = board.pins;
            images = images.concat(pins);

            // 画板图片总数量
            var count = board.pin_count;
            console.log('已抓取到' + board.pins.length + '张图片的地址');

            if (images.length == count || pins.length == 0) {
                // 停止抓取
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


/**
 * 取到画板数据
 * @return {[type]} [description]
 */
var getBoardObj = function(html) {
    var board = /(app\.page\["board"\]).*};/.exec(html)[0];
    board = board.substring(17, board.length - 1).trim().substring(1);

    return JSON.parse(board);
};


/**
 * 加载更多
 * @param  {[type]} url [当前url]
 * @return {[type]}     [description]
 */
var loadMore = function(url) {
    var nextUrl = url.replace(/max=\d*&/, 'max=' + images[images.length - 1].pin_id + '&');
    fetchData(nextUrl, downloadAll);
};


var downloadAll = function() {
    // 创建名为画板ID的文件夹
    downloadPath += images[0].board_id + '/';
    if(!fs.existsSync(downloadPath)) {
         fs.mkdirSync(downloadPath);
    }

    async.mapLimit(images, 3, function(image, callback) {
        // 下载
        download(image, callback);
    }, function (err, result) {
        console.log('下载完成情况：' + result);
    });
};


/**
 * 下载图片
 * @param  {[type]}   image    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var downloadCount = 0;
var download = function(image, callback) {

    var imgUrl =  imageUrlBase + image.file.key;
    var filename = image.file.id + (imagesTypes[image.file.type] || '.jpg');
    var filePath = downloadPath + filename;

    if (fs.existsSync(filePath)) {
        console.log('图片 ', filePath, ' 已存在');
        ++downloadCount;
        callback(null, '图片已存在');
    } else {
        var ws = fs.createWriteStream(filePath);
        ws.on('finish', function() {
            console.log('' , filename, ' 已下载，总下载进度', 100 * (++downloadCount / images.length).toFixed(2), '%');
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



// begin
fetchData(url, downloadAll);
