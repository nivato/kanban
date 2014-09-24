(function(){
    //var user = {};
    var user = { "username": "nivato", "first_name": "Nazar", "last_name": "Ivato", "picture": "nazik.jpg", "color": "red"};
    var app = angular.module('Kanban', ['ngRoute']);
    
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: '/templates/board.html',
                controller: 'boardController',
                controllerAs: 'sprint'
            })
            .when('/backlog', {templateUrl: '/templates/backlog.html'})
            .when('/profile', {templateUrl: '/templates/profile.html'})
            .when('/search', {templateUrl: '/templates/search.html'})
            .when('/sprints', {templateUrl: '/templates/sprints.html'})
            .when('/team', {templateUrl: '/templates/team.html'})
            .when('/notfound', {templateUrl: '/templates/notfound.html'})
            .otherwise({redirectTo: '/'});
    }]);
    
    app.controller('ApplicationController', ['$http', function($http){
        this.currentUser = function(){
            return user;
        };
        this.logout = function(){
            user = {};
        };
        this.authenticated = function(){
            return !!user.username;
        };
    }]);
    
    app.controller('boardController', ['$http', function($http){
        var sprint = this;
        this.tickets = [];
        
        $http.get('/tickets').success(function(data){
            sprint.tickets = data;
        });
        
        this.numberOfTicketsWithStatus = function(status){
            var num = 0;
            for (var t = 0; t < this.tickets.length; t++){
                if (this.tickets[t].status === status){
                    num++;
                }
            }
            return num;
        };
    }]);
    
    app.controller('loginController', ['$http', function($http){
        this.username = '';
        this.password = '';
        this.error = '';
        
        this.submitLogin = function(){
            var loginForm = this;
            var dt = {
                username: this.username,
                password: this.password
            };
            this.username = '';
            this.password = '';
            this.error = '';
            $http.post('/login', dt)
                .success(function(data){
                    user = data;
                    loginForm.username = '';
                    $('#loginForm').modal('hide');
                })
                .error(function(data, status, headers, config){
                    loginForm.error = data.message;
                });
        };
    }]);
    
    app.directive('navigationBar', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/navigation-bar.html'
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
