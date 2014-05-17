var app = angular.module('remotify', []);

app.controller('MainController', ['$scope',
    function($scope) {
        $scope.playing = false;
        $scope.repeat = false;
        $scope.shuffle = false;
        $scope.track = {
            title: 'None',
            artist: 'None',
            album: 'None',
            artwork: ''
        };

        var socket = io.connect('http://' + window.location.hostname + ':3000');
        socket.on('data', function(data) {
            $scope.set('playing', (data.status === 'playing') ? true : false);
            $scope.set('shuffle', (data.shuffle === 'true') ? true : false);
            $scope.set('repeat', (data.repeat === 'true') ? true : false);
            $scope.set('track', data.track);
        });

        socket.on('status-resp', function(status) {
            $scope.set('playing', status.status);
        });

        $scope.set = function(key, val) {
            $scope.$apply(function() {
                $scope[key] = val;
            });
        };

        $scope.play = function() {
            var status = $scope.playing ? 'pause' : 'play';
            socket.emit('change-status', status);
        };

        $scope.prev = function() {
            socket.emit('prev');
        };

        $scope.next = function() {
            socket.emit('next');
        };
    }
]);