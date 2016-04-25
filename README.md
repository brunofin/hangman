# Hangman by Bruno Finger

## Live demo

The code is live at http://hangman.brunofinger.xyz.

## Local build instructions
### Requirements

* NodeJS (tested with 5.8.0 and 5.11.0);
* Ruby;
* SASS.

The following script should allow you to have all the dependencies installed, provided running on a Ubuntu machine: 

```shell
sudo apt-get install -y build-essential
sudo apt-get install ruby
sudo gem install sass
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g npm@3.7.3
npm install node-sass@3.5.3
```

This same script is run by the CI server before every build, so it have been tested.

### Build

Having all the requirements installed and properly configured, all you need to do to generate a deployable build is issue the following command in the project's root folder:

```shell
npm run deploy
```

The files will be output in the `/dist` folder. Any HTTP server should be able to run it. Tested with Nginx.

## Development

A few development tasks have been automated using Gulp, to make development easier. These tasks include:

* Lint JavaScript file -- This will throw an error if any JS syntax error;
* Format code style -- HTML, JS, and SCSS files will be automatically formated to follow good coding standards;
* Minify and generate map of the JavaScript code and dependencies;
* Compile SCSS into CSS, minify it and generate a map to the original SCSS.

They are configured in a Gulp "watch" and will be run every time it detects changes in the source-code -- of course, not all of them ie. it will only rebuild the CSS if it detects changes in a `.scss` file, or minify the JS if it detects changes in a `.js` file, and so on.

## What could be improved

I would like to delegate these tasks to a pre-built `busybox` or similar lightweight-Linux distro Vagrant box.

