(function(){
    var app = angular.module('KanbanMocked', ['Kanban', 'ngMockE2E']);
    app.run(function($httpBackend){
        
        function loadDataFrom(filePath){
            var request = new XMLHttpRequest();
            request.open('GET', filePath, false);
            request.send(null);
            return request.response;
        }
        
        var people = loadDataFrom('/json/people.json');
        var tickets = loadDataFrom('/json/tickets.json');
        var authenticated = false;
        
        
        $httpBackend.whenGET(/\/people/).respond(function(method, url, data, headers){
            // console.log(method);
            // console.log(url);
            // console.log(data);
            // console.log(headers);
            if (authenticated){
                return [200, people, {}];
            }
            return [401, {
                status: 'error', //ok|redirect|error
                to: '',
                html: '',
                message: 'Unauthorized'
            }, {}];
        });
        
        $httpBackend.whenGET(/\/tickets/).respond(function(method, url, data, headers){
            return [200, tickets, {}];
        });
        
        $httpBackend.whenGET(/templates\/.*/).passThrough();
    });
})();
