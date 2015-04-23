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
                    templateUrl: "index.html",
                    controller: "RootController"
                })
                .state('login', {
                    url: "/login",
                    templateUrl: "login.html",
                    controller: "LoginController"
                });
    }]);

myApp.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        var ref = new Firebase("https://sweltering-fire-9533.firebaseio.com");
        return $firebaseAuth(ref);
  }
]);

myApp.controller("LoginController", ["$scope", "Auth", "$window", "$state",
  function ($scope, Auth, $window, $state) {

        $scope.register = function () {

            $scope.message = null;
            $scope.error = null;
            $scope.flag = false;

            Auth.$createUser({
                email: $scope.email,
                password: $scope.password
            }).then(function (userData) {
                $scope.message = "The user with uid: " + userData.uid + " was created successfully.";
                $scope.email = "";
                $scope.password = "";
            }).catch(function (error) {
                $scope.error = error;
            });
        };

        $scope.login = function () {

            Auth.$authWithPassword({
                email: $scope.email,
                password: $scope.password
            }).then(function (authData) {

                $scope.authData = authData;
                console.log("Authenticated successfully with payload:", authData);
                console.log($scope.authData);
                $scope.email = "";
                $scope.password = "";
                $state.go('index');
            }).catch(function (error) {
                $scope.error = error.code;
            });

        }

        $scope.removeUser = function () {

            $scope.message = null;
            $scope.error = null;

            Auth.$removeUser({
                email: $scope.email,
                password: $scope.password
            }).then(function () {
                $scope.message = "The user was removed.";
            }).catch(function (error) {
                $scope.error = error;
            });

            $scope.email = "";
            $scope.password = "";
        };

            }]);


myApp.controller("RootController", ["$scope", "$firebaseArray", "Auth", "$window", "$firebaseObject", "$state",
        function ($scope, $firebaseArray, Auth, $window, $firebaseObject, $state) {

        var ref = new Firebase("https://sweltering-fire-9533.firebaseio.com/");

        var authData = ref.getAuth();

        if (authData) {
            console.log("User " + authData.uid + " is logged in with " + authData.provider);

        } else {
            console.log("User is logged out");
            $state.go('login');
        }

        var array = $firebaseArray(ref);

        $scope.auth = Auth;

        var array = $firebaseArray(ref);

        angular.forEach(array, function (index) {
            console.log(array[index] == authData.uid);
        });

        $scope.auth = Auth;
        $scope.auth.$onAuth(function (authData) {

            if (authData) {
                console.log("Logged in as:", authData.uid);
                $scope.authData = authData;
            } else {
                console.log("Logged out");
            }
        });

        var custom = [];

        var obj = $firebaseObject(ref);

        obj.$loaded().then(function () {

            angular.forEach(obj, function (value) {
                custom.push({
                    "name": value.person,
                    "oppinion": value.text
                });
                console.log(value);
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
            ref.unauth();
            $state.go('login');
        }

}]);