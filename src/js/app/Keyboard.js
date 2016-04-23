(function(angular) {
  var app = angular.module('Keyboard', ['ngMaterial']);

  app.directive('onscreenKeyboard', ['$rootScope', function($rootScope) {
    return {
      scope: {
        disabled: '='
      },
      templateUrl: '/partials/keyboard.tmpl.html',
      link: function($scope, el) {
        $scope.keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // <- that's lazyness, it's easier and less error-prone than writting ['A', 'B', 'C'...]

        $scope.keypress = function(key) {
          $rootScope.$broadcast('osk-keypress', key);
        }

        console.log($scope);

        $scope.$watch('disabled', function(d) {
          console.log(d);
        });
      }
    }
  }])
})(window.angular);

