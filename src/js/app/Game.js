(function(angular) {
  var app = angular.module('Game', ['Words']);

  app.factory('Game', [function() {
    return {
      MAX_MISTAKES: 11,
      States: {
        NOT_STARTED: -1,
        PLAYING: 0,
        WIN: 1,
        LOSE: 2
      },
    }
  }])

  app.service('HangmanGame', ['$rootScope', 'WordsDAO', 'Game', function($rootScope, WordsDAO, Game) {
    // for security reasons, we won't expose the correct word. No cheating allowed!
    var gameWord = null;

    // we are also able to calculate which letters are correct or not, so no need for a sepparate array for each.
    var usedLetters = new Array();

    return {
      startGame: function() {
        var _promiseFn = null;

        // reset game state
        gameWord = null;
        usedLetters.splice(0, usedLetters.length);

        var findWord = function() {
          WordsDAO.get().then(function(response) {
            if (response.status === 200) {
              if (response.data.word.length > Game.MAX_MISTAKES) {
                findWord();
              } else {
                gameWord = response.data.word.toLowerCase();
                var _r = angular.copy(response);
                delete _r.data;
                _promiseFn(_r);
              }
            } else {
              _promiseFn(response);
            }
          }).catch(function(response) {
            _catchFn(response);
          });
        }

        findWord();

        return {
          then: function(promiseFn) {
            _promiseFn = promiseFn;
          },
          catch: function(catchFn) {
            _catchFn = catchFn;
          },
        }
      },
      inputLetter: function(letter) {
        letter = letter.toLowerCase();
        // if letter is repeated, do nothing. assumes GUI won't allow this.
        if (usedLetters.indexOf(letter) > -1) {
          return;
        }

        usedLetters.push(letter);

        var indices = new Array();
        for (var i = 0; i < gameWord.length; i++) {
          if (gameWord[i] === letter) {
            indices.push(i);
          }
        }


        // EVENT: Event name | letter triggered | index in game word
        if (indices.length > 0) {
          $rootScope.$emit('hm-CorrectInput', letter, indices);

          // reduces the word into unique letters, ie. 'letters' = 'letrs'
          var reducedGameWord = new Array();
          gameWord.split('').forEach(function(_letter) {
            if (reducedGameWord.indexOf(_letter) === -1) {
              reducedGameWord.push(_letter);
            }
          });

          var correctLetters = this.getCorrectLetters();

          if (correctLetters.length === reducedGameWord.length) {
            $rootScope.$emit('hm-YouWin', gameWord, this.getNumberOfTries());
          }
        } else {
          $rootScope.$emit('hm-WrongInput', letter);

          var wrongLetters = this.getWrongLetters();

          if (wrongLetters.length >= Game.MAX_MISTAKES) {

            $rootScope.$emit('hm-YouLose', gameWord, wrongLetters);
          }
        }
      },
      getUsedLetters: function() {
        return usedLetters;
      },
      getWrongLetters: function() {
        if (gameWord) {
          return usedLetters.filter(function(letter) {
            return gameWord.indexOf(letter) === -1;
          });
        }

      },
      getCorrectLetters: function() {
        if (gameWord) {
          return usedLetters.filter(function(letter) {
            return gameWord.indexOf(letter) > -1;
          });
        }
      },
      getNumberOfTries: function() {
        return usedLetters.length;
      },
      getWordLength: function() {
        return gameWord.length;
      }
    }
  }]);

})(window.angular);

