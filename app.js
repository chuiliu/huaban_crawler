var http = require('http');
var fs = require('fs');

var url = 'http://huaban.com/boards/25498000/?iwlq03e7&max=580817693&limit=100&wfl=1';
// var url = 'http://huaban.com/boards/33147249/?iwkskixs&max=930057654&limit=20&wfl=1';
var imageUrlBase = 'http://img.hb.aicdn.com/';

// 获取花瓣网数据
var fetchData = function(html) {

    // 取到画板数据
    var board = /(app\.page\["board"\]).*};/.exec(html)[0];
    board = board.substring(17, board.length - 1).trim().substring(1);
    board = JSON.parse(board);

    // 画板照片数量
    var count = board.pin_count;
    console.log('照片数量: ' + count);
    // 照片
    // console.log(board)
    // console.log(board.pins);
    console.log('即将下载' + board.pins.length + '张图片');

    // 创建文件夹
    var downloadPath = 'download/' + board.board_id + '/';
    if(!fs.existsSync(downloadPath)) {
         fs.mkdirSync(downloadPath);
    }

    var i = 0;
    board.pins.forEach(function(item, index) {
        var imgUrl =  imageUrlBase + item.file.key;
        var types = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/gif': '.gif'
        };
        var filename = item.file.id + (types[item.type] || '.jpg');
        var ws = fs.createWriteStream(downloadPath + filename);
        ws.on('finish', function() {
            console.log('已下载：'+ (++i) + '张, ' + filename + ' 下载完成');
        });

        http.get(imgUrl, function(res) {
            res.pipe(ws);
        }).on('error', function() {
            console.log('error');
        });
    });


};




// 爬取数据
http.get(url, function(res) {
    var html = '';

    res.on('data', function(data) {
        html += data;
    });

    res.on('end', function() {
        // console.log(html);
        fetchData(html);
    });
}).on('error', function() {
    console.log('error');
});
