/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

import angular from 'angular';
import settings from '../../../../mocks/Settings.mock';

const preparations = [
	{
		id: '1',
		type: 'preparation',
		name: 'JSO prep 1',
		author: 'jsomsanith',
		lastModificationDate: '2 minutes ago',
		dataset: 'Us states',
		nbLines: 20,
		nbSteps: 3,
		icon: 'talend-dataprep',
		actions: ['inventory:edit', 'preparation:copy-move', 'preparation:remove'],
		model: {
			id: '1',
			dataSetId: 'de3cc32a-b624-484e-b8e7-dab9061a009c',
			name: 'JSO prep 1',
			author: 'anonymousUser',
			creationDate: 1427447300000,
			lastModificationDate: 1427447300300,
			steps: [
				'35890aabcf9115e4309d4ce93367bf5e4e77b82a',
				'4ff5d9a6ca2e75ebe3579740a4297fbdb9b7894f',
				'8a1c49d1b64270482e8db8232357c6815615b7cf',
				'599725f0e1331d5f8aae24f22cd1ec768b10348d',
			],
			actions: [],
		},
	},
	{
		id: '2',
		type: 'preparation',
		name: 'JSO prep 2',
		author: 'jsomsanith',
		lastModificationDate: '5 days ago',
		dataset: 'First interaction',
		nbLines: 400,
		nbSteps: 2,
		icon: 'talend-dataprep',
		actions: ['inventory:edit', 'preparation:copy-move', 'preparation:remove'],
		model: {
			id: '2',
			dataSetId: '4d0a2718-bec6-4614-ad6c-8b3b326ff6c7',
			name: 'JSO prep 2',
			author: 'jsomsanith',
			creationDate: 1427447330000,
			lastModificationDate: 1427447330693,
			steps: [
				'ae1aebf4b3fa9b983c895486612c02c766305410',
				'24dcd68f2117b9f93662cb58cc31bf36d6e2867a',
				'599725f0e1331d5f8aae24f22cd1ec768b10348d',
			],
			actions: [],
		},
	},
];

const folders = [
	{
		id: 'Lw==',
		type: 'folder',
		name: 'JSO folder 1',
		author: 'jsomsanith',
		creationDate: '2 minutes ago',
		lastModificationDate: '2 minutes ago',
		icon: 'talend-folder',
		actions: ['inventory:edit', 'preparation:remove:folder'],
		model: {
			id: 'Lw==',
			path: '/JSO folder 1',
			name: 'JSO folder 1',
			owner: { displayName: 'jsomsanith' },
			creationDate: 1495305349058340,
			lastModificationDate: 1495305349058340,
		},
	},
	{
		id: 'Lw==2',
		type: 'folder',
		name: 'JSO folder 2',
		author: 'jsomsanith',
		creationDate: '5 days ago',
		lastModificationDate: '5 days ago',
		icon: 'talend-folder',
		actions: ['inventory:edit', 'preparation:remove:folder'],
		model: {
			id: 'Lw==2',
			path: '/JSO folder 2',
			name: 'JSO folder 2',
			owner: { displayName: 'jsomsanith' },
			creationDate: 1495305349058340,
			lastModificationDate: 1495305349058340,
		},
	},
];

