(function() {

'use strict';

/**
 * The ionic-contrib-frosted-glass is a fun frosted-glass effect
 * that can be used in iOS apps to give an iOS 7 frosted-glass effect
 * to any element.
 */
angular.module('ionic.contrib.drawer', ['ionic'])

.controller('drawerCtrl', ['$element', '$attrs', '$ionicGesture', '$document', function($element, $attr, $ionicGesture, $document) {
  var el = $element[0];
  var dragging = false;
  var startX, lastX, offsetX, newX;
  var side;
  var STATE = null;
  // How far to drag before triggering
  var thresholdX = 15;
  // How far from edge before triggering
  var edgeX = 40;

  var LEFT = 0;
  var RIGHT = 1;

  var isTargetDrag = false;

  var width = $element[0].clientWidth;

  var enableAnimation = function() {
    $element.addClass('animate');
  };
  var disableAnimation = function() {
    $element.removeClass('animate');
  };

  // Check if this is on target or not
  var isTarget = function(el) {
    while(el) {
      if(el === $element[0]) {
        return true;
      }
      el = el.parentNode;
    }
  };

  var startDrag = function(e) {
    disableAnimation();

    dragging = true;
    offsetX = lastX - startX;
    console.log('Starting drag');
    console.log('Offset:', offsetX);
  };

  var startTargetDrag = function(e) {
    disableAnimation();

    dragging = true;
    isTargetDrag = true;
    offsetX = lastX - startX;
    console.log('Starting target drag');
    console.log('Offset:', offsetX);
  };

  var doEndDrag = function(e) {
    startX = null;
    lastX = null;
    offsetX = null;
    isTargetDrag = false;

    if(!dragging) {
      return;
    }

    dragging = false;

    console.log('End drag');
    enableAnimation();

    ionic.requestAnimationFrame(function() {
      if(newX < (-width / 2)) {
        el.style.transform = el.style.webkitTransform = 'translate3d(' + -width + 'px, 0, 0)';
        STATE = 'close';
      } else {
        el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0, 0)';
        STATE = 'open';
      }
    });
  };

  var doDrag = function(e) {
    if(e.defaultPrevented) {
      return;
    }

    if(!lastX) {
      startX = e.gesture.touches[0].pageX;
    }

    lastX = e.gesture.touches[0].pageX;

    if(!dragging) {

      // Dragged 15 pixels and finger is by edge
      if(Math.abs(lastX - startX) > thresholdX) {
        if(isTarget(e.target)) {
          startTargetDrag(e);
        } else if(startX < edgeX) {
          startDrag(e);
        } 
      }
    } else {
      console.log(lastX, offsetX, lastX - offsetX);
      newX = Math.min(0, (-width + (lastX - offsetX)));
      ionic.requestAnimationFrame(function() {
        el.style.transform = el.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
      });

    }

    if(dragging) {
      e.gesture.srcEvent.preventDefault();
    }
  };

  side = $attr.side == 'left' ? LEFT : RIGHT;
  console.log(side);

  $ionicGesture.on('drag', function(e) {
    doDrag(e);
  }, $document);
  $ionicGesture.on('dragend', function(e) {
    doEndDrag(e);
  }, $document);


  this.close = function() {
    enableAnimation();
    STATE = 'close';
    ionic.requestAnimationFrame(function() {
      if(side === LEFT) {
        el.style.transform = el.style.webkitTransform = 'translate3d(-100%, 0, 0)';
        $element
          .removeClass('opened')
          .addClass('closed');
      } else {
        el.style.transform = el.style.webkitTransform = 'translate3d(100%, 0, 0)';
      }
    });
  };

  this.open = function() {
    enableAnimation();
    STATE = 'open';
    ionic.requestAnimationFrame(function() {
      if(side === LEFT) {
        el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
        $element
          .removeClass('closed')
          .addClass('opened');
      } else {
        el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
      }
    });
  };

  this.toggle = function () {
      if (STATE === 'open') {
          this.close();
      } else {
          this.open();
      }
  };

  this.isOpen = function () {
      return STATE === 'open';
  };
}])

.directive('drawer', ['$rootScope', '$ionicGesture', '$window', function($rootScope, $ionicGesture, $window) {
  return {
    restrict: 'E',
    controller: 'drawerCtrl',
    link: function($scope, $element, $attr, ctrl) {
      var intendedAction = false;
      var autoClose = angular.isDefined($attr.autoclose);
      $element.addClass($attr.side);
      $scope.openDrawer = function() {
        intendedAction = true;
        ctrl.open();
      };
      $scope.closeDrawer = function() {
        intendedAction = true;
        ctrl.close();
      };
      $scope.toggleDrawer = function () {
        intendedAction = true;
        ctrl.toggle();
      };
      angular.element($window).bind('click', function (event) {
          var target = event.target,
              el = $element[0];
          if (autoClose && el !== target && !el.contains(target) && ctrl.isOpen() && !intendedAction) {
              ctrl.close();
          }
          intendedAction = false;
      });
    }
  }
}])

.directive('drawerClose', ['$rootScope', function($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      $element.bind('click', function() {
        var drawerCtrl = $element.inheritedData('$drawerController');
        drawerCtrl.close();
      });
    }
  }
}]);

})();
