(function(){
    var app = angular.module('Kanban', ['ngRoute']);
    
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {templateUrl: '/templates/board.html', controller: 'BoardController', controllerAs: 'sprint'})
            .when('/backlog', {templateUrl: '/templates/backlog.html'})
            .when('/profile', {templateUrl: '/templates/profile.html'})
            .when('/search', {templateUrl: '/templates/search.html'})
            .when('/sprints', {templateUrl: '/templates/sprints.html'})
            .when('/team', {templateUrl: '/templates/team.html'})
            .when('/notfound', {templateUrl: '/templates/notfound.html'})
            .when('/welcome', {templateUrl: '/templates/welcome.html'})
            .when('/register', {templateUrl: '/templates/register.html', controller: 'RegistrationController', controllerAs: 'reg'})
            .otherwise({redirectTo: '/notfound'});
    }]);
    
    app.controller('ApplicationController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var appCtrl = this;
        this.user = {};
        //this.user = { "username": "nivato", "first_name": "Nazar", "last_name": "Ivato", "picture": "nazik.jpg", "color": "red"};
        this.logout = function(){
            $http.get('/logout').success(function(data, status, headers, config){
                appCtrl.user = {};
                $location.path('/welcome');
            });
        };
        this.authenticated = function(){
            return !!this.user.username;
        };
        $scope.$on('user_logged_in', function(event, data){
            appCtrl.user = data;
        });
        if (!this.authenticated()){
            if ($location.path() !== '/register'){
                $location.path('/welcome');
            }
        };
    }]);
    
    app.controller('RegistrationController', ['$http', '$location', function($http, $location){
        var reg = this;
        this.user = {};
        this.messages = [];
        this.submitRegistration = function(){
            this.messages = [];
            $http.post('/register', this.user)
                .success(function(data, status, headers, config){
                    $location.path('/welcome');
                })
                .error(function(data, status, headers, config){
                    reg.messages = data.messages;
                });
        };
        this.cancelRegistration = function(){
            $location.path('/welcome');
        };
    }]);
    
    app.controller('navigationController', function(){
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
            $http.get('/tickets')
                .success(function(data, status, headers, config){
                    sprint.tickets = data;
                })
                .error(function(data, status, headers, config){
                    sprint.tickets = [];
                    if (data.messages[0] === 'Unauthorized'){
                        $location.path('/welcome');
                    }
                });
        };
        this.refresh();
    }]);
    
    app.controller('loginController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var loginForm = this;
        this.user = {};
        this.messages = [];
        this.submitLogin = function(){
            this.messages = [];
            $http.post('/login', this.user)
                .success(function(data, status, headers, config){
                    loginForm.user = {};
                    $scope.$emit('user_logged_in', data.data);
                    $('#loginForm').modal('hide');
                    $location.path('/');
                })
                .error(function(data, status, headers, config){
                    loginForm.messages = data.messages;
                });
        };
        this.registration = function(){
            $('#loginForm').modal('hide');
            $location.path('/register');
        };
    }]);
    
    app.directive('navigationBar', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/navigation-bar.html',
            controller: 'navigationController',
            controllerAs: 'nav'
        };
    });
    
    app.directive('loginForm', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/login-form.html',
            controller: 'loginController',
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
