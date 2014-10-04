(function(){
    var app = angular.module('Kanban', ['ngRoute', 'flow', 'ngImgCrop']);

    app.config(['$routeProvider', '$locationProvider', 'flowFactoryProvider', function($routeProvider, $locationProvider, flowFactoryProvider){
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {templateUrl: '/templates/board.html', controller: 'BoardController', controllerAs: 'sprint'})
            .when('/backlog', {templateUrl: '/templates/backlog.html'})
            .when('/profile', {templateUrl: '/templates/profile.html', controller: 'ProfileController', controllerAs: 'profile'})
            .when('/search', {templateUrl: '/templates/search.html'})
            .when('/sprints', {templateUrl: '/templates/sprints.html'})
            .when('/team', {templateUrl: '/templates/team.html'})
            .when('/welcome', {templateUrl: '/templates/welcome.html'})
            .when('/register', {templateUrl: '/templates/register.html', controller: 'RegistrationController', controllerAs: 'reg'})
            .otherwise({templateUrl: '/templates/notfound.html'});
        flowFactoryProvider.defaults = {
            target: '/api/upload',
            permanentErrors: [404, 500, 501],
            testChunks: false
        };
    }]);

    app.controller('ApplicationController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var appCtrl = this;
        this.user = {};
        $scope.$on('user_logged_in', function(event, data){
            appCtrl.user = data;
        });
        this.logout = function(){
            $http.get('/api/logout').success(function(response, status, headers, config){
                appCtrl.user = {};
                $location.path('/welcome');
            });
        };
        this.authenticated = function(){
            return !!this.user.username;
        };
        $http.get('/api/access')
            .success(function(response, status, headers, config){
                appCtrl.user = response.data;
            })
            .error(function(response, status, headers, config){
                if ($location.path() !== '/register'){
                    $location.path('/welcome');
                }
            });
    }]);

    app.controller('RegistrationController', ['$http', '$location', function($http, $location){
        var reg = this;
        this.user = {};
        this.messages = [];
        this.submitRegistration = function(){
            this.messages = [];
            $http.post('/api/register', this.user)
                .success(function(response, status, headers, config){
                    $location.path('/welcome');
                })
                .error(function(response, status, headers, config){
                    reg.messages = response.messages;
                });
        };
        this.cancelRegistration = function(){
            $location.path('/welcome');
        };
    }]);

    app.controller('NavigationController', ['$scope', '$location', function($scope, $location){
        var navbar = this;
        this.tab = 'none';
        this.refresh = function(){
            switch($location.path()) {
                case '/':
                    this.tab = 'board';
                    break;
                case '/backlog':
                    this.tab = 'backlog';
                    break;
                case '/sprints':
                    this.tab = 'sprints';
                    break;
                case '/team':
                    this.tab = 'team';
                    break;
                default:
                    this.tab = 'none';
            }
        };
        this.isSelceted = function(checkTab){
            return this.tab === checkTab;
        };
        $scope.$on('$locationChangeSuccess', function(event, data){
            navbar.refresh();
        });
        this.refresh();
    }]);

    app.controller('BoardController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var sprint = this;
        this.tickets = [];
        this.numberOfTicketsWithStatus = function(status){
            var num = 0;
            for (var t = 0; t < this.tickets.length; t++){
                if (this.tickets[t].status === status){
                    num++;
                }
            }
            return num;
        };
        this.refresh = function(){
            $http.get('/api/tickets')
                .success(function(response, status, headers, config){
                    sprint.tickets = response.data;
                })
                .error(function(response, status, headers, config){
                    sprint.tickets = [];
                    if (response.messages[0] === 'Unauthorized'){
                        $location.path('/welcome');
                    }
                });
        };
        this.refresh();
    }]);

    app.controller('LoginController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var loginForm = this;
        this.user = {};
        this.messages = [];
        this.submitLogin = function(){
            this.messages = [];
            $http.post('/api/login', this.user)
                .success(function(response, status, headers, config){
                    loginForm.user = {};
                    $scope.$emit('user_logged_in', response.data);
                    $('#loginForm').modal('hide');
                    $location.path('/');
                })
                .error(function(response, status, headers, config){
                    loginForm.messages = response.messages;
                });
        };
        this.registration = function(){
            $('#loginForm').modal('hide');
            $location.path('/register');
        };
    }]);

    app.controller('ProfileController', ['$scope', '$timeout', function($scope, $timeout){
        var profile = this;
        this.croppedAvatarFileURL = '';
        var allowedTypes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/bmp', 'image/x-windows-bmp'];
        this.changeAvatar = function(){
            this.$flow.on('filesSubmitted', function(){
                var file = profile.$flow.files[0];
                if (!!file){
                    if (allowedTypes.indexOf(file.file.type) === -1){
                        profile.$flow.cancel();
                    } else {
                        profile.avatarFileURL = URL.createObjectURL(file.file);
                    }
                }
                profile.$flow.off('filesSubmitted');
            });
        };
        this.saveAvatar = function(){
            this.$flow.on('fileSuccess', function(file, response){
                $timeout(function(){profile.$flow.cancel();}, 800);
                profile.$flow.off('fileSuccess');
            });
            this.$flow.upload();
        };
        this.cancelAvatar = function(){
            this.$flow.cancel();
        };
        this.displayResult = function(){
            console.log(this.croppedAvatarFileURL);
        };
    }]);

    app.directive('navigationBar', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/navigation-bar.html',
            controller: 'NavigationController',
            controllerAs: 'nav'
        };
    });

    app.directive('loginForm', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/login-form.html',
            controller: 'LoginController',
            controllerAs: 'lgn'
        };
    });

    app.directive('boardTicket', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/board-ticket.html',
        };
    });

    app.directive('cropImageDialog', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/crop-image-dialog.html',
        };
    });

    app.filter('limitStrTo', function() {
        return function(input, limit) {
            input = input || '';
            var out = input;
            if (input.length > limit){
                out = input.substring(0, limit) + '...';
            }
            return out;
        };
    });

})();
