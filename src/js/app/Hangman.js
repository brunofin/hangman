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

  app.directive('hmCanvas', ['$rootScope', '$mdDialog', 'HangmanGame', 'Game',
    function($rootScope, $mdDialog, HangmanGame, Game) {
      return {
        templateUrl: '/partials/hangman/canvas.tmpl.html',
        link: function($scope, el) {
          el.addClass('flex');

          var state = Game.States.NOT_STARTED;
          $scope.disabledKeys = new Array();

          $scope.loading = false;

          $scope.newGame = function() {
            $scope.loading = true;
            // TODO: word is exposed in response. fix that!
            HangmanGame.startGame().then(function(response) {
              $scope.loading = false;
              state = Game.States.PLAYING;

              $scope.word = new Array();

              for (var i = 0, l = HangmanGame.getWordLength(); i < l; i++) {
                $scope.word[i] = null;
              }

              $scope.disabledKeys.splice(0, $scope.disabledKeys.length);
            }).catch(function(response) {
              $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(false)
                .title('Uh-Oh!')
                .textContent(
                  'It seems that the Random Words provider server isn\' responsing right now. Please try again later.'
                )
                .ariaLabel('API problem!')
                .ok('OK')
              );
            });
          };

          $scope.getWrongLetters = function() {
            return HangmanGame.getWrongLetters();
          };

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
          $rootScope.$on('hm-CorrectInput', function(ev, letter, indices) {
            letter = letter.toLowerCase();

            $scope.disabledKeys.push(letter);

            indices.forEach(function(index) {
              $scope.word[index] = letter;
            });

          });

          $rootScope.$on('hm-WrongInput', function(ev, key) {
            $scope.disabledKeys.push(key.toLowerCase());
          });

          $rootScope.$on('hm-YouWin', function(ev, word, tries) {
            // show dialog: YOUWIN! play again
            state = Game.States.YOUWIN;

            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.body))
              .clickOutsideToClose(false)
              .title('Congratulations!')
              .textContent('You guessed the word "' + word.toUpperCase() + '" correctly!')
              .ariaLabel('You win!')
              .ok('Play again')
            ).then(function(ok) {
              if (ok) {
                $scope.newGame()
              }
            });
          });

          $rootScope.$on('hm-YouLose', function(ev, word, used) {
            // show dialog: YOULOSE :( try again
            state = Game.States.YOULOSE;

            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.body))
              .clickOutsideToClose(false)
              .title('You lose!')
              .textContent('You didn\'t guess the word "' + word.toUpperCase() + '"!')
              .ariaLabel('You lose!')
              .ok('Try again')
            ).then(function(ok) {
              if (ok) {
                $scope.newGame()
              }
            });
          });
        }
      }
    }
  ]);

  app.directive('hangingGuy', ['HangmanGame', function(HangmanGame) {
    return {
      templateUrl: '/partials/hangman/hanging-guy.tmpl.html',
      link: function($scope, el) {
        $scope.validateVisibility = function(bodypart) {
          try {
            return HangmanGame.getWrongLetters().length > bodypart;
          } catch (e) {
            return false;
          }
        }

        $scope.Bodypart = {
          HEAD: 0,
          NECK: 1,
          TORSO: 2,
          RIGHT_ARM: 3,
          LEFT_ARM: 4,
          RIGHT_HAND: 5,
          LEFT_HAND: 6,
          RIGHT_LEG: 7,
          LEFT_LEG: 8,
          RIGHT_FOOT: 9,
          LEFT_FOOT: 10
        }
      }
    }
  }])

})(window.angular);

