(function(angular) {
  var app = angular.module('Hangman', ['ngMaterial', 'ngRoute', 'Game', 'Keyboard']);

  app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/json';
  }]);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/hangman', {
        templateUrl: 'partials/hangman.html'
      })
      .otherwise({
        redirectTo: '/hangman'
      });
  }]);

  app.directive('hmCanvas', ['$rootScope', 'HangmanGame', 'Game', function($rootScope, HangmanGame, Game) {
    return {
      templateUrl: '/partials/hangman/canvas.tmpl.html',
      link: function($scope, el) {
        el.addClass('flex');

        var state = Game.States.NOT_STARTED;

        $scope.newGame = function() {
          HangmanGame.startGame().then(function(response) {
            state = Game.States.PLAYING;
          })
        }

        $scope.isKeyboardEnabled = function() {
          return state === Game.States.PLAYING;
        };

        $scope.isGameStarted = function() {
          return state !== Game.States.NOT_STARTED;
        };

        $scope.$on('osk-keypress', function(ev, key) {
          HangmanGame.inputLetter(key);
        });

        // since we are emitting game events to $rootScope, we neet to explicitly listen to $rootScope. Listening on $scope won't do.
        $rootScope.$on('hm-CorrectInput', function(ev, key) {
          console.info('correct input: ', key);
        });

        $rootScope.$on('hm-WrongInput', function(ev, key) {
          console.info('wrong input: ', key);
        });

        $rootScope.$on('hm-YouWin', function(ev, word, tries) {
          // show dialog: YOUWIN! play again
          state = Game.States.YOUWIN;
          console.info('you win: ', word, tries);
        });

        $rootScope.$on('hm-YouLose', function(ev, word, used) {
          // show dialog: YOULOSE :( try again
          state = Game.States.YOULOSE;
          console.info('you lose: ', word, used);
        });
      }
    }
  }]);

})(window.angular);

