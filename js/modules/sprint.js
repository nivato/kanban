(function(){

	function enrichTickets(sprint){
	    var color_class_mapping = {
	        red: 'list-group-item-danger',
	        green: 'list-group-item-success',
	        blue: 'list-group-item-info',
	        yellow: 'list-group-item-warning',
	        white: ''
	    };
	    for (var t = 0; t < sprint.tmp.tickets.length; t++){
	        var ticket = sprint.tmp.tickets[t];
	        for (var p = 0; p < sprint.tmp.people.length; p++){
	            var person = sprint.tmp.people[p];
	            if (ticket.assignee_id === person.username){
	                ticket.assignee = person;
	                ticket.css_class = color_class_mapping[person.color];
	                break;
	            }
	        }
	    }
	    sprint.tickets = sprint.tmp.tickets;
	    delete sprint.tmp;
	}

    var app = angular.module('Sprint', []);
    
    app.controller('SprintController', ['$http', function($http){
        var sprint = this;
        sprint.tmp = {};
        this.tickets = [];
        
        $http.get('/json/tickets.json').success(function(tckts){
        	sprint.tmp.tickets = tckts;
        	$http.get('/json/people.json').success(function(ppl){
        		sprint.tmp.people = ppl;
        		enrichTickets(sprint);
        	});
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
    
    app.directive('boardTicket', function(){
    	return {
    		restrict: 'E',
    		templateUrl: 'templates/board-ticket.html',
    	};
    });
    
})();
