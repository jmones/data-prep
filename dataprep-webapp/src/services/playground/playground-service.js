(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name data-prep.services.playground.service:PlaygroundService
     * @description Playground service. This service provides the entry point to load properly the playground
     * @requires data-prep.services.dataset.service:DatasetService
     * @requires data-prep.services.playground.service:DatagridService
     * @requires data-prep.services.filter.service:FilterService
     * @requires data-prep.services.recipe.service:RecipeService
     * @requires data-prep.services.transformation.service:TransformationCacheService
     * @requires data-prep.services.transformation.service:ColumnSuggestionService
     * @requires data-prep.services.preparation.service:PreparationService
     * @requires data-prep.services.utils.service:MessageService
     * @requires data-prep.services.statistics:StatisticsService
     * @requires data-prep.services.history:HistoryService
     */
    function PlaygroundService($rootScope, $q, DatasetService, DatagridService, FilterService, RecipeService,
                               TransformationCacheService, ColumnSuggestionService, PreparationService, MessageService,
                               StatisticsService, HistoryService) {
        var service = {
            /**
             * @ngdoc property
             * @name visible
             * @propertyOf data-prep.services.playground.service:PlaygroundService
             * @description the visibility control
             */
            visible: false,
            /**
             * @ngdoc property
             * @name currentMetadata
             * @propertyOf data-prep.services.playground.service:PlaygroundService
             * @description the loaded metadata
             */
            currentMetadata: null,
            /**
             * @ngdoc property
             * @name originalPreparationName
             * @propertyOf data-prep.services.playground.service:PlaygroundService
             * @description the original preparation name - used to check if the name has changed
             */
            originalPreparationName: '',
            /**
             * @ngdoc property
             * @name preparationName
             * @propertyOf data-prep.services.playground.service:PlaygroundService
             * @description the current preparation
             */
            preparationName: '',
            /**
             * @ngdoc property
             * @name showRecipe
             * @propertyOf data-prep.services.playground.service:PlaygroundService
             * @description Flag that pilot the recipe panel display
             */
            showRecipe: false,
            /**
             * @ngdoc property
             * @name preparationNameEditionMode
             * @propertyOf data-prep.services.playground.service:PlaygroundService
             * @description Flag that the name edition mode.
             * The edition mode is active when user open an existing preparation, and inactive for a new preparation
             */
            preparationNameEditionMode: true,

            /**
             * @ngdoc property
             * @name selectedSampleSize
             * @methodOf data-prep.services.playground.service:PlaygroundService
             * @description the selected sample size.
             */
            selectedSampleSize:{},

            //init/load
            show: show,
            hide: hide,
            initPlayground: initPlayground,
            load: load,
            loadStep: loadStep,
            changeSampleSize: changeSampleSize,

            //preparation
            createOrUpdatePreparation: createOrUpdatePreparation,
            appendStep: appendStep,
            updateStep: updateStep,
            editCell: editCell
        };
        return service;

        //------------------------------------------------------------------------------------------------------
        //------------------------------------------------VISIBILITY--------------------------------------------
        //------------------------------------------------------------------------------------------------------
        /**
         * @ngdoc method
         * @name show
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @description Display the playground
         */
        function show() {
            service.visible = true;
        }

        /**
         * @ngdoc method
         * @name hide
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @description Hide the playground
         */
        function hide() {
            service.visible = false;
        }

        //------------------------------------------------------------------------------------------------------
        //-------------------------------------------------INIT/LOAD--------------------------------------------
        //------------------------------------------------------------------------------------------------------
        function reset(dataset, data) {
            service.currentMetadata = dataset;

            FilterService.removeAllFilters();
            RecipeService.refresh();
            StatisticsService.resetCharts();
            DatagridService.setDataset(dataset, data);
            TransformationCacheService.invalidateCache();
            ColumnSuggestionService.reset();
            HistoryService.clear();
        }

        function setName(name) {
            service.preparationName = name;
            service.originalPreparationName = name;
        }

        /**
         * @ngdoc method
         * @name initPlayground
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {object} dataset The dataset to load
         * @description Initiate a new preparation from dataset.
         - If there is no preparation yet and the dataset to load is still the last loaded, the playground is not changed.
         - Otherwise, the playground is reset with the wanted dataset
         * @returns {Promise} The process promise
         */
        function initPlayground(dataset) {
            if(!service.currentMetadata || PreparationService.currentPreparationId || dataset.id !== service.currentMetadata.id) {
                PreparationService.currentPreparationId = null;

                return DatasetService.getContent(dataset.id, false, service.selectedSampleSize.value)
                    .then(function(data) {
                        //TODO : temporary fix because asked to.
                        //TODO : when error status during import and get dataset content is managed by backend,
                        //TODO : remove this controle and the 'data-prep.services.utils'/MessageService dependency
                        if(!data || !data.records) {
                            MessageService.error('INVALID_DATASET_TITLE', 'INVALID_DATASET');
                            throw Error('Empty data');
                        }

                        setName('');
                        reset(dataset, data);
                        service.showRecipe = false;
                        service.preparationNameEditionMode = true;
                    });
            }
            else {
                return $q.when(true);
            }
        }

        /**
         * @ngdoc method
         * @name changeSampleSize
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @description change the sample size
         * @returns {Promise} The process promise
         */
         function changeSampleSize() {
            // deal with preparation or dataset
            if (PreparationService.currentPreparationId) {
                return changePreparationSampleSize();
            }
            else {
                return changeDataSetSampleSize();
            }
        }

        /**
         * @ngdoc method
         * @name changeDataSetSampleSize
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {int} the wanted sample size
         * @description change the sample size for the dataset.
         * @returns {Promise} The process promise
         */
        function changePreparationSampleSize() {

            // get the current step
            var index = RecipeService.getActiveThresholdStepIndex();
            var step = RecipeService.getStep(index);

            $rootScope.$emit('talend.loading.start');

            return PreparationService.getContent(step.transformation.stepId, service.selectedSampleSize.value)
                .then(function(response) {
                    DatagridService.setDataset(service.currentMetadata, response.data);
                })
                .finally(function() {
                    $rootScope.$emit('talend.loading.stop');
                });
        }

        /**
         * @ngdoc method
         * @name changePreparationSampleSize
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {int} the wanted sample size
         * @description change the sample size for the preparation.
         * @returns {Promise} The process promise
         */
        function changeDataSetSampleSize() {
            $rootScope.$emit('talend.loading.start');
            return DatasetService.getContent(service.currentMetadata.id, true, service.selectedSampleSize.value)
                .then(function (data) {
                    //TODO : temporary fix because asked to.
                    //TODO : when error status during import and get dataset content is managed by backend,
                    //TODO : remove this controle and the 'data-prep.services.utils'/MessageService dependency
                    if (!data || !data.records) {
                        MessageService.error('INVALID_DATASET_TITLE', 'INVALID_DATASET');
                        throw Error('Empty data');
                    }
                    DatagridService.setDataset(service.currentMetadata, data);
                })
                .finally(function() {
                    $rootScope.$emit('talend.loading.stop');
                });
        }

        /**
         * @ngdoc method
         * @name load
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {object} preparation - the preparation to load
         * @description Load an existing preparation in the playground :
         <ul>
            <li>set name</li>
            <li>set current preparation before any preparation request</li>
            <li>load grid with 'head' version content</li>
            <li>reinit recipe panel with preparation steps</li>
         </ul>
         * @returns {Promise} - the process promise
         */
        function load(preparation) {
            if(PreparationService.currentPreparationId !== preparation.id) {
                // Update current preparation id before preparation operations
                PreparationService.currentPreparationId = preparation.id;

                $rootScope.$emit('talend.loading.start');
                return PreparationService.getContent('head', service.selectedSampleSize.value)
                    .then(function(response) {
                        setName(preparation.name);
                        reset(preparation.dataset ? preparation.dataset : {id: preparation.dataSetId}, response.data);
                        service.showRecipe = true;
                        service.preparationNameEditionMode = false;
                    })
                    .finally(function() {
                        $rootScope.$emit('talend.loading.stop');
                    });
            }
            else {
                return $q.when(true);
            }
        }

        /**
         * @ngdoc method
         * @name loadStep
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {object} step The preparation step to load
         * @param {string} focusColumnId The column id to focus on
         * @description Load a specific step content in the current preparation, and update the recipe
         * @returns {Promise} The process promise
         */
        function loadStep(step, focusColumnId) {
            //step already loaded
            if(RecipeService.getActiveThresholdStep() === step) {
                return;
            }

            $rootScope.$emit('talend.loading.start');
            return PreparationService.getContent(step.transformation.stepId, service.selectedSampleSize.value)
                .then(function(response) {
                    DatagridService.focusedColumn = focusColumnId;
                    DatagridService.setDataset(service.currentMetadata, response.data);
                    RecipeService.disableStepsAfter(step);
                })
                .finally(function() {
                    $rootScope.$emit('talend.loading.stop');
                });
        }

        //------------------------------------------------------------------------------------------------------
        //------------------------------------------------PREPARATION-------------------------------------------
        //------------------------------------------------------------------------------------------------------
        /**
         * @ngdoc method
         * @name createOrUpdatePreparation
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {string} name The preparation name to create or update
         * @description Create a new preparation or change its name if it already exists
         * @returns {Promise} The process promise
         */
        function createOrUpdatePreparation(name) {
            if(service.originalPreparationName !== name) {
                return PreparationService.setName(service.currentMetadata, name)
                    .then(function() {
                        service.originalPreparationName = name;
                        service.preparationName = name;
                    });
            }
            else {
                return $q.reject();
            }
        }

        /**
         * @ngdoc method
         * @name appendStep
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {string} action The action name
         * @param {object} params The transformation params
         * @description Call an execution of a transformation on the column in the current preparation and add an entry
         * in actions history
         */
        function appendStep(action, params) {
            var append = executeAppendStep.bind(service, service.currentMetadata, action, params);

            return append().then(function() {
                var lastStepId = RecipeService.getLastStep().transformation.stepId;
                /*jshint camelcase: false */
                var cancelAppend = executeRemoveStep.bind(service, lastStepId, params.column_id);
                HistoryService.addAction(cancelAppend, append);
            });
        }

        /**
         * @ngdoc method
         * @name executeAppendStep
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {object} metadata The dataset metadata
         * @param {string} action The action name
         * @param {object} params The transformation params
         * @description Perform a transformation on the column in the current preparation, refresh the recipe and the
         * data. If there is no preparation yet, PreparationService create it.
         */
        function executeAppendStep(metadata, action, params) {
            $rootScope.$emit('talend.loading.start');
            return PreparationService.appendStep(metadata, action, params)
                .then(function(){
                    /*jshint camelcase: false */
                    return $q.all([updateRecipe(), updateDatagrid(params.column_id)]);
                })
                .finally(function () {
                    $rootScope.$emit('talend.loading.stop');
                });
        }

        /**
         * @ngdoc method
         * @name updateStep
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {object} step The step to update
         * @param {object} newParams The new parameters
         * @description Call an execution of a transformation update on the provided step and add an entry in the
         * actions history
         */
        function updateStep(step, newParams) {
            var oldParams = step.actionParameters.parameters;
            var stepIndex = RecipeService.getStepIndex(step);
            var update = executeUpdateStep.bind(service, step, newParams);

            return update().then(function() {
                var newStep = RecipeService.getStep(stepIndex);
                var cancelUpdate = executeUpdateStep.bind(service, newStep, oldParams);
                HistoryService.addAction(cancelUpdate, update);
            });
        }

        /**
         * @ngdoc method
         * @name executeUpdateStep
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {object} step The step to update
         * @param {object} newParams The new parameters
         * @description Perform a transformation update on the provided step.
         */
        function executeUpdateStep(step, newParams) {
            $rootScope.$emit('talend.loading.start');
            var lastActiveStepIndex = RecipeService.getActiveThresholdStepIndex();
            return PreparationService.updateStep(step, newParams)
                .then(updateRecipe)
                .then(function() {
                    var activeStep = RecipeService.getStep(lastActiveStepIndex, true);
                    return loadStep(activeStep, step.column.id);
                })
                .finally(function () {
                    $rootScope.$emit('talend.loading.stop');
                });
        }

        /**
         * @ngdoc method
         * @name executeRemoveStep
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {string} stepId The step id to remove
         * @param {string} focusColumnId The column id to focus on
         * @description Perform a transformation removal identified by the step id
         */
        function executeRemoveStep(stepId, focusColumnId) {
            return PreparationService.removeStep(stepId)
                .then(function() {
                    return $q.all([updateRecipe(), updateDatagrid(focusColumnId)]);
                });
        }

        /**
         * @ngdoc method
         * @name editCell
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {Object} rowItem The row
         * @param {object} column The column where to execute the transformation
         * @param {string} newValue The new value to put on th target
         * @param {boolean} updateAllCellWithValue Indicates the scope (cell or column) of the transformaton
         * @description Perform a cell or a column edition
         */
        function editCell(rowItem, column, newValue, updateAllCellWithValue) {
            /*jshint camelcase: false */
            var params = {
                scope : updateAllCellWithValue ? 'column' : 'cell',
                column_id: column.id,
                column_name: column.name,
                row_id: rowItem.tdpId,
                cell_value: rowItem[column.id],
                replace_value: newValue
            };
            var action = 'replace_on_value';

            return appendStep(action, params);
        }
        //------------------------------------------------------------------------------------------------------
        //---------------------------------------------------UTILS----------------------------------------------
        //------------------------------------------------------------------------------------------------------
        /**
         * @ngdoc method
         * @name updateDatagrid
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @param {string} focusColumnId The column id to focus on
         * @description Perform an datagrid refresh with the preparation head
         */
        function updateDatagrid(focusColumnId) {
            return PreparationService.getContent('head', service.selectedSampleSize.value)
                .then(function(response) {
                    DatagridService.focusedColumn = focusColumnId;
                    DatagridService.updateData(response.data);
                });
        }

        /**
         * @ngdoc method
         * @name updateRecipe
         * @methodOf data-prep.services.playground.service:PlaygroundService
         * @description Update the recipe
         */
        function updateRecipe() {
            return RecipeService.refresh()
                .then(function() {
                    if(RecipeService.getRecipe().length === 1) { //first step append
                        service.showRecipe = true;
                    }
                });
        }
    }

    angular.module('data-prep.services.playground')
        .service('PlaygroundService', PlaygroundService);
})();