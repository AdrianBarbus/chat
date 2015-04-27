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
                });
    }]);

myApp.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        var ref = new Firebase("https://sweltering-fire-9533.firebaseio.com");
        return $firebaseAuth(ref);
  }
]);

myApp.controller("LoginController", ["$scope", "Auth", "$state",
  function ($scope, Auth, $state) {

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

        var ref = new Firebase("https://sweltering-fire-9533.firebaseio.com/");

        var authData = ref.getAuth();

        if (authData) {
            console.log("User " + authData.uid + " is logged in with " + authData.provider);
            $scope.authData = true;

        } else {
            console.log("User is logged out");
            $scope.authData = false;
            $state.go('login');
        }

        var array = $firebaseArray(ref);

        $scope.auth = Auth;

        var array = $firebaseArray(ref);

        $scope.auth = Auth;
        $scope.auth.$onAuth(function (authData) {

            if (authData) {
                console.log("Logged in as:", authData.uid);
                $scope.authData = authData;
            } else {
                console.log("Logged out");
            }
        });

        $scope.date = new Date();

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