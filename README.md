# Remotify

Remotify is a web interface to control Spotify.

### Why?

Because it can be done, because it was funny to do.

### Any use case?

Imagine you're having a party with your friends and any of you want to go to the computer to change the music over and over again. Just access Remotify from your phone wherever you are.

### Is it finished?

Of course not. Volume can't be changed yet. You can't set suffle and repeat mode neither.

### Requirements
* Homebrew
* OS X
* Spotify
* bower
* npm and node.js

### How can I install it?

First of all, this has to run on a Mac (sorry, Linux and Windows users), mostly because it uses AppleScript to access Spotify data.

Clone this repository on your home directory (this is not a suggestion, it won't work otherwise). 
```bash
cd && git clone https://github.com/mvader/Remotify Remotify
```

Install stuff (ImageMagick and libtiff) using Homebrew. If you don't have Homebrew installed you should install it.
```bash
cd Remotify && sh setup.sh
npm install
bower install
```

Done. Just run it and start using it.
```bash
node server/index.js
```
Now go to ```localhost:3000``` on your browser.