describe('Inventory list container', () => {
	let scope;
	let createElement;
	let element;
	const body = angular.element('body');

	beforeEach(angular.mock.module('react-talend-components.containers'));

	beforeEach(inject(($rootScope, $compile, SettingsService) => {
		scope = $rootScope.$new(true);

		createElement = () => {
			element = angular.element(`
				<inventory-list
					id="'list'"
					display-mode="displayMode"
					folders="folders"
					items="items"
					sort-by="sortBy"
					sort-desc="sortDesc"
					view-key="'listview:preparations'"
					folder-view-key="'listview:folders'"
				/>
			`);
			body.append(element);
			$compile(element)(scope);
			scope.$digest();
		};

		SettingsService.setSettings(settings);
	}));

	beforeEach(inject((SettingsActionsService) => {
		// given
		scope.displayMode = 'table';
		scope.sortBy = 'name';
		scope.sortDesc = true;
		spyOn(SettingsActionsService, 'dispatch').and.returnValue();

		// when
		createElement();
		scope.items = preparations;
		scope.folders = folders;
		scope.$digest();
	}));

	afterEach(inject((SettingsService) => {
		SettingsService.clearSettings();
		scope.$destroy();
		element.remove();
	}));

	describe('render', () => {
		it('should render toolbar', () => {
			// then
			expect(element.find('div[role="toolbar"]').length).toBe(1);
		});

		it('should render folders', () => {
			// then
			const rows = element.find('.tc-list-display-table').eq(0).find('tbody tr');
			expect(rows.length).toBe(4);
			expect(rows.eq(0).find('td').eq(0).text()).toBe('JSO folder 1');
			expect(rows.eq(1).find('td').eq(0).text()).toBe('JSO folder 2');
		});

		it('should render preparations', () => {
			// then
			const rows = element.find('.tc-list-display-table').eq(0).find('tbody tr');
			expect(rows.length).toBe(4);
			expect(rows.eq(2).find('td').eq(0).text()).toBe('JSO prep 1');
			expect(rows.eq(3).find('td').eq(0).text()).toBe('JSO prep 2');
		});
	});

	describe('folder actions', () => {
		it('should dispatch folder creation',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-preparation\\:create\\:folder').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('preparation:create:folder');
				expect(lastCallArgs.type).toBe('@@preparation/CREATE');
			})
		);

		it('should dispatch folder redirection on title click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-0-title').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('menu:folders');
				expect(lastCallArgs.type).toBe('@@router/GO_FOLDER');
				expect(lastCallArgs.payload.id).toBe(folders[0].id);
			})
		);

		it('should dispatch folder edit on action click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-0-inventory\\:edit').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('inventory:edit');
				expect(lastCallArgs.type).toBe('@@inventory/EDIT');
				expect(lastCallArgs.payload.model).toBe(folders[0].model);
			})
		);

		it('should dispatch folder remove on action click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-0-preparation\\:remove\\:folder').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('preparation:remove:folder');
				expect(lastCallArgs.type).toBe('@@preparation/REMOVE_FOLDER');
				expect(lastCallArgs.payload.model).toBe(folders[0].model);
			})
		);
	});

	describe('preparation actions', () => {

		it('should dispatch preparation creation',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-preparation\\:create').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('preparation:create');
				expect(lastCallArgs.type).toBe('@@preparation/CREATE');
			})
		);

		it('should dispatch preparation edit on action click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-2-inventory\\:edit').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('inventory:edit');
				expect(lastCallArgs.type).toBe('@@inventory/EDIT');
				expect(lastCallArgs.payload.model).toBe(preparations[0].model);
			})
		);

		it('should dispatch preparation copy/move on action click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-2-preparation\\:copy-move').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('preparation:copy-move');
				expect(lastCallArgs.type).toBe('@@preparation/COPY_MOVE');
				expect(lastCallArgs.payload.model).toBe(preparations[0].model);
			})
		);

		it('should dispatch preparation remove on action click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-2-preparation\\:remove').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('preparation:remove');
				expect(lastCallArgs.type).toBe('@@preparation/REMOVE');
				expect(lastCallArgs.payload.model).toBe(preparations[0].model);
			})
		);

		it('should dispatch preparation playground on title click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-2-title').click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('menu:playground:preparation');
				expect(lastCallArgs.type).toBe('@@router/GO_PREPARATION');
				expect(lastCallArgs.payload.id).toBe(preparations[0].id);
			})
		);

		it('should dispatch preparation sort on action click',
			inject((SettingsActionsService) => {
				// given
				expect(SettingsActionsService.dispatch.calls.count()).toBe(1);

				// when
				element.find('#list-sort-order')[0].click();

				// then
				expect(SettingsActionsService.dispatch.calls.count()).toBe(2);
				const lastCallArgs = SettingsActionsService.dispatch.calls.argsFor(1)[0];
				expect(lastCallArgs.id).toBe('preparation:sort');
				expect(lastCallArgs.type).toBe('@@preparation/SORT');
				expect(lastCallArgs.payload.sortBy).toBe('name');
				expect(lastCallArgs.payload.sortDesc).toBe(false);
			})
		);
	});
});
