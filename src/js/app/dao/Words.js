(function(angular) {
  var app = angular.module('Words', []);

  app.service('WordsDAO', ['$http', function($http) {
    return {
      get: function() {
        return $http({
          method: 'GET',
          url: 'http://randomword.setgetgo.com/get.php',
          transformResponse: function(data, headersGetter, status) {
            if (status === 200) {
              var r = Object.create({});
              r.word = data;
              return r;
            } else {
              return null;
            }
          }
        });
      }
    }
  }])
})(window.angular);

