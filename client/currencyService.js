(function () {
    'use strict';

    angular.module('myApp')
        .factory('currencyService', ['$http',
            function ($http) {
                return {
                    getCurrencyFromPeriod: function (id, startDate, endDate) {
                        return $http.get('http://www.nbrb.by/API/ExRates/Rates/Dynamics/' + id + '?startDate=' +
                            startDate + '&endDate=' + endDate);

                    }

                };
            }]);
})();