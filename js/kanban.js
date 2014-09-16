(function(){
    var app = angular.module('Kanban', ['Sprint']);
    
    app.controller('ApplicationController', function(){
    	this.user = {};
    	
    	this.logout = function(){
    	    this.user = {};
    	};
    	
    	this.login = function(){
    	    this.user = {username: 'nivato'};
    	};
    	
    });
})();
