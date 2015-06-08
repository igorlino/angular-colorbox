(function () {
    'use strict';

    angular.module('colorbox', [])
        .service('colorboxService', colorboxService)
        .directive('colorbox', colorboxDirective);

    function colorboxService() {

        //Colorbox JavaScript API reference:
        // http://www.jacklmoore.com/colorbox/

        var service = {
            colorbox: colorbox, //returns the colorbox jquery plugin
            next: next,//
            prev: prev,//These methods moves to the next and previous items in a group and are the same as pressing the 'next' or 'previous' buttons.
            close: close,//This method initiates the close sequence, which does not immediately complete. The lightbox will be completely closed only when the cbox_closed event / onClosed callback is fired.
            element: element,//This method is used to fetch the current HTML element that Colorbox is associated with. Returns a jQuery object containing the element. var $element = $.colorbox.element();
            resize: resize,//This allows Colorbox to be resized based on it's own auto-calculations, or to a specific size. This must be called manually after Colorbox's content has loaded. The optional parameters object can accept width or innerWidth and height or innerHeight. Without specifying a width or height, Colorbox will attempt to recalculate the height of it's current content.
            remove: remove//Removes all traces of Colorbox from the document. Not the same as $.colorbox.close(), which tucks colorbox away for future use.
        };
        return service;

        ////////////


        function colorbox() {
            return $.colorbox;
        }

        /**These methods moves to the next and previous items in a group and are the same as pressing the 'next' or
         * 'previous' buttons.*/
        function next() {
            $.colorbox.next();
        }

        /**These methods moves to the next and previous items in a group and are the same as pressing the 'next' or
         * 'previous' buttons.*/
        function prev() {
            $.colorbox.prev();
        }

        /**This method initiates the close sequence, which does not immediately complete. The lightbox will be completely
         * closed only when the cbox_closed event / onClosed callback is fired.*/
        function close() {
            $.colorbox.close();
        }

        /**This method is used to fetch the current HTML element that Colorbox is associated with. Returns a jQuery object
         * containing the element. var $element = $.colorbox.element();*/
        function element() {
            return $.colorbox.element();
        }

        /**This allows Colorbox to be resized based on it's own auto-calculations, or to a specific size. This must be
         * called manually after Colorbox's content has loaded. The optional parameters object can accept width or innerWidth
         * and height or innerHeight. Without specifying a width or height, Colorbox will attempt to recalculate the height of it's current content. */
        function resize() {
            $.colorbox.resize();
        }

        /**Removes all traces of Colorbox from the document. Not the same as $.colorbox.close(), which tucks colorbox away
         * for future use. */
        function remove() {
            $.colorbox.remove();
        }
    }

    colorboxDirective.$inject = ['$compile', '$rootScope', '$http', '$parse', '$timeout', 'colorboxService'];
    function colorboxDirective($compile, $rootScope, $http, $parse, $timeout, colorboxService) {
        var service = {
            restrict: 'E',
            scope: {
                open: '=',
                templateUrl: '&',

                onOpen: '&', //Callback that fires right before Colorbox begins to open.
                onLoad: '&', //Callback that fires right before attempting to load the target content.
                onComplete: '&', //Callback that fires right after loaded content is displayed.
                onCleanup: '&', //Callback that fires at the start of the close process.
                onClosed: '&' //Callback that fires once Colorbox is closed.

            },
            require: 'colorbox',
            link: link,
            controller: controller,
            controllerAs: 'vm'
        };
        return service;

        ////////////////////////////

        controller.$inject = ['$scope'];
        function controller($scope) {

        }

        link.$inject = ['$scope', '$element', '$attributes'];
        function link($scope, $element, $attributes, controller) {
            var cb = null;

            $scope.$watch('open', function (newValue, oldValue) {
                //console.log("watch $scope.open(" + $scope.open + ") " + oldValue + "->" + newValue);
                if (oldValue !== newValue) {
                    updateOpen(newValue);
                }
            });

            $scope.$on('$destroy', function () {
                $element.remove();
            });

            init();

            function updateOpen(newValue) {
                if (newValue) {
                    init(newValue);
                } else {
                    colorboxService.close();
                }
            }

            function init(open) {
                var options = {
                    href: $attributes.src,
                    boxFor: $attributes.boxFor,
                    onOpen: function () {
                        if ($scope.onOpen && $scope.onOpen()) {
                            $scope.onOpen()();
                        }
                    },
                    onLoad: function () {
                        if ($scope.onLoad && $scope.onLoad()) {
                            $scope.onLoad()();
                        }
                    },
                    onComplete: function () {
                        onComplete();
                        if ($scope.onComplete && $scope.onComplete()) {
                            $scope.onComplete()();
                        }
                    },
                    onCleanup: function () {
                        if ($scope.onCleanup && $scope.onCleanup()) {
                            $scope.onCleanup()();
                        }
                    },
                    onClosed: function () {
                        $scope.$apply(function () {
                            $scope.open = false;
                        });
                        if ($scope.onClosed && $scope.onClosed()) {
                            $scope.onClosed()();
                        }
                    }
                };

                //generic way that sets all (non-function) parameters of colorbox.
                if ($attributes.options) {
                    var cbOptionsFunc = $parse($attributes.options);
                    var cbOptions = cbOptionsFunc($scope);
                    angular.extend(options, cbOptions);
                }

                //clean undefined
                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        if (typeof(options[key]) === 'undefined') {
                            delete options[key];
                        }
                    }
                }

                if (typeof(open) !== 'undefined') {
                    options.open = open;
                }

                //wait for the DOM view to be ready
                $timeout(function () {
                    if (options.boxFor) {
                        //opens the element by id boxFor
                        cb = $(options.boxFor).colorbox(options);
                    } else if (options.href) {
                        //opens the colorbox using an href.
                        cb = $.colorbox(options);
                    }
                }, 0);
            }

            function onComplete() {
                $rootScope.$apply(function () {
                    var content = $('#cboxLoadedContent');
                    $compile(content)($rootScope);
                });
            }
        }


    }

    /*
     app.directive('xhrModal', ['$http','$compile',
     function ($http, $compile) {
     function compile (elem, cAtts) {
     var template,
     $element,
     loader;
     loader = $http.get(cAtts.template).success(function (resp) {
     template = resp;
     });

     return function (scope, elem, lAtts) {
     loader.then(function () {
     $element = $compile(template)(scope);
     });
     scope.close = function() {
     jQuery.colorbox.close();
     };
     scope.submit = function() {
     var result = scope.formSubmit();
     if (Object.isObject(result)) {
     result.success(function() {
     jQuery.colorbox.close();
     });
     } else if (result === false) {
     //noop
     } else {
     jQuery.colorbox.close();
     }
     };
     elem.on('click', function(e) {
     e.preventDefault();
     jQuery.colorbox({inline: true, href: $element});
     });
     }
     }

     return {
     scope: {
     formObject: '=',
     formErrors: '=',
     title: '@',
     template: '@',
     okButtonText: '@',
     formSubmit: '&'
     },
     compile: compile
     }
     }
     ]);

     */

})
();
