(function() {
  'use strict';

  angular
    .module('app.service')
    .factory('AuthService', AuthService);

  ////////////////////////////////////////////////////////////

  /* @ngInject */
  function AuthService($q, $http, $window, OAuth, rbchina_api) {
    var LOCAL_TOKEN_KEY;
    var authToken;

    var service = {
      login: login,
      logout: logout,
      getUserInfo: getUserInfo,
      getAccessToken: getAccessToken,
      refreshAccessToken: refreshAccessToken,
      isAuthencated: isAuthencated,
      getCurrentUser: getCurrentUser,
      submitDeviceToken: submitDeviceToken
    };

    // 载入用户登录信息
    loadUserCredentials();

    return service;

    // 加载用户验证信息
    function loadUserCredentials() {
      var token = getAccessToken();
      if (token) {
        useCredentials(token);
      }
    }

    // 存储用户验证信息
    function storeUserCredentials(token) {
      useCredentials(token);
    }

    // 激活用户验证
    function useCredentials(token) {
      authToken = token;
      $window.localStorage['access_token'] = token;
      // Set the token as header for your requests!
      $http.defaults.headers.common['Authorization'] = "Bearer " + token;
    }

    // 销毁用户验证
    function destroyUserCredentials() {
      authToken = undefined;
      $http.defaults.headers.common['Authorization'] = undefined;
      OAuth.revokeToken();
      $window.localStorage['access_token'] = null;
      $window.localStorage['current_user'] = null;
      $window.localStorage['auth_info'] = null;
      setCurrentUser({});
    }

    function getUserInfo(login) {
      var q = $q.defer();
      var url = rbchina_api.url_prefix + '/users/' + login + '.json';
      $http.get(url, {
          params: {
            access_token: authToken
          }
        })
        .success(function(result) {
          q.resolve(result);
        }).error(function(err) {
          q.reject(err);
        });
      return q.promise;
    }

    function setCurrentUser(user) {
      $window.localStorage['current_user'] = JSON.stringify(user);
    }

    function getCurrentUser() {
      var info = $window.localStorage['current_user'];
      if (!info) {
        return null
      }
      return JSON.parse(info);
    }

    function submitDeviceToken(token) {
      var q = $q.defer();

      // 如果有传 Token，记录到 localStorage
      if (token != undefined) {
        $window.localStorage['device_token'] = token;
      }

      if (!isAuthencated()) {
        return q.promise;
      }

      var deviceToken = $window.localStorage['device_token'];
      if (deviceToken === undefined) {
        return q.promise;
      }

      var params = {
        platform: 'ios',
        token: deviceToken
      };
      var url = rbchina_api.url_prefix + '/devices.json';
      $http.post(url, params).success(function(result) {
        q.resolve(result);
      }).error(function(err) {
        q.reject(err);
      });
      return q.promise;
    }

    function login(user) {
      var q = $q.defer();
      if (!user.username) {
        q.reject("用户名或 Email 没有填写");
        return q.promise;
      }

      if (!user.password) {
        q.reject("还没未填写密码");
        return q.promise;
      }


      OAuth.getAccessToken(user)
        .then(function(result) {
          if (result.status == 200) {
            $window.localStorage['auth_info'] = JSON.stringify(user);
            storeUserCredentials(result.data.access_token);

            // 获取用户信息并存储
            getUserInfo('me')
              .then(function(response) {
                // 输出用户信息
                setCurrentUser(response.user);

                submitDeviceToken().then(function() { });
                q.resolve(response.user);
              }).catch(function(error) {
                q.reject(error);
              });
          } else if (result.status == 401) {
            q.reject("对不起，用户名或密码错误！");
          } else {
            q.reject("未知异常，登陆失败，请稍后再重试。")
          }
        }).catch(function(err) {
          q.reject("对不起，用户名或密码错误！");
        });
      return q.promise;
    }

    function logout() {
      destroyUserCredentials();
    }

    function isAuthencated() {
      return !!authToken && getCurrentUser().login;
    }

    function getAccessToken() {
      return authToken || $window.localStorage['access_token'] || null;
    }

    function refreshAccessToken() {
      var q = $q.defer();
      var info = $window.localStorage['auth_info'] || '{}';
      var user = JSON.parse(info) || {};
      if (!user.username || !user.password) {
        console.warn('There is not user login info stored');
        q.reject("No auth info")
        return q.promise;
      }

      return login(user);
    }
  }

})();
