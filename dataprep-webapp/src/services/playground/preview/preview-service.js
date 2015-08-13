(function(){
    'use strict';

    /**
     * @ngdoc service
     * @name data-prep.services.playground.service:PreviewService
     * @description Preview service. This service holds the preview datagrid (SlickGrid) view
     * @requires data-prep.services.playground.service:DatagridService
     * @requires data-prep.services.preparation.service:PreparationService
     */
    function PreviewService($q, DatagridService, PreparationService) {
        /**
         * @ngdoc property
         * @name originalData
         * @propertyOf data-prep.services.playground.service:PreviewService
         * @description [PRIVATE] The original data (columns and records) before switching to preview
         */
        var originalData;

        /**
         * @ngdoc property
         * @name displayedTdpIds
         * @propertyOf data-prep.services.playground.service:PreviewService
         * @description [PRIVATE] The list of records TDP indexes that is displayed in the viewport
         */
        var displayedTdpIds;

        /**
         * @ngdoc property
         * @name startIndex
         * @propertyOf data-prep.services.playground.service:PreviewService
         * @description [PRIVATE] The first row index that is previewed. It is the index in the records array
         */
        var startIndex;

        /**
         * @ngdoc property
         * @name endIndex
         * @propertyOf data-prep.services.playground.service:PreviewService
         * @description [PRIVATE] The last row index that is previewed. It is the index in the records array
         */
        var endIndex;

        /**
         * @ngdoc property
         * @name previewCanceler
         * @propertyOf data-prep.services.playground.service:PreviewService
         * @description [PRIVATE] The preview cancel promise. When it is resolved, the pending request is rejected
         */
        var previewCanceler;
        /**
         * @ngdoc property
         * @name modifiedRecords
         * @propertyOf data-prep.services.playground.service:PreviewService
         * @description [PRIVATE] The preview records that is displayed
         */
        var modifiedRecords;

        var service = {
            /**
             * @ngdoc property
             * @name gridRangeIndex
             * @propertyOf data-prep.services.playground.service:PreviewService
             * @description The grid displayed rows id. It take filters into account.
             * This is updated by the {@link data-prep.datagrid.directive:Datagrid Datagrid} directive on scroll
             */
            gridRangeIndex: null,

            getPreviewDiffRecords: getPreviewDiffRecords,
            getPreviewUpdateRecords: getPreviewUpdateRecords,

            previewInProgress: previewInProgress,
            stopPendingPreview: stopPendingPreview,
            reset: reset,
            cancelPreview: cancelPreview
        };
        return service;

        /**
         * @ngdoc method
         * @name getDisplayedTdpIds
         * @methodOf data-prep.services.playground.service:PreviewService
         * @description [PRIVATE] Get the rows TDP ids in the range
         * @returns {object[]} The rows TDP ids in the range
         */
        function getDisplayedTdpIds() {
            var indexes = _.range(service.gridRangeIndex.top, service.gridRangeIndex.bottom + 1);
            return  _.chain(indexes)
                .map(DatagridService.dataView.getItem)
                .map('tdpId')
                .sortBy('tdpId')
                .value();
        }

        /**
         * @ngdoc method
         * @name replaceRecords
         * @methodOf data-prep.services.playground.service:PreviewService
         * @description
         * <ul>
         *     <li>Copy the row list</li>
         *     <li>Insert the viable preview rows into the new list</li>
         *     <li>Display the new records</li>
         * </ul>
         */
        function replaceRecords(response) {
            //copy the original data to avoid modification persistence
            modifiedRecords = originalData.records.slice(0);

            //insert diff records
            var previewRecords = response.data.records;
            var nbRecordsToRemove = endIndex - startIndex + 1;
            var spliceArgs = [startIndex, nbRecordsToRemove].concat(previewRecords);
            Array.prototype.splice.apply(modifiedRecords, spliceArgs);

            //update grid
            var data = {columns: response.data.columns, records: modifiedRecords, preview: true};
            DatagridService.updateData(data);
        }

        /**
         * @ngdoc method
         * @name initPreviewIdNeeded
         * @methodOf data-prep.services.playground.service:PreviewService
         * @description Init the TDP ids, the start/end ids if no preview is currently displayed and create a new preview canceler promise
         */
        function initPreviewIdNeeded() {
            if(!originalData) {
                originalData = DatagridService.data;
                displayedTdpIds = getDisplayedTdpIds();
                startIndex = DatagridService.dataView.getIdxById(displayedTdpIds[0]);
                endIndex = DatagridService.dataView.getIdxById(displayedTdpIds[displayedTdpIds.length - 1]);
            }

            previewCanceler = $q.defer();
        }

        /**
         * @ngdoc method
         * @name getPreviewDiffRecords
         * @methodOf data-prep.services.playground.service:PreviewService
         * @param {object} currentStep The current active step
         * @param {object} previewStep The step to preview
         * @param {string} targetColumnId The column id to focus on
         * @description Call the diff preview service and replace records in the grid.
         * It cancel the previous preview first
         */
        function getPreviewDiffRecords(currentStep, previewStep, targetColumnId) {
            cancelPreview(true, null);
            initPreviewIdNeeded();

            PreparationService.getPreviewDiff(currentStep, previewStep, displayedTdpIds, previewCanceler)
                .then(function(response) {
                    DatagridService.focusedColumn = targetColumnId;
                    return response;
                })
                .then(replaceRecords)
                .finally(function() {
                    previewCanceler = null;
                });
        }

        /**
         * @ngdoc method
         * @name getPreviewUpdateRecords
         * @methodOf data-prep.services.playground.service:PreviewService
         * @param {object} currentStep The current active step
         * @param {object} updateStep The step to update for the preview preview
         * @param {object} newParams The new parameters to apply on the step to update
         * @description Call the update step preview service and replace records in the grid.
         * It cancel the previous preview first
         */
        function getPreviewUpdateRecords(currentStep, updateStep, newParams) {
            cancelPreview(true, null);
            initPreviewIdNeeded();

            PreparationService.getPreviewUpdate(currentStep, updateStep, newParams, displayedTdpIds, previewCanceler)
                .then(function(response) {
                    DatagridService.focusedColumn = updateStep.column.id;
                    return response;
                })
                .then(replaceRecords)
                .finally(function() {
                    previewCanceler = null;
                });
        }

        /**
         * @ngdoc method
         * @name stopPendingPreview
         * @methodOf data-prep.services.playground.service:PreviewService
         * @description Cancel the pending preview (resolving the cancel promise).
         */
        function stopPendingPreview() {
            if(previewCanceler) {
                previewCanceler.resolve('user cancel');
                previewCanceler = null;
            }
        }

        /**
         * @ngdoc method
         * @name reset
         * @methodOf data-prep.services.playground.service:PreviewService
         * @param {boolean} restoreOriginalData If true, restore the original data before the reset
         * @description Reset the variables (original data, ids, ...), and optionally restore the original records
         */
        function reset(restoreOriginalData) {
            if(restoreOriginalData && previewInProgress()) {
                DatagridService.updateData(originalData);
            }
            originalData = null;
            modifiedRecords = null;
            displayedTdpIds = null;
            startIndex = null;
            endIndex = null;
        }

        /**
         * @ngdoc method
         * @name cancelPreview
         * @param {boolean} partial If true, we cancel pending preview but we do NOT reset/restore the original data
         * @param {string} focusedColId The column id where to set the grid focus
         * @methodOf data-prep.services.playground.service:PreviewService
         * @description Cancel the current preview or the pending preview (resolving the cancel promise).
         * The original records is set back into the datagrid
         */
        function cancelPreview(partial, focusedColId) {
            stopPendingPreview();

            if(!partial && originalData) {
                DatagridService.focusedColumn = focusedColId;
                reset(true);
            }
        }

        /**
         * @ngdoc method
         * @name previewInProgress
         * @methodOf data-prep.services.playground.service:PreviewService
         * @description Test if a preview is currently displayed
         */
        function previewInProgress() {
            return !!originalData;
        }
    }

    angular.module('data-prep.services.playground')
        .service('PreviewService', PreviewService);
})();