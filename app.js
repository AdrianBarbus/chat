'use strict';


var myApp = angular
    .module('myApp', [
    'firebase',
    'ui.router'
  ])
    .config(["$stateProvider", "$urlRouterProvider",
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise = "/login";
            $stateProvider
                .state('index', {
                    url: "/index",
                    templateUrl: "messages.html",
                    controller: "RootController"
                })
                .state('login', {
                    url: "/login",
                    templateUrl: "login.html",
                    controller: "LoginController"
                })
                .state('register', {
                    url: "/register",
                    templateUrl: "register.html",
                    controller: "RegisterController"
                });
}]);

myApp.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        var ref = new Firebase("https://sweltering-fire-9533.firebaseio.com");
        return $firebaseAuth(ref);
  }
]);

myApp.controller("RegisterController", ["$scope", "Auth", "$state", "$firebaseArray",
    function ($scope, Auth, $state, $firebaseArray) {
        var profilesRef = new Firebase("https://sweltering-fire-9533.firebaseio.com/profiles");
        $scope.message = "";
        $scope.userWasCreatedFlag = false;
        $scope.errorFlag = false;
        $scope.error = "";

        $scope.createUser = function () {
            $scope.userWasCreatedFlag = false;
            $scope.errorFlag = false;

            Auth.$createUser({
                email: $scope.email,
                password: $scope.password
            }).then(function (userData) {
                console.log(userData);
                var profiles = $firebaseArray(profilesRef);
                profiles.$add({
                    email: $scope.email,
                    password: $scope.password,
                    username: ""
                });
                $scope.email = "";
                $scope.password = "";
                $scope.message = "The user with uid: " + userData.uid + " was created successfully. To login go to Login page.";
                $scope.userWasCreatedFlag = true;
            }).catch(function (error) {
                $scope.error = error;
                $scope.errorFlag = true;
            });
        }

        $scope.backToLogin = function () {
            $state.go('login');
        }
}]);

myApp.controller("LoginController", ["$scope", "Auth", "$state",
  function ($scope, Auth, $state) {
        $scope.register = function () {
            $state.go('register');
        };

        $scope.login = function () {
            Auth.$authWithPassword({
                email: $scope.email,
                password: $scope.password
            }).then(function (authData) {
                $scope.authData = authData;
                $scope.email = "";
                $scope.password = "";
                $state.go('index');
            }).catch(function (error) {
                $scope.error = error.code;
            });
        }
}]);


myApp.controller("RootController", ["$scope", "$firebaseArray", "Auth", "$firebaseObject", "$state",
    function ($scope, $firebaseArray, Auth, $firebaseObject, $state) {
        var firebaseRef = new Firebase("https://sweltering-fire-9533.firebaseio.com");
        var messagesRef = new Firebase("https://sweltering-fire-9533.firebaseio.com/messages");
        var authData = firebaseRef.getAuth();

        if (authData) {
            console.log("User " + authData.uid + " is logged in with " + authData.provider);
            $scope.authData = true;
        } else {
            console.log("User is logged out");
            $scope.authData = false;
            $state.go('login');
        }

        $scope.auth = Auth;
        var array = $firebaseArray(messagesRef);

        $scope.auth = Auth;
        $scope.auth.$onAuth(function (authData) {

            if (authData) {
                $scope.authData = authData;
            }
        });

        $scope.date = new Date();

        var custom = [];

        var obj = $firebaseObject(messagesRef);

        obj.$loaded().then(function () {

            angular.forEach(obj, function (value) {
                custom.push({
                    "name": value.person,
                    "oppinion": value.text
                });
            });
            $scope.customMessages = custom;
        });

        $scope.messages = array;

        $scope.post_message = function () {

            array.$add({
                person: $scope.authData.uid,
                text: $scope.message,
                timestamp: Firebase.ServerValue.TIMESTAMP
            });

            $scope.message = "";

        }

        $scope.logout = function () {
            firebaseRef.unauth();
            $state.go('login');
        }

}]);