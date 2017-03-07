/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

import angular from 'angular';
import EASTER_EGG_MODULE from '../easter-eggs/easter-eggs-module';
import FEEDBACK_MODULE from '../feedback/feedback-module';
import UPGRADE_VERSION_MODULE from '../upgrade-version/upgrade-version-module';
import WIDGET_CONTAINERS from '../widgets-containers/widgets-containers-module';

import DataPrepApp from './app-directive';

const MODULE_NAME = 'data-prep.app';

angular.module(MODULE_NAME,
	[
		EASTER_EGG_MODULE,
		FEEDBACK_MODULE,
		UPGRADE_VERSION_MODULE,
		WIDGET_CONTAINERS,
	])
    .directive('dataprepApp', DataPrepApp);

export default MODULE_NAME;
