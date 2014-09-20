(function(){
    var app = angular.module('KanbanMocked', ['Kanban', 'ngMockE2E']);
    app.run(function($httpBackend){
        var people, tickets, authenticated;
        
        
        function loadDataFrom(filePath){
            var request = new XMLHttpRequest();
            request.open('GET', filePath, false);
            request.send(null);
            return JSON.parse(request.response);
        }
        
        function enrichTickets(){
            var color_class_mapping = {
                red: 'list-group-item-danger',
                green: 'list-group-item-success',
                blue: 'list-group-item-info',
                yellow: 'list-group-item-warning',
                white: ''
            };
            for (var t = 0; t < tickets.length; t++){
                var ticket = tickets[t];
                for (var p = 0; p < people.length; p++){
                    var person = people[p];
                    if (ticket.assignee_id === person.username){
                        ticket.assignee = person;
                        ticket.css_class = color_class_mapping[person.color];
                        break;
                    }
                }
            }
        }
        
        people = loadDataFrom('/json/people.json');
        tickets = loadDataFrom('/json/tickets.json');
        enrichTickets();
        authenticated = true;
        
        
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
            if (authenticated){
                return [200, tickets, {}];
            }
            return [401, {
                status: 'error', //ok|redirect|error
                to: '',
                html: '',
                message: 'Unauthorized'
            }, {}];
        });
        
        $httpBackend.whenGET(/templates\/.*/).passThrough();
    });
})();
