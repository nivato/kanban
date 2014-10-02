(function(){
    var app = angular.module('Kanban', ['ngRoute', 'flow']);
    
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
    
    app.controller('NavigationController', function(){
        this.tab = 'board';
        this.selectTab = function(setTab){
            this.tab = setTab;
        };
        this.isSelceted = function(checkTab){
            return this.tab === checkTab;
        };
    });
    
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
    
    app.controller('ProfileController', ['$scope', function($scope){
        this.saveAvatar = function(){
            this.$flow.upload();
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
