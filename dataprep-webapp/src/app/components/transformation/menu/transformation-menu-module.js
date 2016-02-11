/*  ============================================================================

  Copyright (C) 2006-2016 Talend Inc. - www.talend.com

  This source code is available under agreement available at
  https://github.com/Talend/data-prep/blob/master/LICENSE

  You should have received a copy of the agreement
  along with this program; if not, write to Talend SA
  9 rue Pages 92150 Suresnes, France

  ============================================================================*/

import TransformMenuCtrl from './transformation-menu-controller';
import TransformMenu from './transformation-menu-directive';

(() => {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.transformation-menu
     * @description This module contains the controller and directives to manage the transformation menu items
     * @requires talend.widget
     * @requires data-prep.transformation-form
     * @requires data-prep.type-transformation-menu
     * @requires data-prep.services.playground
     * @requires data-prep.services.transformation
     * @requires data-prep.services.state
     */
    angular.module('data-prep.transformation-menu',
        [
            'talend.widget',
            'data-prep.transformation-form',
            'data-prep.type-transformation-menu',
            'data-prep.services.playground',
            'data-prep.services.transformation',
            'data-prep.services.state'
        ])
        .controller('TransformMenuCtrl', TransformMenuCtrl)
        .directive('transformMenu', TransformMenu);
})();