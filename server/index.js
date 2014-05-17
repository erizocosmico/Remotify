var express = require('express');
var socketio = require('socket.io');
var app = express();
var exec = require('child_process').exec;
var im = require('imagemagick');

app.use(express.static(__dirname + '/../client'));
app.set('port', 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

function execute(command, callback) {
    exec(command, function(error, stdout, stderr) {
        callback(stdout.replace('\n', ''));
    });
};

var currentArtwork = '';

var Remotify = {
    status: function(callback, status) {
        if (status !== undefined && (status === 'play' || status === 'pause')) {
            execute('osascript -e \'tell application "Spotify" to playpause\'', function(resp) {
                callback({
                    status: resp
                });
            });
        } else {
            execute('osascript -e \'tell application "Spotify" to player state\'', function(resp) {
                callback({
                    status: resp
                });
            });
        }
    },
    shuffle: function(callback, yn) {
        if (yn !== undefined) {
            yn = yn ? 'true' : 'false';
            execute('osascript -e \'tell application "Spotify" to set shuffling to ' + yn + '\'', function(resp) {
                callback({
                    shuffle: resp
                });
            });
        } else {
            execute('osascript -e \'tell application "Spotify" to shuffling\'', function(resp) {
                callback({
                    shuffle: resp
                });
            });
        }
    },
    repeat: function(callback, yn) {
        if (yn !== undefined) {
            yn = yn ? 'true' : 'false';
            execute('osascript -e \'tell application "Spotify" to set repeating to ' + yn + '\'', function(resp) {
                callback({
                    repeat: resp
                });
            });
        } else {
            execute('osascript -e \'tell application "Spotify" to repeating\'', function(resp) {
                callback({
                    repeat: resp
                });
            });
        }
    },
    volume: function(callback, vol) {

    },
    next: function(callback) {
        execute('osascript -e \'tell application "Spotify" to next track\'', function(resp) {
            callback();
        });
    },
    prev: function(callback) {
        execute('osascript -e \'tell application "Spotify" to previous track\'', function(resp) {
            callback();
        });
    },
    track: function(callback, track) {
        if (track !== undefined) {
            execute('osascript -e \'tell application "Spotify" to play track "' + track + '"\'', function(resp) {
                callback();
            })
        } else {
            var title, album, artist, artwork;
            execute('osascript -e \'tell application "Spotify" to name of current track\'', function(resp) {
                title = resp;

                execute('osascript -e \'tell application "Spotify" to album of current track\'', function(resp) {
                    album = resp;

                    execute('osascript -e \'tell application "Spotify" to artist of current track\'', function(resp) {
                        artist = resp;
                        artwork = 'img/' + new Buffer(title + album + artist).toString('base64') + '.png';

                        if (currentArtwork !== artwork) {
                            execute('osascript ' + __dirname + '/../spartwork.scpt', function(resp) {
                                im.convert([__dirname + '/../SpotifyArtwork/albumArt.tiff', __dirname + '/../client/' + artwork], function(err, stdout) {
                                    if (err) throw err;
                                    currentArtwork = artwork;
                                });
                            });
                        }

                        callback({
                            'title': title,
                            'album': album,
                            'artist': artist,
                            'artwork': artwork
                        });
                    });
                });
            });
        }
    }
};

var io = socketio.listen(app.listen(app.get('port')));

io.sockets.on('connection', function(socket) {
    var dataResponse = function() {
        var resp = {};
        Remotify.track(function(track) {
            resp.track = track;
            Remotify.status(function(status) {
                Remotify.shuffle(function(shuffle) {
                    Remotify.repeat(function(repeat) {
                        resp.status = status.status;
                        resp.shuffle = shuffle.shuffle;
                        resp.repeat = repeat.repeat;

                        socket.emit('data', resp);
                    });
                });
            });
        });
    };

    dataResponse();
    setInterval(function() {
        dataResponse();
    }, 6000);

    socket.on('shuffle', function(data) {
        Remotify.shuffle(function(shuffle) {
            socket.emit('shuffle-resp', shuffle);
        }, data);
    });

    socket.on('repeat', function(data) {
        Remotify.repeat(function(repeat) {
            socket.emit('repeat-resp', repeat);
        }, data);
    });

    socket.on('change-status', function(data) {
        Remotify.status(function(status) {
            socket.emit('status-resp', status);
        }, data);
    });

    socket.on('next', function(data) {
        Remotify.next(function() {
            dataResponse();
        });
    });

    socket.on('set-track', function(data) {
        Remotify.track(function() {
            dataResponse();
        }, data);
    });

    socket.on('prev', function(data) {
        Remotify.prev(function() {
            dataResponse();
        });
    });

    socket.on('request-data', function(data) {
        dataResponse();
    });
});