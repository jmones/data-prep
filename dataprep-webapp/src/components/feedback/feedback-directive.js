(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.datagrid.directive:Export
     * @description This directive create the Export<br/>
     * @restrict E
     * @usage <feedback></feedback>
     */
    function Feedback() {
        return {
            templateUrl: 'components/feedback/feedback.html',
            restrict: 'E',
            bindToController: true,
            controllerAs: 'feedbackCtrl',
            controller: 'FeedbackCtrl'
        };
    }

    angular.module('data-prep.feedback')
        .directive('feedback', Feedback);
})();