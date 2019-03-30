var express = require('express');
var fs = require('fs');
var date = require('date-and-time');
var mysql = require('mysql');
var config = require('./config.js');
var Promise = require('bluebird');
var app = express();

/*var connection = mysql.createConnection({
	host : config.host,
	user : config.user,
	password : config.passwd,
	database : config.db
});
*/
var connection = mysql.createConnection(config);
connection.connect();

app.set('views', './views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

app.get('/', (req,res) => {
	res.send('Hello World!');
});

app.get('/log', (req, res) => {
//	console.log("100" + req.query);
	console.log(req.query.temp);
	var now = new Date();
	now = date.addHours(now, 9);
	console.log(date.format(now,"YYYY/MM/DD/HH/mm/ss"));

/*	fs.open('log.txt', 'a',(err,fd) => {
		if(err) throw err;
		fs.appendFile(fd, date.format(now, "YYYY/MM/DD/HH/mm/ss")+' '+req.query.temp+'\n','utf8', (err) => {
			fs.close(fd, (err) => {
				if(err) throw err;
			});
			if(err) throw err;
		});
	});
*/
	querydata = {};
	querydata.time = now;
	querydata.value = req.query.temp;
	querydata.device = 202;
	querydata.unit = 3;
	querydata.type = 'T';
	querydata.seq = 34;
	querydata.ip = req.connection.remoteAddress.replace(/^.*:/,'')
	//console.log(now);
	//var sql = "insert into sensors set ?";
	console.log("done2");
	var qquery = connection.query('insert into sensors set ?', querydata, (err, rows, cols) => {
		if(err) throw err;
		console.log("done");
		//connection.on('error', function() {});
	});
});

app.get('/dump', (req, res) => {
	var count = req.query.count;
	var cnt = count;
	var dataa = [];
	var result = {};
	var max, min;
	fs.readFile('log.txt', 'utf-8', (err, data) => {
		if(err) throw err;
		var array = data.toString().split('\n');
		var arrsize = array.length;
		if(count > arrsize-1){
			result["error"] = "there are less data than count\n";
			cnt = arrsize-1;
		}
		for(var i = 0; i < cnt ;i++){
			if(i==0) max = array[arrsize-2-i].split(' ');
			if(i==cnt-1) min = array[arrsize-2-i].split(' ');
			dataa.push(array[arrsize-2-i].split(' '));
		}
		result["data"] = dataa;
		res.render('index.html', {'dataa':dataa,'max':max,'min':min});
		//res.send(result);
	});
});

app.get('/graph', (req, res) => {
	var max, min;
	var sql = "select value, time from sensors order by time DESC limit 120;";
	connection.query(sql, (err, rows, fields) => {
		if(err){throw err;}
		var arrsize = rows.length;
		for(var i = 0; i < arrsize; i++)
		{
			if(i == arrsize-1) max = rows[i].time;
			if(i == 0) min = rows[i].time;
		}
		res.render('index.html', {'dataa' : rows, 'min' : min, 'max' : max})
	})
});

app.listen(8000, () => {
	console.log('Example app listening on port 8000!');
});
