describe('Export directive', function () {
    'use strict';

    var scope, element, ctrl;

    var exportTypes = [
        {
            'mimeType': 'text/csv',
            'extension': '.csv',
            'id': 'CSV',
            'needParameters': 'true',
            'defaultExport': 'false',
            'parameters': [{
                'name': 'csvSeparator',
                'labelKey': 'CHOOSE_SEPARATOR',
                'type': 'radio',
                'defaultValue': {'value': ';', 'labelKey': 'SEPARATOR_SEMI_COLON'},
                'values': [
                    {'value': '&#09;', 'labelKey': 'SEPARATOR_TAB'},
                    {'value': ' ', 'labelKey': 'SEPARATOR_SPACE'},
                    {'value': ',', 'labelKey': 'SEPARATOR_COMMA'}
                ]
            }]
        },
        {
            'mimeType': 'application/tde',
            'extension': '.tde',
            'id': 'TABLEAU',
            'needParameters': 'false',
            'defaultExport': 'false'
        },
        {
            'mimeType': 'application/vnd.ms-excel',
            'extension': '.xls',
            'id': 'XLS',
            'needParameters': 'false',
            'defaultExport': 'true'
        }
    ];
    var csvParameters = {exportType: 'CSV', 'exportParameters.csvSeparator': ';'};
    var csvType = exportTypes[0];

    var stateMock;

    beforeEach(module('data-prep.export', function($provide) {
        stateMock = {playground: {exportParameters : { exportType: 'CSV', 'exportParameters.csvSeparator': ';' , 'exportParameters.fileName': 'prepname' }}};
        $provide.constant('state', stateMock);
    }));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function ($rootScope, $compile, $q, ExportService) {
        spyOn(ExportService, 'refreshTypes').and.returnValue($q.when(exportTypes));
        spyOn(ExportService, 'getParameters').and.returnValue(csvParameters);
        spyOn(ExportService, 'getType').and.returnValue(csvType);

        scope = $rootScope.$new();
        element = angular.element('<export></export>');
        $compile(element)(scope);
        scope.$digest();

        ctrl = element.controller('export');
    }));

    afterEach(inject(function (state) {
        scope.$destroy();
        element.remove();

        state.playground.dataset = null;
    }));

    it('should bind preparationId form value to controller', function () {
        //given
        var input = element.find('#exportForm').eq(0)[0].preparationId;
        expect(input.value).toBeFalsy();

        //when
        stateMock.playground.preparation = {id: '48da64513c43a548e678bc99'};
        scope.$digest();

        //then
        expect(input.value).toBe('48da64513c43a548e678bc99');
    });

    it('should bind stepId form value to controller', inject(function (RecipeService) {
        //given
        var input = element.find('#exportForm').eq(0)[0].stepId;
        expect(input.value).toBeFalsy();

        //when
        RecipeService.getRecipe().push({
            transformation: {
                stepId: '48da64513c43a548e678bc99'
            }
        });
        scope.$digest();

        //then
        expect(input.value).toBe('48da64513c43a548e678bc99');
    }));

    it('should bind datasetId form value to controller', inject(function (state) {
        //given
        var input = element.find('#exportForm').eq(0)[0].datasetId;
        expect(input.value).toBeFalsy();

        //when
        state.playground.dataset = {
            id: '48da64513c43a548e678bc99'
        };
        scope.$digest();

        //then
        expect(input.value).toBe('48da64513c43a548e678bc99');
    }));

    it('should add current export type in form', function () {
        //given
        var input = element.find('#exportForm').eq(0)[0].exportType;

        //then
        expect(input.value).toBe('CSV');
    });

    it('should add current export type parameters in form', function () {
        //given
        var input = element.find('#exportForm').eq(0)[0]['exportParameters.csvSeparator'];

        //then
        expect(input.value).toBe(';');
    });

    it('should set form in controller', inject(function () {
        //then
        expect(ctrl.form).toBeDefined();
    }));
});