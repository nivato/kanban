(function(){
    var app = angular.module('Sprint', []);
    
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
    
    app.directive('sprintBoard', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/sprint-board.html',
            controller: ['$http', function($http){
                var sprint = this;
                this.tickets = [];
                
                $http.get('/tickets').success(function(tckts){
                    sprint.tickets = tckts;
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
            }],
            controllerAs: 'sprint'
        };
    });
    
})();
