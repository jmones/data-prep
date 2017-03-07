/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

describe('Dataset Progress component', () => {
	let scope;
	let element;

	beforeEach(angular.mock.module('data-prep.dataset-progress'));

	beforeEach(inject(($rootScope, $compile) => {
		scope = $rootScope.$new(true);
		element = angular.element('<dataset-progress></dataset-progress>');
		$compile(element)(scope);
		scope.$digest();
	}));

	afterEach(() => {
		scope.$destroy();
		element.remove();
	});

	it('should render dataset-progress', () => {
		expect(element.find('pure-progress').length).toBe(1);
	});
});
