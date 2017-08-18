var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var stringify = require('csv-stringify');
var http = require('http');


app.use(express.static(__dirname + '/../client'));
app.use('/node_modules', express.static(__dirname + '/../node_modules'));


app.get('/getReport/*', function (req, res) {
  var body = '';
  var response = res;

  if (req.query.mode === 'single') {
    var name = req.query.name;

    http.get({
      host: 'www.nbrb.by',
      port: 80,
      path: '/API/ExRates/Rates/Dynamics/' + req.query.id + '?startDate=' + req.query.dateStart + '&endDate=' + req.query.dateEnd
    }, function (res) {
      console.log("Got response: " + res.statusCode);

      res.on("data", function (chunk) {
        body += chunk;
      });

      res.on('end', function () {

        input = [['Date', name]];
        JSON.parse(body).forEach(function (data) {
          var rowData = [];
          rowData.push(data.Date);
          rowData.push(data.Cur_OfficialRate);
          input.push(rowData);

        });
        stringify(input, { delimiter: '\t' }, function (err, output) {
          fs.writeFile(path + "./../../currency.csv", output, function (err) {
            if (err) throw err;
            response.sendFile(path.join(__dirname + './../currency.csv'));
          });
        });

      });
    }).on('error', function (e) {
      console.log("Got error: " + e.message);
    });
  } else if (req.query.mode === 'multiple') {
    var names = JSON.parse(req.query.name);
    var ids = JSON.parse(req.query.id);
    var length = ids.length;
    var input = [[]];

    names.forEach(function (item) {
      input[0].push(item);
    });


    http.get({
      host: 'www.nbrb.by',
      port: 80,
      path: '/API/ExRates/Rates/Dynamics/' + ids[0] + '?startDate=' + req.query.dateStart + '&endDate=' + req.query.dateEnd
    }, function (res) {
      console.log("Got response: " + res.statusCode);

      res.on("data", function (chunk) {
        body += chunk;
      });

      res.on('end', function () {
        JSON.parse(body).forEach(function (data) {
          var rowData = [];
          rowData.push(data.Date);
          rowData.push(data.Cur_OfficialRate);
          input.push(rowData);

        });
        body = '';
        var dataArr = []
        getData(length, length - 1, ids, req.query.dateStart, req.query.dateEnd, dataArr, input, response);
      });
    });



  }
});

var getData = function (length, counter, ids, start, end, data, input, response) {
  if (counter <= 0) {
    data.forEach(function (item) {
      for (var i = 1; i < input.length; i++) {
        input[i].push(item[i - 1]);
      }
    })



    stringify(input, { delimiter: '\t' }, function (err, output) {
      fs.writeFile(path + "./../../currency.csv", output, function (err) {
        if (err) throw err;
        response.sendFile(path.join(__dirname + './../currency.csv'));
      });
    })

  } else {
    var body = ''

    http.get({
      host: 'www.nbrb.by',
      port: 80,
      path: '/API/ExRates/Rates/Dynamics/' + ids[length - counter] + '?startDate=' + start + '&endDate=' + end
    }, function (res) {
      console.log("Got response: " + res.statusCode);

      res.on("data", function (chunk) {
        body += chunk;
      });

      res.on('end', function () {
        var rowData = [];
        JSON.parse(body).forEach(function (data) {
          rowData.push(data.Cur_OfficialRate);
        });
        data.push(rowData);
        counter--;
        getData(length, counter, ids, start, end, data, input, response);

      });
    }).on('error', function (e) {
      console.log("Got error: " + e.message);
    });
  }

}

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000 !');
});
