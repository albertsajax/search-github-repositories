'use strict';

var githubApp = angular.module('githubApp', [
        'ngRoute',
        'ngResource',
        'MainCtrl',
        'Utils',
        'Config'
]);

githubApp.config(["$routeProvider", function($routeProvider){
    $routeProvider
        .when('/', {
            controller: 'MainCtrl'
        })
        .otherwise({ redirectTo: '/' });
}]),
  
angular.module('Config', []).constant('Config',
    {
        searchTerm: 'Angular',
        searchCategories: [
            { name: 'repositories' },
        ]
    }
),
  
  angular.module('MainCtrl', []).controller('MainCtrl', ['$scope','$compile' ,'Config','Github','Utils' ,
function($scope, $compile, Config, Github, Utils){

    $scope.searchTerm = Config.searchTerm;
    $scope.categories = Config.searchCategories;
    $scope.searchCategory = Config.searchCategories[0].name;

    var GithubApi = new Github();
    getResults();
    function getResults(){
        var searchRepos = GithubApi.searchAngularRepos($scope.searchTerm, $scope.searchCategory);

        searchRepos.success(function(data){
            if(data && data.items){
                $scope.results = $scope.searchCategory == 'repositories' ?
                    Utils.extractInfoRepo(data.items) : Utils.extractInfoUser(data.items);
                paginate();
            }
        });
    }


    $scope.doSearch = function(){
        getResults();
    };

    function paginate(){
        $scope.pconfig ={
            currentPage: 0,
            list: $scope.results,
            itemsPerPage: 16,
            id: 'pagination'
        };
        Utils.paginate($scope.pconfig);
        $compile($scope.pconfig.$editLine)($scope);
    }
}]),
  
  githubApp.directive('myTruncate', [ function() {

    return {
        link: function link(scope, element, attrs) {
            element.text(
                    attrs.myTruncate.length > 10 ? attrs.myTruncate.substr(0,8)+'...' : attrs.myTruncate
            );
        }
    };

}]),
  githubApp.directive('onEnter',[ function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.onEnter, {'event': event});
                });
                event.preventDefault();
            }
        });
    };
}]),
  
  githubApp.filter('offset', function() {
    return function(input, start) {
        if(input){
            start = parseInt(start, 10);
            return input.slice(start);
        }
    };
}),
  
githubApp.factory('Github', ['$http', function($http){

    function Github() {

    }

    Github.prototype.searchAngularRepos = function(term, category) {
        return $http.get('https://api.github.com/search/'+category, { params: { q: term } });
    };

    return Github;
}]),
  
  angular.module('Utils', []).service("Utils", [function() {

    this.extractInfoRepo = function(gitHubResults){
        var relevantInfo = [];
        gitHubResults.forEach(function(result){
           var filteredResult = {}, owner = {};
            filteredResult.title = result.name;
            filteredResult.description = result.description || 'No description.';
            filteredResult.createdAt = result.created_at;
            filteredResult.url = result.html_url;
            filteredResult.watchers = result.watchers;
            filteredResult.score = result.score;
            owner.name = result.owner.login;
            owner.avatarUrl = result.owner.avatar_url;
            owner.profileUrl = result.owner.html_url;
            filteredResult.owner = owner;
            relevantInfo.push(filteredResult);
        });
        return relevantInfo;
    };
}]);