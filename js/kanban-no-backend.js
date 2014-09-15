(function(){
    var app = angular.module('KanbanNoBackend', ['Kanban', 'ngMockE2E']);
    app.run(['$httpBackend', '$http', function($httpBackend, $http){
        var people = [];
        var peopleInitiated = false;
        var tickets = [];
        var ticketsInitiated = false;
        
        function loadDataFrom(filePath){
            var request = new XMLHttpRequest();
            request.open('GET', filePath, false);
            request.send(null);
            return request.response;
        }
        
        $httpBackend.whenGET(/\/people/).respond(function(method, url, data){
            if (!peopleInitiated){
                people = loadDataFrom('/json/people.json');
                peopleInitiated = true;
            }
            return [200, people, {}];
        });
        
        $httpBackend.whenGET(/\/tickets/).respond(function(method, url, data){
            if (!ticketsInitiated){
                tickets = loadDataFrom('/json/tickets.json');
                ticketsInitiated = true;
            }
            return [200, tickets, {}];
        });
        
        $httpBackend.whenGET(/templates\/.*/).passThrough();
    }]);
})();
