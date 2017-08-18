(function () {
    'use strict';

    angular.module('myApp')
        .directive('fileDownload', function () {
            return {
                restrict: 'E',
                scope: {
                    fileurl: '@fileurl',
                    linktext: '@linktext'
                },
                template: '<a href="{{ fileurl }}" download>{{ linktext }}</a>',
                link: function (scope, elem, attrs) {
                }
            }
        })
})();