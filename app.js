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
                })
                .state('profile', {
                    url: "/profile",
                    templateUrl: "profile.html",
                    controller: "ProfileController"
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
                    username: userData.uid
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
        var messagesFirebase = $firebaseArray(firebaseRef.child('messages'));
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

        $scope.auth.$onAuth(function (authData) {

            if (authData) {
                $scope.authData = authData;
            }
        });

        $scope.date = new Date();
        $scope.messages = messagesFirebase;

        $scope.post_message = function () {

            messagesFirebase.$add({
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

        $scope.profile = function () {
            $state.go('profile');
        }
}]);

myApp.controller("ProfileController", ["$scope", "$firebaseArray", "Auth", "$firebaseObject", "$state",
    function ($scope, $firebaseArray, Auth, $firebaseObject, $state) {

        var firebaseRef = new Firebase("https://sweltering-fire-9533.firebaseio.com");
        var authData = firebaseRef.getAuth();
        console.log(authData);
        $scope.profiles = {};
        $scope.profiles.profile = {};
        $scope.newPassword = "";
        $scope.changePasswordMessage = "";
        $scope.changePasswordFlag = false;
        $scope.errorMessage = "";
        $scope.errorFlag = false;

        var profilesList = $firebaseObject(firebaseRef.child('profiles'));
        console.log(profilesList);

        profilesList.$loaded().then(function () {
            angular.forEach(profilesList, function (item, index) {
                if (authData.uid == item.username) {
                    $scope.profiles.profile = item;
                    console.log($scope.profiles.profile);
                    $scope.profileIndex = index;
                    console.log($scope.profileIndex);
                }
            });
        });

        $scope.changePassword = function () {
            Auth.$changePassword({
                email: $scope.profiles.profile.email,
                oldPassword: $scope.profiles.profile.password,
                newPassword: $scope.newPassword
            }).then(function () {
                var profileToUpdateReference = firebaseRef.child('profiles').child($scope.profileIndex);
                console.log(profileToUpdateReference);

                profileToUpdateReference.update({
                    email: $scope.profiles.profile.email,
                    password: $scope.newPassword,
                    username: $scope.profiles.profile.username
                });
                $scope.changePasswordMessage = "The password was changed successfully.";
                $scope.changePasswordFlag = true;
                $scope.profiles.profile.email = "";
                $scope.profiles.profile.username = "";
                $scope.newPassword = "";
            }).catch(function (error) {
                $scope.errorMessage = error.message;
                $scope.errorFlag = true;
            });
        }

        $scope.messagesTab = function () {
            $state.go('index');
        }

    }]);