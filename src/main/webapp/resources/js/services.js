'use strict';

myapp.service('Session', function() {
	this.create = function(data) {
		this.id = data.id;
		this.login = data.login;
		this.firstName = data.firstName;
		this.lastName = data.familyName;
		this.email = data.email;
		this.userRoles = [];
		angular.forEach(data.authorities, function(value, key) {
			this.push(value.name);
		}, this.userRoles);
	};
	this.invalidate = function() {
		this.id = null;
		this.login = null;
		this.firstName = null;
		this.lastName = null;
		this.email = null;
		this.userRoles = null;
	};
	return this;
});

myapp.service('AuthSharedService', function($rootScope, $http, $resource,
		$location, authService, config, Session) {
	return {
		login : function(userName, password, rememberMe) {
			var property = {
				ignoreAuthModule : 'ignoreAuthModule',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			};
			$http.post(config.domain + 'authenticate', $.param({
				username : userName,
				password : password,
				rememberme : rememberMe
			}), property).success(function(data, status, headers, property) {
				authService.loginConfirmed(data);
			}).error(function(data, status, headers, property) {
				$rootScope.authenticationError = true;
				Session.invalidate();
			});
		},
		getAccount : function() {
			$rootScope.loadingAccount = true;
			// $http.get(config.domain + 'security/account').then(function(response) {
			// authService.loginConfirmed(response.data);
			// });

			$http({
				method : 'GET',
				url : config.domain + 'security/account'
			}).then(function successCallback(response) {
				authService.loginConfirmed(response.data);
			}, function errorCallback(response) {
				Session.invalidate();
				$rootScope.authenticated = false;
				$rootScope.loadingAccount = false;
				$location.path('/login');
			});

		},
		isAuthorized : function(authorizedRoles) {
			if (!angular.isArray(authorizedRoles)) {
				if (authorizedRoles == '*') {
					return true;
				}
				authorizedRoles = [ authorizedRoles ];
			}
			var isAuthorized = false;
			angular.forEach(authorizedRoles, function(authorizedRole) {
				var authorized = (!!Session.login && Session.userRoles
						.indexOf(authorizedRole) !== -1);
				if (authorized || authorizedRole == '*') {
					isAuthorized = true;
				}
			});
			return isAuthorized;
		},
		logout : function() {
			$rootScope.authenticationError = false;
			$rootScope.authenticated = false;
			$rootScope.account = null;
			$http.get('logout');
			Session.invalidate();
			authService.loginCancelled();
		}
	};
});

myapp.service('HomeService', function($log, $resource) {
	return {
		getTechno : function() {
			var userResource = $resource(
					'resources/json/techno.json', {}, {
						query : {
							method : 'GET',
							params : {},
							isArray : true
						}
					});
			return userResource.query();
		}
	}
});

myapp.service('UsersService', function($log, $resource) {
	return {
		getAll : function() {
			var userResource = $resource(config.domain + 'users', {}, {
				query : {
					method : 'GET',
					params : {},
					isArray : true
				}
			});
			return userResource.query();
		}
	}
});

myapp.service('TokensService', function($log, $resource) {
	return {
		getAll : function() {
			var tokensResource = $resource(config.domain + 'security/tokens', {}, {
				query : {
					method : 'GET',
					params : {},
					isArray : true
				}
			});
			return tokensResource.query();
		}
	}
});
