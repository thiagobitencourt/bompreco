angular.module("bomprecotv").factory('httpInterceptor', function httpInterceptor ($q, $location, $rootScope) {
  return {
    responseError: function(rejection){
      if(rejection.status === 403){
        window.location = window.location.origin + '/login';
        return;
      }
      return( $q.reject( rejection ) );
    }
  }
});