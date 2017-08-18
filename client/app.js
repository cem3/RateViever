var app = angular.module('myApp', ['ngRoute', 'chart.js', 'ui.bootstrap.datetimepicker']);

app.controller("RateCtrl", ['$scope', 'currencyService',
  function ($scope, currencyService) {

    $scope.mode = 'graph';
    $scope.currencies = [{ name: 'USD', id: 145 }, { name: 'EUR', id: 292 }, { name: 'RUR', id: 298 }];
    $scope.tableCurrencies = [];
    $scope.currentValue = $scope.currencies[0];
    $scope.getSelectedCurrency = function (value) {
      $scope.currentValue = value;

      currencyService.getCurrencyFromPeriod($scope.currentValue.id, $scope.dateStart, $scope.dateEnd).
        then(function (result) {
          $scope.data = [];
          result.data.forEach(function (item) {
            $scope.data.push(item.Cur_OfficialRate.toString());
          })
        });
    };
    $scope.labels = [];

    date = new Date();
    for (var i = 7; i > 0; i--) {
      $scope.labels.push(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() + 1 - i));
    }
    $scope.dateStart = $scope.labels[0];
    $scope.dateEnd = $scope.labels[$scope.labels.length - 1];

    $scope.series = 'Series A';

    $scope.data = [];
    currencyService.getCurrencyFromPeriod($scope.currentValue.id, $scope.dateStart, $scope.dateEnd).
      then(function (result) {
        result.data.forEach(function (item) {
          $scope.data.push(item.Cur_OfficialRate.toString());
        })
      });

    $scope.changeMode = function (newmode) {
      $scope.mode = newmode;
      if (newmode === 'table') {
        $scope.cols.push($scope.currentValue.name);
        $scope.colsIds.push($scope.currentValue.id);
        $scope.currencies.forEach(function (item) {
          if (item.name !== $scope.currentValue.name) {
            $scope.tableCurrencies.push(item);
          }

        });
        $scope.labels.forEach(function (item, index) {
          var rowData = [];
          rowData.push(item);
          rowData.push($scope.data[index]);
          $scope.tableData.push(rowData);
        });
      } else if (newmode === 'graph') {
        $scope.cols = ['Date'];
        $scope.tableData = [];
        $scope.tableCurrencies = [];

        $scope.currentValue = $scope.currencies[0];
      }



    }

    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    $scope.options = {
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'left'
          }
        ]
      }
    };

    $scope.endDateBeforeRender = endDateBeforeRender
    $scope.endDateOnSetTime = endDateOnSetTime
    $scope.startDateBeforeRender = startDateBeforeRender
    $scope.startDateOnSetTime = startDateOnSetTime

    function startDateOnSetTime(newValue, oldValue) {
      $scope.$broadcast('start-date-changed');
      $scope.dateStart = newValue.getFullYear() + '-' + (newValue.getMonth() + 1) + '-' + (newValue.getDate() + 1);

      var differ = (new Date($scope.dateEnd).valueOf() - new Date($scope.dateStart).valueOf()) / (1000 * 60 * 60 * 24);
      $scope.labels = [];
      for (var i = 0; i <= differ; i++) {
        $scope.labels.push(newValue.getFullYear() + '-' + (newValue.getMonth() + 1) + '-' + (newValue.getDate() + 1));
        newValue = new Date(newValue.valueOf() + 1000 * 60 * 60 * 24);
      }



      currencyService.getCurrencyFromPeriod($scope.currentValue.id, $scope.dateStart, $scope.dateEnd).
        then(function (result) {
          $scope.data = [];
          result.data.forEach(function (item) {
            $scope.data.push(item.Cur_OfficialRate)
          })
        });

    }

    function endDateOnSetTime(newValue, oldValue) {
      $scope.$broadcast('end-date-changed');
      $scope.dateEnd = newValue.getFullYear() + '-' + (newValue.getMonth() + 1) + '-' + newValue.getDate();

      var differ = (new Date($scope.dateEnd).valueOf() - new Date($scope.dateStart).valueOf()) / (1000 * 60 * 60 * 24);
      $scope.labels = [];
      newValue = new Date($scope.dateStart);
      for (var i = 0; i <= differ; i++) {
        $scope.labels.push(newValue.getFullYear() + '-' + (newValue.getMonth()) + '-' + (newValue.getDate()));
        newValue = new Date(newValue.valueOf() + 1000 * 60 * 60 * 24);
      }




      currencyService.getCurrencyFromPeriod($scope.currentValue.id, $scope.dateStart, $scope.dateEnd).
        then(function (result) {
          $scope.data = [];
          result.data.forEach(function (item) {
            $scope.data.push(item.Cur_OfficialRate)
          })
        });
    }

    function startDateBeforeRender($dates) {
      if ($scope.dateEnd) {
        var activeDate = moment($scope.dateEnd);

        $dates.filter(function (date) {
          return date.localDateValue() >= activeDate.valueOf()
        }).forEach(function (date) {
          date.selectable = false;
        })
      }
    }

    function endDateBeforeRender($view, $dates) {
      if ($scope.dateStart) {
        var activeDate = moment($scope.dateStart).subtract(1, $view).add(1, 'minute'),
          activeDateEnd = moment();


        $dates.filter(function (date) {
          return (date.localDateValue() <= activeDate.valueOf()) || (date.localDateValue() >= activeDateEnd.valueOf());
        }).forEach(function (date) {
          date.selectable = false;
        })
      }
    }


    $scope.increment = function (value) {
      $scope.cols.push(value.name);
      $scope.colsIds.push(value.id);

      currencyService.getCurrencyFromPeriod(value.id, $scope.dateStart, $scope.dateEnd).
        then(function (result) {
          result.data.forEach(function (item, i) {
            $scope.tableData[i].push(item.Cur_OfficialRate)
          });
        });

      $scope.tableCurrencies = $scope.tableCurrencies.filter(function (item) {
        return item.name !== value.name;
      });
    };

    $scope.decFilter = function (value) {
      return value !== 'Date';
    };

    $scope.decrement = function (value) {
      var index = $scope.cols.indexOf(value);
      $scope.cols.splice(index, 1);
      $scope.colsIds.splice(index, 1);

      for (var i = 0; i < $scope.tableData.length; i++) {
        $scope.tableData[i].splice(index, 1);
      }

      $scope.tableCurrencies.push($scope.currencies.filter(function (item) {
        return item.name === value;
      })[0]);

    };

    $scope.cols = ['Date'];
    $scope.colsIds = [];
    $scope.tableData = [];

  }]);