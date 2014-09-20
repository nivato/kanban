(function(){
    var user = {};
    var app = angular.module('Kanban', ['Sprint']);
    
    app.controller('ApplicationController', ['$http', function($http){
        
        this.logout = function(){
            user = {};
        };
        
        this.login = function(){
            user = {username: 'nivato'};
        };
        
        this.authenticated = function(){
            return !!user.username;
        };
        
    }]);
    
    app.controller('LoginController', ['$http', function($http){
        true;
    }]);
    
})();
