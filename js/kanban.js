function enrichTickets(){
    var color_class_mapping = {
        red: 'list-group-item-danger',
        green: 'list-group-item-success',
        blue: 'list-group-item-info',
        yellow: 'list-group-item-warning',
        white: ''
    };
    for (var t = 0; t < data.tickets.length; t++){
        var ticket = data.tickets[t];
        for (var p = 0; p < data.people.length; p++){
            var person = data.people[p];
            if (ticket.assignee_id === person.username){
                ticket.assignee = person;
                ticket.css_class = color_class_mapping[person.color];
                break;
            }
        }
    }
}

(function(){
    var app = angular.module('Kanban', []);
    
    app.controller('SprintController', function(){
        enrichTickets();
        this.tickets = data.tickets;
        
        this.numberOfTicketsWithStatus = function(status){
            var num = 0;
            for (var t = 0; t < this.tickets.length; t++){
                if (this.tickets[t].status === status){
                    num++;
                }
            }
            return num;
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
    
    app.directive('boardTicket', function(){
    	return {
    		restrict: 'E',
    		scope: app.scope,
    		templateUrl: 'templates/board-ticket.html',
    	};
    });
    
})();
