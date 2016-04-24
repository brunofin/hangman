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

            })
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

            console.info('correct input: ', letter, indices);
            $scope.disabledKeys.push(letter);

            indices.forEach(function(index) {
              $scope.word[index] = letter;
            });

            console.log($scope.word);
          });

          $rootScope.$on('hm-WrongInput', function(ev, key) {
            console.info('wrong input: ', key);
            $scope.disabledKeys.push(key.toLowerCase());
          });

          $rootScope.$on('hm-YouWin', function(ev, word, tries) {
            // show dialog: YOUWIN! play again
            state = Game.States.YOUWIN;
            console.info('you win: ', word, tries);

            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.body))
              .clickOutsideToClose(false)
              .title('Congratulations!')
              .textContent('You guessed the word "' + word + '" correctly!')
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
            console.info('you lose: ', word, used);
          });
        }
      }
    }
  ]);

  app.directive('hangingGuy', ['HangmanGame', function(HangmanGame) {
    return {
      templateUrl: '/partials/hangman/hanging-guy.tmpl.html',
      link: function($scope, el) {
        $scope.isHeadVisible = function() {
          return HangmanGame.getWrongLetters().length > 0;
        }

        $scope.isNeckVisible = function() {
          return HangmanGame.getWrongLetters().length > 1;
        }

        $scope.isTorsoVisible = function() {
          return HangmanGame.getWrongLetters().length > 2;
        }

        $scope.isLeftArmVisible = function() {
          return HangmanGame.getWrongLetters().length > 3;
        }

        $scope.isRightArmVisible = function() {
          return HangmanGame.getWrongLetters().length > 4;
        }

        $scope.isLeftHandVisible = function() {
          return HangmanGame.getWrongLetters().length > 5;
        }

        $scope.isRightHandVisible = function() {
          return HangmanGame.getWrongLetters().length > 6;
        }

        $scope.isLeftLegVisible = function() {
          return HangmanGame.getWrongLetters().length > 7;
        }

        $scope.isRightLegVisible = function() {
          return HangmanGame.getWrongLetters().length > 8;
        }

        $scope.isLeftFootVisible = function() {
          return HangmanGame.getWrongLetters().length > 9;
        }

        $scope.isRightFootVisible = function() {
          return HangmanGame.getWrongLetters().length > 10;
        }
      }
    }
  }])

})(window.angular);

