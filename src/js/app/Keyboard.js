(function(angular) {
  var app = angular.module('Keyboard', ['ngMaterial']);

  app.directive('onscreenKeyboard', ['$rootScope', function($rootScope) {
    return {
      scope: {
        disabled: '=',
        disabledKeys: '='
      },
      templateUrl: '/partials/keyboard.tmpl.html',
      link: function($scope, el) {
        $scope.keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function(key) {
          return {
            value: key.toLowerCase(),
            disabled: false
          }
        });

        angular.element(document.body).bind("keypress", function(event) {
          var key = event.code[3];
          $rootScope.$apply(function() {
            $scope.keypress(key);
          });

          event.preventDefault();
        });

        $scope.keypress = function(key) {
          $rootScope.$broadcast('osk-keypress', key);
        };

        $scope.isDisabled = function(key) {
          return $scope.disabled || key.disabled;
        };

        $scope.$watchCollection('disabledKeys', function(disabledKeys) {
          $scope.keys.forEach(function(key) {
            key.disabled = disabledKeys.includes(key.value);
          });
        });
      }
    }
  }])
})(window.angular);

