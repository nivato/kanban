(function(){
    var app = angular.module('KanbanMocked', ['Kanban', 'ngMockE2E']);
    app.run(function($httpBackend){
        var people = loadDataFrom('/json/people.json');
        var tickets = loadDataFrom('/json/tickets.json');
        
        function loadDataFrom(filePath){
            var request = new XMLHttpRequest();
            request.open('GET', filePath, false);
            request.send(null);
            return request.response;
        }
        
        $httpBackend.whenGET(/\/people/).respond(people);
        
        $httpBackend.whenGET(/\/tickets/).respond(tickets);
        
        $httpBackend.whenGET(/templates\/.*/).passThrough();
    });
})();
