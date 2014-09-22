(function(){
    //var user = {};
    var user = { "username": "nivato", "first_name": "Nazar", "last_name": "Ivato", "picture": "nazik.jpg", "color": "red"};
    var app = angular.module('Kanban', ['Sprint']);
    
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
    
    app.controller('LoginController', ['$http', function($http){
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
    
})();
