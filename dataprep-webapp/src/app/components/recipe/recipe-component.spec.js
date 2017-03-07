/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

describe('Recipe component', () => {
	let scope;
	let element;
	let stateMock;
	let ctrl;

	const steps = [
		{
			column: { id: '0', name: 'col1' },
			transformation: {
				stepId: '13a24e8765ef4',
				name: 'split',
				label: 'Split',
				category: 'split',
				parameters: [{ name: 'pattern', type: 'string' }],
				items: [],
			},
			actionParameters: {
				action: 'split',
				parameters: {
					scope: 'column',
					column_id: '0',
					pattern: '/',
				},
			},
		},
		{
			column: { id: '1', name: 'col2' },
			transformation: {
				stepId: '9876fb498e36543ab51',
				name: 'uppercase',
				label: 'To uppercase',
				category: 'case',
				parameters: [],
			},
			actionParameters: {
				action: 'uppercase',
				parameters: {
					scope: 'column',
					column_id: '1',
				},
			},
			inactive: true,
		},
		{
			column: { id: '1', name: 'col2' },
			transformation: {
				stepId: '456bb784a9674e532fc446',
				name: 'replace_on_value',
				label: 'Replace value',
				category: 'quickfix',
				parameters: [
					{ name: 'cell_value', type: 'string' },
					{ name: 'replace_value', type: 'string' },
				],
			},
			actionParameters: {
				action: 'quickfix',
				parameters: {
					scope: 'cell',
					column_id: '1',
					row_id: 56,
				},
			},
			inactive: true,
		},
		{
			column: { id: '2', name: 'col3' },
			transformation: {
				stepId: '8876fb498e3625ab53',
				name: 'textclustering',
				label: 'Cluster',
				category: 'quickfix',
				parameters: null,
				cluster: {
					titles: ['', ''],
					clusters: [
						{
							parameters: [
								{
									name: 'Texa',
									type: 'boolean',
									description: 'parameter.Texa.desc',
									label: 'parameter.Texa.label',
									default: null,
								},
								{
									name: 'Tixass',
									type: 'boolean',
									description: 'parameter.Tixass.desc',
									label: 'parameter.Tixass.label',
									default: null,
								},
								{
									name: 'Tex@s',
									type: 'boolean',
									description: 'parameter.Tex@s.desc',
									label: 'parameter.Tex@s.label',
									default: null,
								},
							],
							replace: {
								name: 'replaceValue',
								type: 'string',
								description: 'parameter.replaceValue.desc',
								label: 'parameter.replaceValue.label',
								default: 'Texas',
							},
						},
					],
				},
			},
			actionParameters: {
				action: 'textclustering',
				parameters: {
					scope: 'column',
					column_id: '2',
					Texa: 'Texas',
					Tixass: 'Texas',
				},
			},
			inactive: true,
		},
		{
			column: { id: undefined, name: undefined },
			row: { id: 125 },
			transformation: {
				stepId: '3213ca58454a58d436',
				name: 'delete',
				label: 'Delete Line',
				category: 'clean',
				parameters: null,
			},
			actionParameters: {
				action: 'delete',
				parameters: {
					scope: 'line',
					column_id: undefined,
					row_id: 125,
				},
			},
			inactive: true,
		},
		{
			column: { id: '0', name: 'col1' },
			transformation: {
				stepId: 'preview step',
				name: 'split',
				label: 'Split',
				category: 'split',
				parameters: [{ name: 'pattern', type: 'string' }],
				items: [],
			},
			actionParameters: {
				action: 'split',
				parameters: {
					scope: 'column',
					column_id: '0',
					pattern: '/',
				},
			},
			preview: true,
		},
		{
			column: {
				id: '0000',
				name: 'id',
			},
			transformation: {
				parameters: [],
				label: 'Lookup',
				name: 'lookup',
			},
			actionParameters: {
				action: 'lookup',
				parameters: {
					column_id: '0000',
					filter: '',
					lookup_ds_name: 'customers_100_with_pb',
					lookup_ds_id: '14d116a0-b180-4c5f-ba25-46807fc61e42',
					lookup_ds_url: 'http://172.17.0.30:8080/datasets/14d116a0-b180-4c5f-ba25-46807fc61e42/content?metadata=true',
					lookup_join_on: '0000',
					lookup_join_on_name: 'id',
					lookup_selected_cols: [
						{
							name: 'firstname',
							id: '0001',
						},
					],
					column_name: 'id',
					scope: 'dataset',
				},
			},
		},
	];
	const stepsWithDiff = [
		{
			column: {
				id: '0002',
				name: 'country',
			},
			transformation: {
				stepId: 'c5da029b2aa0e673788363bb5359c65d1cb6094a',
				name: 'uppercase',
				label: 'Change case to UPPER',
				description: 'Converts all of the cell values in this column to upper case',
				parameters: [],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'uppercase',
				parameters: {
					scope: 'column',
					column_id: '0002',
					column_name: 'country',
				},
			},
			diff: {
				createdColumns: [],
			},
		},
		{
			column: {
				id: '0003',
				name: 'page_visited',
			},
			transformation: {
				stepId: 'd89b246cd8c7fb312f79096b4f04754a636f54fd',
				name: 'copy',
				label: 'Duplicate',
				description: 'Creates an exact copy of this column',
				parameters: [],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'copy',
				parameters: {
					scope: 'column',
					column_id: '0003',
					column_name: 'page_visited',
				},
			},
			diff: {
				createdColumns: [
					'0008',
				],
			},
		},
		{
			column: {
				id: '0008',
				name: 'page_visited_copy',
			},
			transformation: {
				stepId: '6c0ed3116fefc2ca5e596a20a7b86a2cfe34d86d',
				name: 'rename_column',
				label: 'Rename',
				description: 'Rename this column',
				parameters: [
					{
						name: 'new_column_name',
						type: 'string',
						implicit: false,
						canBeBlank: false,
						description: 'The new column name',
						label: 'New name',
						default: '',
						value: 'Visited',
						initialValue: 'Visited',
						inputType: 'text',
					},
				],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'rename_column',
				parameters: {
					new_column_name: 'Visited',
					scope: 'column',
					column_id: '0008',
					column_name: 'page_visited_copy',
				},
			},
			diff: {
				createdColumns: [],
			},
		},
		{
			column: {
				id: '0001',
				name: 'birth',
			},
			transformation: {
				stepId: '260a4b7a3d1f2c03509d865a7961a481e594142e',
				name: 'copy',
				label: 'Duplicate',
				description: 'Creates an exact copy of this column',
				parameters: [],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'copy',
				parameters: {
					scope: 'column',
					column_id: '0001',
					column_name: 'birth',
				},
			},
			diff: {
				createdColumns: [
					'0009',
				],
			},
		},
		{
			column: {
				id: '0009',
				name: 'birth_copy',
			},
			transformation: {
				stepId: '8113ae52f8f34d0cbb595c30d07ba4db80a1aec7',
				name: 'rename_column',
				label: 'Rename',
				description: 'Rename this column',
				parameters: [
					{
						name: 'new_column_name',
						type: 'string',
						implicit: false,
						canBeBlank: false,
						description: 'The new column name',
						label: 'New name',
						default: '',
						value: 'Second birth',
						initialValue: 'Second birth',
						inputType: 'text',
					},
				],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'rename_column',
				parameters: {
					new_column_name: 'Second birth',
					scope: 'column',
					column_id: '0009',
					column_name: 'birth_copy',
				},
			},
			diff: {
				createdColumns: [],
			},
		},
		{
			column: {
				id: '0009',
				name: 'Second birth',
			},
			transformation: {
				stepId: '2f749665763cffe0382ab581ac1a7c4bffb5afbc',
				name: 'compute_time_since',
				label: 'Compute time since',
				description: 'Computes time elapsed since this date in the desired unit',
				parameters: [],
				items: [
					{
						name: 'time_unit',
						category: 'categ',
						values: [
							{
								name: 'YEARS',
								parameters: [],
								default: true,
								$$hashKey: 'object:370',
							},
							{
								name: 'MONTHS',
								parameters: [],
								default: false,
								$$hashKey: 'object:371',
							},
							{
								name: 'DAYS',
								parameters: [],
								default: false,
								$$hashKey: 'object:372',
							},
							{
								name: 'HOURS',
								parameters: [],
								default: false,
								$$hashKey: 'object:373',
							},
						],
						description: 'The unit in which you want the result',
						label: 'Time unit',
						initialValue: {
							name: 'YEARS',
							parameters: [],
							default: true,
							$$hashKey: 'object:370',
						},
						selectedValue: {
							name: 'YEARS',
							parameters: [],
							default: true,
							$$hashKey: 'object:370',
						},
					},
				],
				dynamic: false,
			},
			actionParameters: {
				action: 'compute_time_since',
				parameters: {
					time_unit: 'YEARS',
					scope: 'column',
					column_id: '0009',
					column_name: 'Second birth',
				},
			},
			diff: {
				createdColumns: [
					'0010',
				],
			},
		},
		{
			column: {
				id: '0010',
				name: 'since_Second birth_in_years',
			},
			transformation: {
				stepId: 'c365392966bf1ff78f9e377b6d2b7a87c4d385f0',
				name: 'rename_column',
				label: 'Rename',
				description: 'Rename this column',
				parameters: [
					{
						name: 'new_column_name',
						type: 'string',
						implicit: false,
						canBeBlank: false,
						description: 'The new column name',
						label: 'New name',
						default: '',
						value: 'Age',
						initialValue: 'Age',
						inputType: 'text',
					},
				],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'rename_column',
				parameters: {
					new_column_name: 'Age',
					scope: 'column',
					column_id: '0010',
					column_name: 'since_Second birth_in_years',
				},
			},
			diff: {
				createdColumns: [],
			},
		},
		{
			column: {
				id: '0002',
				name: 'country',
			},
			transformation: {
				stepId: '0a2287dc320286ca93b19ceee74af1175f7249e5',
				name: 'substring',
				label: 'Substring',
				description: 'Extracts substring in a new column',
				parameters: [],
				items: [
					{
						name: 'from_mode',
						category: 'categ',
						values: [
							{
								name: 'From beginning',
								parameters: [],
								default: true,
								$$hashKey: 'object:427',
							},
							{
								name: 'From index',
								parameters: [
									{
										name: 'from_index',
										type: 'integer',
										implicit: false,
										canBeBlank: true,
										description: 'Index of the original value that starts the new one',
										label: 'Begining index',
										default: '0',
										inputType: 'number',
									},
								],
								default: false,
								$$hashKey: 'object:428',
							},
						],
						description: 'Select begining mode of the substring',
						label: 'From',
						initialValue: {
							name: 'From beginning',
							parameters: [],
							default: true,
							$$hashKey: 'object:427',
						},
						selectedValue: {
							name: 'From beginning',
							parameters: [],
							default: true,
							$$hashKey: 'object:427',
						},
					},
					{
						name: 'to_mode',
						category: 'categ',
						values: [
							{
								name: 'To end',
								parameters: [],
								default: false,
								$$hashKey: 'object:431',
							},
							{
								name: 'To index',
								parameters: [
									{
										name: 'to_index',
										type: 'integer',
										implicit: false,
										canBeBlank: true,
										description: 'Index of the original value that ends the new one',
										label: 'End index',
										default: '5',
										value: 5,
										initialValue: 5,
										inputType: 'number',
									},
								],
								default: true,
								$$hashKey: 'object:432',
							},
						],
						description: 'Select end mode of the substring',
						label: 'To',
						initialValue: {
							name: 'To index',
							parameters: [
								{
									name: 'to_index',
									type: 'integer',
									implicit: false,
									canBeBlank: true,
									description: 'Index of the original value that ends the new one',
									label: 'End index',
									default: '5',
									value: 5,
									initialValue: 5,
									inputType: 'number',
								},
							],
							default: true,
							$$hashKey: 'object:432',
						},
						selectedValue: {
							name: 'To index',
							parameters: [
								{
									name: 'to_index',
									type: 'integer',
									implicit: false,
									canBeBlank: true,
									description: 'Index of the original value that ends the new one',
									label: 'End index',
									default: '5',
									value: 5,
									initialValue: 5,
									inputType: 'number',
								},
							],
							default: true,
							$$hashKey: 'object:432',
						},
					},
				],
				dynamic: false,
			},
			actionParameters: {
				action: 'substring',
				parameters: {
					from_mode: 'From beginning',
					to_mode: 'To index',
					to_index: '5',
					scope: 'column',
					column_id: '0002',
					column_name: 'country',
				},
			},
			diff: {
				createdColumns: [
					'0011',
				],
			},
		},
		{
			column: {
				id: '0011',
				name: 'country_substring',
			},
			transformation: {
				stepId: 'd1467ec46e99c508380d0a049314bad87e5622a0',
				name: 'rename_column',
				label: 'Rename',
				description: 'Rename this column',
				parameters: [
					{
						name: 'new_column_name',
						type: 'string',
						implicit: false,
						canBeBlank: false,
						description: 'The new column name',
						label: 'New name',
						default: '',
						value: 'SUB',
						initialValue: 'SUB',
						inputType: 'text',
					},
				],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'rename_column',
				parameters: {
					new_column_name: 'SUB',
					scope: 'column',
					column_id: '0011',
					column_name: 'country_substring',
				},
			},
			diff: {
				createdColumns: [],
			},
		},
		{
			column: {
				id: '0011',
				name: 'SUB',
			},
			transformation: {
				stepId: 'ba5456dd852e3aa71993068078a4a98acb4a9229',
				name: 'lowercase',
				label: 'Change case to lower',
				description: 'Converts all of the cell values in this column to lower case',
				parameters: [],
				items: [],
				dynamic: false,
			},
			actionParameters: {
				action: 'lowercase',
				parameters: {
					scope: 'column',
					column_id: '0011',
					column_name: 'SUB',
				},
			},
			diff: {
				createdColumns: [],
			},
		},
	];

	beforeEach(angular.mock.module('data-prep.recipe', ($provide) => {
		stateMock = {
			playground: {
				recipe: { current: { steps: [] } },
			},
		};
		$provide.constant('state', stateMock);
	}));

	beforeEach(angular.mock.module('pascalprecht.translate', ($translateProvider) => {
		$translateProvider.translations('en', {
			RECIPE_ITEM_ON_COL: '<span class="step-number">{{index}}</span> <span class="step-label">{{label}}</span> on column <div class="step-scope" title="{{columnName}}">{{columnName}}</div>',
			RECIPE_ITEM_ON_CELL: '<span class="step-number">{{index}}</span> <span class="step-label">{{label}}</span> on cell',
			RECIPE_ITEM_ON_LINE: '<span class="step-number">{{index}}</span> <span class="step-label">{{label}}</span> <span class="step-scope">#{{rowId}}</span>',
			LOOKUP_STEP_DESCRIPTION: '<span class="step-number">{{index}}</span> <span class="step-label">{{label}}</span> done with dataset <div class="step-scope" title="{{lookupDsName}}">{{lookupDsName}}</div>. Join has been set between <div class="step-scope" title="{{mainColName}}">{{mainColName}}</div> and <div class="step-scope" title="{{lookupColName}}">{{lookupColName}}</div>. ',
			ONLY_1_ADDED_COL: 'The column <div class="step-scope" title="{{firstCol}}">{{firstCol}}</div> has been added.',
			ONLY_2_ADDED_COLS: 'The columns <div class="step-scope" title="{{firstCol}}">{{firstCol}}</div> and <div class="step-scope" title="{{secondCol}}">{{secondCol}}</div> have been added.',
			MORE_THEN_2_ADDED_COLS: 'The columns <div class="step-scope" title="{{firstCol}}">{{firstCol}}</div>, <div class="step-scope" title="{{secondCol}}">{{secondCol}}</div> and <span title="{{restOfCols}}">{{restOfColsNbr}}</span> other(s) have been added.',
			OTHER: 'other',
		});
		$translateProvider.preferredLanguage('en');
	}));

	beforeEach(inject(($rootScope, $compile) => {

		scope = $rootScope.$new();
		element = angular.element('<recipe></recipe>');
		$compile(element)(scope);
		scope.$digest();
		ctrl = element.controller('recipe');
	}));

	afterEach(() => {
		scope.$destroy();
		element.remove();
	});

	it('should render recipe entries', () => {
		// when
		stateMock.playground.recipe.current.steps = [
			steps[0],
			steps[1],
			steps[2],
			steps[4],
		];
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();

		// then
		expect(element.find('.recipe ul sc-accordion-item').length).toBe(4);
		expect(element.find('.recipe ul sc-accordion-item trigger step-description').eq(0).text().trim().replace(/\s+/g, ' ')).toBe('1 Split on column COL1');
		expect(element.find('.recipe ul sc-accordion-item trigger step-description').eq(1).text().trim().replace(/\s+/g, ' ')).toBe('2 To uppercase on column COL2');
		expect(element.find('.recipe ul sc-accordion-item trigger step-description').eq(2).text().trim().replace(/\s+/g, ' ')).toBe('3 Replace value on cell');
		expect(element.find('.recipe ul sc-accordion-item trigger step-description').eq(3).text().trim().replace(/\s+/g, ' ')).toBe('4 Delete Line #125');
	});

	it('should render recipe Lookup entry', () => {
		// when
		stateMock.playground.recipe.current.steps = [steps[steps.length - 1]];
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();

		// then
		expect(element.find('.recipe ul sc-accordion-item ').length).toBe(1);
		expect(element.find('.recipe ul sc-accordion-item trigger step-description').eq(0).text().trim().replace(/\s+/g, ' ')).toBe('1 Lookup done with dataset customers_100_with_pb. Join has been set between id and id. The column firstname has been added.');
	});

	it('should render early preview step', () => {
		// when
		stateMock.playground.recipe.current.steps = [
			steps[0],
			steps[1],
			steps[5], // preview step
		];
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();

		// then
		expect(element.find('.recipe .step-container').length).toBe(3);
		expect(element.find('.recipe .step-container').eq(0).hasClass('preview')).toBe(false);
		expect(element.find('.recipe .step-container').eq(1).hasClass('preview')).toBe(false);
		expect(element.find('.recipe .step-container').eq(2).hasClass('preview')).toBe(true);
	});

	it('should render recipe params', () => {
		// when
		stateMock.playground.recipe.current.steps = [steps[0]];
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();

		// then
		expect(element.find('.recipe ul sc-accordion-item content').length).toBe(1);
		expect(element.find('.recipe ul sc-accordion-item content').eq(0).find('.transformation-form').length).toBe(1);
	});

	it('should render recipe cluster Modal', () => {
		// given
		const body = angular.element('body');

		// when
		stateMock.playground.recipe.current.steps = [steps[3]];
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		ctrl.showModal[steps[3].transformation.stepId] = true;
		scope.$digest();

		// then
		expect(body.find('.modal-inner').length).toBe(1);
		expect(body.find('.modal-inner').find('.cluster').length).toBe(1);
	});

	it('should render knots', () => {
		// when
		stateMock.playground.recipe.current.steps = [
			steps[0],
			steps[1],
			steps[2],
			steps[4],
		];
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();

		// then
		expect(element.find('.recipe ul recipe-knot').length).toBe(4);
	});

	it('should render inactive style', () => {
		// when
		stateMock.playground.recipe.current.steps = steps;
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();

		// then
		expect(element.find('.recipe ul .disabled-step').length).toBe(4);
		expect(element.find('.recipe .step-container').eq(1).hasClass('disabled-step')).toBe(true);
		expect(element.find('.recipe .step-container').eq(2).hasClass('disabled-step')).toBe(true);
		expect(element.find('.recipe .step-container').eq(3).hasClass('disabled-step')).toBe(true);
		expect(element.find('.recipe .step-container').eq(4).hasClass('disabled-step')).toBe(true);
	});

	it('should highlight steps that will be deleted on remove icon mouse over', inject(($timeout) => {
		// given
		stateMock.playground.recipe.current.steps = stepsWithDiff;
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();
		$timeout.flush(1);

		// when
		element.find('#step-remove-260a4b7a3d1f2c03509d865a7961a481e594142e').mouseover();

		// then
		expect(element.find('>.recipe .step-container').eq(3).hasClass('remove')).toBe(true);
		expect(element.find('>.recipe .step-container').eq(4).hasClass('remove')).toBe(true);
		expect(element.find('>.recipe .step-container').eq(5).hasClass('remove')).toBe(true);
	}));

	it('should remove highlight class on remove icon mouse out', inject(($timeout) => {
		// given
		stateMock.playground.recipe.current.steps = stepsWithDiff;
		stateMock.playground.recipe.current.reorderedSteps = stateMock.playground.recipe.current.steps;
		scope.$digest();
		$timeout.flush(1);
		element.find('#step-remove-260a4b7a3d1f2c03509d865a7961a481e594142e').mouseover();

		// then
		expect(element.find('>.recipe .step-container').eq(3).hasClass('remove')).toBe(true);
		expect(element.find('>.recipe .step-container').eq(4).hasClass('remove')).toBe(true);
		expect(element.find('>.recipe .step-container').eq(5).hasClass('remove')).toBe(true);

		// when
		element.find('#step-remove-260a4b7a3d1f2c03509d865a7961a481e594142e').mouseout();

		// then
		expect(element.find('>.recipe .step-container').eq(3).hasClass('remove')).toBe(false);
		expect(element.find('>.recipe .step-container').eq(4).hasClass('remove')).toBe(false);
		expect(element.find('>.recipe .step-container').eq(5).hasClass('remove')).toBe(false);
	}));
});
