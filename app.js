var myApp = angular.module("myApp", ["firebase"]);

myApp.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        var ref = new Firebase("https://sweltering-fire-9533.firebaseio.com");
        return $firebaseAuth(ref);
  }
]);

myApp.controller("LoginCtrl", ["$scope", "Auth", "$window",
  function ($scope, Auth, $window) {

        $scope.createUser = function () {

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
                window.location.href = 'index.html';
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

myApp.controller("MyController", ["$scope", "$firebaseArray", "Auth", "$window", "$firebaseObject",
        function ($scope, $firebaseArray, Auth, $window, $firebaseObject) {

        var ref = new Firebase("https://sweltering-fire-9533.firebaseio.com/");

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

            console.log($scope.authData);
            array.$add({
                person: $scope.authData.uid,
                text: $scope.message,
                timestamp: Firebase.ServerValue.TIMESTAMP
            });

            $scope.message = "";

        }

        $scope.logout = function () {
            ref.unauth();
            window.location.href = ('login.html');
        }

}]);