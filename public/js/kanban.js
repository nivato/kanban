(function(){
    var app = angular.module('Kanban', ['ngRoute', 'flow', 'ngImgCrop']);
    
    app.factory('$alert', ['$timeout', function($timeout){
        var alrt = {};
        alrt.type = '';
        alrt.message = '';
        alrt.css = '';
        alrt.icon = '';
        alrt.raise = function(type, message){
            alrt.type = type;
            alrt.message = message;
            switch(alrt.type) {
                case 'success':
                    alrt.css = 'alert-success';
                    alrt.icon = 'ok-sign';
                    break;
                case 'info':
                    alrt.css = 'alert-info';
                    alrt.icon = 'info-sign';
                    break;
                case 'warning':
                    alrt.css = 'alert-warning';
                    alrt.icon = 'exclamation-sign';
                    break;
                case 'error':
                    alrt.css = 'alert-danger';
                    alrt.icon = 'exclamation-sign';
                    break;
                default:
                    alrt.css = 'alert-info';
                    alrt.icon = 'info-sign';
            }
            if (alrt.type !== 'error'){
                $timeout(function(){alrt.type = null;}, 6000);
            }
        };
        return alrt;
    }]);
    
    app.config(['$routeProvider', '$locationProvider', 'flowFactoryProvider', '$compileProvider', function($routeProvider, $locationProvider, flowFactoryProvider, $compileProvider){
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {templateUrl: '/templates/board.html', controller: 'BoardController', controllerAs: 'sprint'})
            .when('/backlog', {templateUrl: '/templates/backlog.html'})
            .when('/profile', {templateUrl: '/templates/profile.html', controller: 'ProfileController', controllerAs: 'profile'})
            .when('/search', {templateUrl: '/templates/search.html'})
            .when('/sprints', {templateUrl: '/templates/sprints.html'})
            .when('/team', {templateUrl: '/templates/team.html'})
            .when('/welcome', {templateUrl: '/templates/welcome.html'})
            .when('/TCT-:id', {templateUrl: '/templates/ticket.html', controller: 'TicketController', controllerAs: 'tct'})
            .when('/tct-:id', {templateUrl: '/templates/ticket.html', controller: 'TicketController', controllerAs: 'tct'})
            .when('/register', {templateUrl: '/templates/register.html', controller: 'RegistrationController', controllerAs: 'reg'})
            .otherwise({templateUrl: '/templates/notfound.html'});
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(http|https|mailto|skype|tel):/);
        flowFactoryProvider.defaults = {
            target: '/api/avatar',
            permanentErrors: [404, 500, 501],
            testChunks: false
        };
    }]);

    app.controller('ApplicationController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var appCtrl = this;
        this.user = {};
        $scope.$on('user_logged_in', function(event, data){
            appCtrl.user = data;
        });
        $scope.$on('updated_user_avatar', function(event, data){
            appCtrl.user.picture = data;
        });
        this.logout = function(){
            $http.get('/api/logout');
            this.user = {};
            $location.path('/welcome');
        };
        this.authenticated = function(){
            return !!this.user.username;
        };
        $http.get('/api/access')
            .success(function(response, status, headers, config){
                appCtrl.user = response.data;
            })
            .error(function(response, status, headers, config){
                if ($location.path() !== '/register'){
                    $location.path('/welcome');
                }
            });
    }]);
    
    app.controller('AlertController', ['$alert', function($alert){
        this.alert = $alert;
    }]);
    
    app.controller('RegistrationController', ['$scope', '$http', '$location', '$alert', function($scope, $http, $location, $alert){
        var reg = this;
        this.user = {};
        this.generatedCaptcha = '';
        this.alreadyTakenUsernames = [];
        this.emailPattern = /^([A-Z0-9\-_]+\.?[A-Z0-9\-_]+)+@([A-Z0-9\-_]+\.?[A-Z0-9\-_]+)+\.[a-z]{2,4}$/i;
        this.usernamePattern = /^[A-Z0-9_-]+$/i;
        this.submitRegistration = function(){
            $http.post('/api/register', this.user)
                .success(function(response, status, headers, config){
                    $alert.raise('congratulations', 'You have successfully registered. Now you can Log-in to Kanban.');
                    $location.path('/welcome');
                })
                .error(function(response, status, headers, config){
                    if (!!response.messages.username && response.messages.username.indexOf('already been taken') !== -1){
                        reg.alreadyTakenUsernames.push(reg.user.username);
                        reg.checkUsernameUniqueness();
                    }
                    reg.generateCAPTCHA();
                    reg.captcha = '';
                });
        };
        this.cancelRegistration = function(){
            $location.path('/welcome');
        };
        this.checkUsernameUniqueness = function(){
            var usernameField = $scope.reg_form.reg_username;
            if (usernameField.$error.required || usernameField.$error.minlength || usernameField.$error.maxlength){
                usernameField.$setValidity('unique', true);
                return;
            }
            if (this.alreadyTakenUsernames.indexOf(usernameField.$viewValue) === -1){
                usernameField.$setValidity('unique', true);
            } else {
                usernameField.$setValidity('unique', false);
            }
        };
        this.checkPasswordConfirmation = function(){
            var passwordField = $scope.reg_form.reg_password;
            var confirmationField = $scope.reg_form.reg_confirm_password;
            if (confirmationField.$error.required){
                confirmationField.$setValidity('match', true);
                return;
            }
            if (confirmationField.$viewValue === passwordField.$viewValue){
                confirmationField.$setValidity('match', true);
            } else {
                confirmationField.$setValidity('match', false);
            }
        };
        this.generateCAPTCHA = function(){
            var hexDigits = '0123456789abcdef';
            this.generatedCaptcha = '';
            for (var i = 0; i < 6; i++){
                this.generatedCaptcha += hexDigits[Math.floor((Math.random() * 16))];
            }
            var canvas = $('#captcha')[0];
            var context = canvas.getContext('2d');
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
            var sx = -2;
            var sy = 0.15;
            context.transform(1, sy, sx, 1, 0, 0);
            context.font = 'bold 25px sans-serif';
            context.fillStyle = '#bcbcbc';
            context.fillText(this.generatedCaptcha, 35, 15);
        };
        this.checkCAPTCHA = function(){
            var captchaField = $scope.reg_form.reg_captcha;
            if (captchaField.$error.required){
                captchaField.$setValidity('captcha', true);
                return;
            }
            if (captchaField.$viewValue === this.generatedCaptcha){
                captchaField.$setValidity('captcha', true);
            } else {
                captchaField.$setValidity('captcha', false);
            }
        };
        this.generateCAPTCHA();
    }]);

    app.controller('NavigationController', ['$scope', '$location', function($scope, $location){
        var navbar = this;
        this.tab = 'none';
        this.refresh = function(){
            switch($location.path()) {
                case '/':
                    this.tab = 'board';
                    break;
                case '/backlog':
                    this.tab = 'backlog';
                    break;
                case '/sprints':
                    this.tab = 'sprints';
                    break;
                case '/team':
                    this.tab = 'team';
                    break;
                default:
                    this.tab = 'none';
            }
        };
        this.isSelceted = function(checkTab){
            return this.tab === checkTab;
        };
        $scope.$on('$locationChangeSuccess', function(event, data){
            navbar.refresh();
        });
        this.refresh();
    }]);

    app.controller('BoardController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var sprint = this;
        this.tickets = [];
        this.numberOfTicketsWithStatus = function(status){
            var num = 0;
            for (var t = 0; t < this.tickets.length; t++){
                if (this.tickets[t].status === status){
                    num++;
                }
            }
            return num;
        };
        this.refresh = function(){
            $http.get('/api/tickets')
                .success(function(response, status, headers, config){
                    sprint.tickets = response.data;
                })
                .error(function(response, status, headers, config){
                    sprint.tickets = [];
                    if (response.messages[0] === 'Unauthorized'){
                        $location.path('/welcome');
                    }
                });
        };
        this.refresh();
    }]);

    app.controller('LoginController', ['$scope', '$location', '$http', function($scope, $location, $http){
        var loginForm = this;
        this.user = {};
        this.messages = [];
        this.submitLogin = function(){
            this.messages = [];
            $http.post('/api/login', this.user)
                .success(function(response, status, headers, config){
                    loginForm.user = {};
                    $scope.$emit('user_logged_in', response.data);
                    $('#loginForm').modal('hide');
                    $location.path('/');
                })
                .error(function(response, status, headers, config){
                    loginForm.messages = response.messages || ['Something bad happened during Login!', 'Check your Internet connection!'];
                });
        };
        this.registration = function(){
            $('#loginForm').modal('hide');
            $location.path('/register');
        };
    }]);

    app.controller('ProfileController', ['$scope', '$timeout', '$http', '$alert', function($scope, $timeout, $http, $alert){
        var profile = this;
        this.user = {};
        this.croppedAvatarURI = '';
        this.editable = {};
        var allowedTypes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/bmp', 'image/x-windows-bmp'];
        this.isEditable = function(fieldName){
            return this.editable.field === fieldName;
        };
        this.editField = function(fieldName){
            this.cancelEdit(this.editable.field);
            this.editable.field = fieldName;
            this.editable.previousValue = this.user[fieldName];
        };
        this.cancelEdit = function(fieldName){
            this.editable.field = '';
            this.user[fieldName] = this.editable.previousValue;
            this.editable.previousValue = '';
        };
        this.saveEdit = function(fieldName){
            this.editable.field = '';
            this.editable.previousValue = '';
            var data = {};
            data[fieldName] = this.user[fieldName];
            $http.put('/api/profile', data)
                .error(function(response, status, headers, config){
                    $alert.raise('error', 'Failed to save ' + fieldName + ' field.');
                });
        };
        this.saveEditOnEnter = function(keyEvent, fieldName){
            if (keyEvent.charCode === 13 || keyEvent.keyCode === 13 || keyEvent.which === 13){
                this.saveEdit(fieldName);
            }
        };
        this.syncUserAvatar = function(){
            $http.put('/api/profile', {picture: this.user.picture})
                .success(function(response, status, headers, config){
                    $scope.$emit('updated_user_avatar', profile.user.picture);
                });
        };
        this.changeAvatar = function(){
            this.$flow.on('filesSubmitted', function(){
                URL.revokeObjectURL(profile.avatarFileURL);
                var flowFile = profile.$flow.files[0];
                if (!!flowFile){
                    if (allowedTypes.indexOf(flowFile.file.type) === -1){
                        profile.$flow.cancel();
                    } else {
                        profile.avatarFileURL = URL.createObjectURL(flowFile.file);
                        $('#cropImageDialog').modal('show');
                    }
                }
                profile.$flow.off('filesSubmitted');
            });
        };
        this.saveAvatar = function(){
            this.$flow.on('fileSuccess', function(file, response){
                $timeout(function(){profile.$flow.cancel();}, 800);
                profile.$flow.off('fileSuccess');
                profile.user.picture = JSON.parse(response).data;
                profile.syncUserAvatar();
            });
            this.$flow.upload();
        };
        this.cancelAvatar = function(){
            this.$flow.cancel();
        };
        this.cropAvatar = function(){
            var croppedFile = this.dataURItoFile(this.croppedAvatarURI);
            this.$flow.files[0].file = croppedFile;
            this.$flow.files[0].size = croppedFile.size;
            this.$flow.files[0].name = croppedFile.name;
            this.$flow.files[0].relativePath = croppedFile.name;
            this.$flow.files[0].bootstrap();
            $('.thumbnail.profile-avatar').attr('src', this.croppedAvatarURI);
            $('#cropImageDialog').modal('hide');
        };
        this.dataURItoFile = function(dataURI) {
            var base64 = ';base64,';
            var byteString, file;
            var mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0];
            if (dataURI.indexOf(base64) == -1){
                byteString = decodeURIComponent(dataURI.split(',')[1]);
                file = new Blob([byteString], {type: mimeType});
            } else {
                byteString = window.atob(dataURI.split(base64)[1]);
                var byteArray = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    byteArray[i] = byteString.charCodeAt(i);
                }
                file = new Blob([byteArray], {type: mimeType});
            }
            file.name = 'crop.png';
            file.lastModifiedDate = new Date();
            return file;
        };
        this.fullName = function(){
            return (this.user.first_name || '') + ' ' + (this.user.last_name || '');
        };
        $http.get('/api/profile')
            .success(function(response, status, headers, config){
                profile.user = response.data;
            });
    }]);
    
    app.controller('NewTicketController', ['$http', '$location', function($http, $location){
        var newTicket = this;
        this.ticketTypes = ['task', 'bug'];
        this.ticket = {ticket_type: this.ticketTypes[0]};
        this.messages = [];
        this.createNewTicket = function(){
            $http.post('/api/ticket', this.ticket)
                .success(function(response, status, headers, config){
                    newTicket.ticket = {ticket_type: newTicket.ticketTypes[0]};
                    $('#new_ticket').modal('hide');
                    $location.path('/TCT-' + response.data.id);
                })
                .error(function(response, status, headers, config){
                    newTicket.messages = response.messages || ['Something bad happened during Ticket Creation!', 'Check your Internet connection!'];
                });
        };
        
    }]);
    
    app.controller('TicketController', ['$routeParams', '$http', '$location', function($routeParams, $http, $location){
        var ticketCtrl = this;
        this.ticket = {};
        $http.get('/api/ticket/' + $routeParams.id)
            .success(function(response, status, headers, config){
                ticketCtrl.ticket = response.data;
            })
            .error(function(response, status, headers, config){
                ticketCtrl.ticket = {};
                if (!!response.messages && (response.messages[0] === 'Unauthorized')){
                    $location.path('/welcome');
                } else {
                    $location.path('/notfound');
                }
            });
    }]);
    
    app.directive('navigationBar', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/navigation-bar.html',
            controller: 'NavigationController',
            controllerAs: 'nav'
        };
    });

    app.directive('alert', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/alert.html',
            controller: 'AlertController',
            controllerAs: 'lrt'
        };
    });

    app.directive('loginForm', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/login-form.html',
            controller: 'LoginController',
            controllerAs: 'lgn'
        };
    });

    app.directive('boardTicket', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/board-ticket.html',
        };
    });

    app.directive('cropImageDialog', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/crop-image-dialog.html',
        };
    });
    
    app.directive('newTicket', function(){
        return {
            restrict: 'E',
            templateUrl: '/templates/new-ticket.html',
            controller: 'NewTicketController',
            controllerAs: 'ntct'
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

    app.filter('capitalize', function() {
        return function(input, all) {
            if (!!all){
                return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
            } else {
                return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1) : '';
            }
        };
    });

})();
