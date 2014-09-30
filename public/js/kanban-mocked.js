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
        
        function getUser(username){
            var user = {};
            for (var p = 0; p < people.length; p++){
                var person = people[p];
                if ((person.username == username) || (person.email == username)){
                    user = person;
                    break;
                }
            }
            return user;
        }
        
        people = loadDataFrom('/json/people.json');
        tickets = loadDataFrom('/json/tickets.json');
        enrichTickets();
        authenticated = true;
        
        
        $httpBackend.whenGET(/\/people/).respond(function(method, url, data, headers){
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
        
        $httpBackend.whenPOST(/login/).respond(function(method, url, data, headers){
            data = JSON.parse(data);
            var user = getUser(data.username);
            if (user.password === data.password){
                authenticated = true;
                var filteredObject = {
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    picture: user.picture
                };
                return [200, filteredObject, {}];
            }
            return [401, {
                status: 'error', //ok|redirect|error
                to: '',
                html: '',
                message: 'Invalid Username and/or Password!'
            }, {}];
        });
        
        $httpBackend.whenGET(/\/logout/).respond(function(method, url, data, headers){
            authenticated = false;
            return [200, {status: 'ok'}, {}];
        });
        
        $httpBackend.whenGET(/templates\/.*/).passThrough();
    });
})();
