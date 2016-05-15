var http = require('http');
var cheerio = require('cheerio');

var boardId = '';
var url = 'http://huaban.com/boards/33147249/?iwkskixs&max=930057654&limit=20&wfl=1';
var imggeUrlBase = 'http://img.hb.aicdn.com/13792d46bd924a7018ba333eb0001d6f1301ac2599175e-A8IXoc';

// 获取花瓣网数据
var fetchData = function(html) {
    var $ = cheerio.load(html);
    // console.log($.html());


};




// 爬取数据
http.get(url, function(res) {
    var html = '';

    res.on('data', function(data) {
        html += data;
    });

    res.on('end', function() {
        // fetchData(html);

        // console.log(html);
        // console.log(/(app\.page\["board"\]).*;/.exec(html).length);
        // console.log(html.match(/(app\.page\["board"\]).*;/).length);
        // console.log(html.match(/(app\.page\["board"\]).*;/)[0]);
        // console.log(html.match(/(app\.page\["board"\]).*;/)[0].split('='));
        // console.log(html.match(/(app\.page\["board"\]).*;/)[0].split('=')[1].trim());
        // var t = JSON.parse(html.match(/(app\.page\["board"\]).*;/)[0].split('=')[1].trim());
        var t = html.match(/(app\.page\["board"\]).*;/)[0].split('=')[1].trim();
        t = t.substr(0, t.length - 1);
        console.log(JSON.parse(t));
    });
}).on('error', function() {
    console.log('error');
});
