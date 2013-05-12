angular.module('news',[]).
config(function($routeProvider,$locationProvider){
   
   $locationProvider.html5Mode(true);

   $routeProvider.
   when("/",{templateUrl: "/partials/topic.html", controller:"TopicController"}).
   when("/news",{templateUrl: "/partials/news.html", controller:"NewsController"}).
   otherwise({redirectTo:"/"});

});