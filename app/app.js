define(function() {

    var app = angular.module('app', ['ui.router', 'ngAnimate']).run(run);

    app.init = function() {
        angular.bootstrap(document, ['app']);
    };

    function run($rootScope) {
        // track current state for active tab
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $rootScope.currentState = toParams.page;
        });
    }


    app.directive('phoneNumber', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, el, atts, ngModel) {

                /* called when model is changed from the input element */
                ngModel.$parsers.unshift(function(viewValue) {

                    var numbers = viewValue.replace(/\D/g, ''),
                        char = { 0: '(', 3: ') ', 6: ' - ' };
                    numbers = numbers.slice(0, 10);
                    viewValue = '';

                    for (var i = 0; i < numbers.length; i++) {
                        viewValue += (char[i] || '') + numbers[i];
                    }

                    // set the input to formatted value
                    el.val(viewValue);

                    return viewValue;
                });

                /* called when model is changed outside of the input element */
                ngModel.$formatters.push(function(modelValue) {
                    return modelValue;
                });

                /* called when the model changes, if validation fails the model value won't be assigned */
                ngModel.$validators.phone = function(modelValue, viewValue) {
                    if (modelValue) {
                        return modelValue.match(/\d/g).length === 10;
                    } else {
                        return false;
                    }
                }

            }
        }
    });

    app.directive('moveFocus', function() {
        function getCaretPosition(elem) {
            // Internet Explorer Caret Position
            if (document.selection && document.selection.createRange) {
                var range = document.selection.createRange();
                var bookmark = range.getBookmark();
                return bookmark.charCodeAt(2) - 2;
            }

            // Firefox Caret Position
            return elem.setSelectionRange && elem.selectionStart;
        }
        return {
            restrict: 'A',
            link: function(scope, elem, attr) {
                var tabindex = parseInt(attr.tabindex);
                var maxlength = parseInt(attr.maxlength);

                elem.on('input, keydown', function(e) {
                    var val = elem.val(),
                        cp,
                        code = e.which || e.keyCode;

                    if (val.length === maxlength && [8, 37, 38, 39, 40, 46].indexOf(code) === -1) {
                        var next = document.querySelectorAll('#input' + (tabindex + 1));
                        next.length && next[0].focus();
                        return;
                    }

                    cp = getCaretPosition(this);
                    if ((cp === 0 && code === 46) || (cp === 1 && code === 8)) {
                        var prev = document.querySelectorAll('#input' + (tabindex - 1));
                        e.preventDefault();
                        elem.val(val.substring(1));
                        prev.length && prev[0].focus();
                        return;
                    }
                });
            }
        };
    });


    app.directive('price', [function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                attrs.$set('ngTrim', "false");

                var formatter = function(str, isNum) {
                    str = String(Number(str || 0) / (isNum ? 1 : 100));
                    str = (str == '0' ? '0.0' : str).split('.');
                    str[1] = str[1] || '0';
                    return str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + (str[1].length == 1 ? str[1] + '0' : str[1]);
                }
                var updateView = function(val) {
                    scope.$applyAsync(function() {
                        ngModel.$setViewValue(val || '');
                        ngModel.$render();
                    });
                }
                var parseNumber = function(val) {
                    var modelString = formatter(ngModel.$modelValue, true);
                    var sign = {
                        pos: /[+]/.test(val),
                        neg: /[-]/.test(val)
                    }
                    sign.has = sign.pos || sign.neg;
                    sign.both = sign.pos && sign.neg;

                    if (!val || sign.has && val.length == 1 || ngModel.$modelValue && Number(val) === 0) {
                        var newVal = (!val || ngModel.$modelValue && Number() === 0 ? '' : val);
                        if (ngModel.$modelValue !== newVal)
                            updateView(newVal);

                        return '';
                    } else {
                        var valString = String(val || '');
                        var newSign = (sign.both && ngModel.$modelValue >= 0 || !sign.both && sign.neg ? '-' : '');
                        var newVal = valString.replace(/[^0-9]/g, '');
                        var viewVal = newSign + formatter(angular.copy(newVal));

                        if (modelString !== valString)
                            updateView(viewVal);

                        return (Number(newSign + newVal) / 100) || 0;
                    }
                }
                var formatNumber = function(val) {
                    if (val) {
                        var str = String(val).split('.');
                        str[1] = str[1] || '0';
                        val = str[0] + '.' + (str[1].length == 1 ? str[1] + '0' : str[1]);
                    }
                    return parseNumber(val);
                }

                ngModel.$parsers.push(parseNumber);
                ngModel.$formatters.push(formatNumber);
            }
        };
    }]);

    app.controller('aboutController', function($scope, testService) {
        var vm = this;
        $scope.about = "THIS IS MY ABOUT PAGE";
        $scope.aboutData = testService.data;
    });

    app.controller('homeController', function($scope, testService) {
        var vm = this;
        $scope.home = "THIS IS MY HOME PAGE";
        $scope.homeData = testService.data;
    });

    app.controller('sumController', function($scope) {
        $scope.addNumbers = function() {
            var a = Number($scope.a || 0);
            var b = Number($scope.b || 0);
            var c = Number($scope.c || 0);
            var d = Number($scope.d || 0);
            $scope.d = a + b + c;
        }

        $scope.spreadValue = function() {
            var percentage = $scope.d / 3;
            $scope.a = percentage;
            $scope.b = percentage;
            $scope.c = percentage;
        }

    });

    app.controller('contactController', function($scope, $stateParams) {
        var vm = this;
        $scope.pageClass = 'page-contact';
        $scope.contact = "THIS IS MY CONTACT PAGE";
        $scope.optional = $stateParams.optional;
        $scope.exists = false;
            if($scope.optional != undefined){
                $scope.exists = true;
            }
    });

    app.controller('charController', function($scope) {
        var vm = this;
        $scope.pageClass = 'page-contact';
        $scope.contact = "THIS IS MY CONTACT PAGE";
    });

    app.controller('employeesController', function($scope) {
        $scope.sortType = 'name';
        $scope.searchFilter = '';
        $scope.employees = [
            { "id": 1, "name": 'Joel Hughes', "salary": 3000 },
            { "id": 2, "name": 'Fredrick Francis', "salary": 4000 },
            { "id": 3, "name": 'Lawrence Tucker', "salary": 5000 },
            { "id": 4, "name": 'Gerardo Patrick', "salary": 6000 },
            { "id": 5, "name": 'Jennifer Bishop', "salary": 8000 },
            { "id": 6, "name": 'Bryant Matthews', "salary": 3000 },
            { "id": 7, "name": 'Kerry Garcia', "salary": 2000 },
            { "id": 8, "name": 'Neal Carson', "salary": 2000 },
            { "id": 9, "name": 'Janet Curtis', "salary": 5000 },
            { "id": 10, "name": 'Gayle Black', "salary": 2000 },
            { "id": 11, "name": 'Lula Webb', "salary": 2000 },
            { "id": 12, "name": 'Judith Griffin', "salary": 4000 },
            { "id": 13, "name": 'Kathryn Goodman', "salary": 20000 },
            { "id": 14, "name": 'Ray Cohen', "salary": 2000 },
            { "id": 15, "name": 'Judith Goodman', "salary": 2000 },
            { "id": 16, "name": 'Ray Griffin', "salary": 2000 },
            { "id": 17, "name": 'Peter Griffin', "salary": 2000 },
            { "id": 18, "name": 'Meg Ryan', "salary": 2200 },
            { "id": 19, "name": 'Saul Goodman', "salary": 7000 },
            { "id": 20, "name": 'Peter Tosh', "salary": 5000 },
            { "id": 21, "name": 'Michael Jackson', "salary": 4000 },
            { "id": 22, "name": 'Tom Waitt', "salary": 2500 },
            { "id": 23, "name": 'Jerry Hsu', "salary": 1500 },
            { "id": 24, "name": 'Steve Jobs', "salary": 2000 },
            { "id": 25, "name": 'Billy Idol', "salary": 2000 },
            { "id": 26, "name": 'John Cena', "salary": 2000 },
            { "id": 27, "name": 'Kevin Long', "salary": 1000 },
            { "id": 28, "name": 'Andrew Reynolds', "salary": 1000 },
            { "id": 29, "name": 'Jim Greco', "salary": 3800 },
            { "id": 30, "name": 'Erik Ellington', "salary": 2900 },
            { "id": 31, "name": 'Jamie Thomas', "salary": 3000 },
            { "id": 32, "name": 'Jeff Grosso', "salary": 5600 },
            { "id": 33, "name": 'Steve Caballero', "salary": 400 },
            { "id": 34, "name": 'Patrick Joel', "salary": 1000 },
            { "id": 35, "name": 'Bill Waters', "salary": 2200 },
            { "id": 36, "name": 'Charles Bradley', "salary": 2000 },
            { "id": 37, "name": 'Tony Hawk', "salary": 25000 },
            { "id": 38, "name": 'Tony Alva', "salary": 2000 },
            { "id": 39, "name": 'John Doe', "salary": 2500 },
            { "id": 40, "name": 'Bill Murray', "salary": 2000 },
            { "id": 41, "name": 'Nate Jones', "salary": 2000 },
            { "id": 42, "name": 'Regina Spektor', "salary": 20000 },
            { "id": 43, "name": 'Lindsay Lohan', "salary": 3500 },
            { "id": 44, "name": 'Kurt Cobain', "salary": 4300 },
            { "id": 45, "name": 'John Ramone', "salary": 2100 },
            { "id": 46, "name": 'Tom Hanks', "salary": 2800 },
            { "id": 47, "name": 'Tom Cruise', "salary": 2500 },
            { "id": 48, "name": 'Jerry Saintfield', "salary": 10000 },
            { "id": 49, "name": 'Jonas Hsu', "salary": 4900 },
            { "id": 50, "name": 'Karl Blohm', "salary": 5000 }
        ];
    });

    app.service('testService', function() {
        this.data = { value: 'foo' };
    });

    var loadOnDemand = function(pageOnDemand) {
        return pageOnDemand.page;
    };

    app.config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('page', {
                url: '/:page?optional',
                templateUrl: function($stateParams) {
                    return loadOnDemand($stateParams) + '.html';
                },
                controllerUrl: function($stateParams) {
                    return loadOnDemand($stateParams) + 'Controller';
                },
                controllerAs: 'vm'
            })
    });

    return app;
});
