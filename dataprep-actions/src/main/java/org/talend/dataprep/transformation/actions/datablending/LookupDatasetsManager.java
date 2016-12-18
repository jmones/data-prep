package org.talend.dataprep.transformation.actions.datablending;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.talend.dataprep.api.dataset.row.LightweightExportableDataSet;

public class LookupDatasetsManager {

    private static final Logger LOGGER = LoggerFactory.getLogger(LookupDatasetsManager.class);

    private final Map<String, LightweightExportableDataSet> datasets;

    private static LookupDatasetsManager uniqueInstance;

    private LookupDatasetsManager() {
        datasets = new HashMap<>();
    }

    static {
        LOGGER.info("Creating the unique instance of LookupDatasetManager");
        if (uniqueInstance == null) {
            uniqueInstance = new LookupDatasetsManager();
        }
    }

    private Map<String, LightweightExportableDataSet> getDatasets() {
        return datasets;
    }

    public static synchronized boolean put(String dataSetId, LightweightExportableDataSet dataSet) {
        if (uniqueInstance.getDatasets().containsKey(dataSetId)) {
            LOGGER.info("The DATASET of id: " + dataSetId + " has already been added");
            return false;
        } else {
            LOGGER.info("Adding the DATASET of id: " + dataSetId);
            uniqueInstance.getDatasets().put(dataSetId, dataSet);
            return true;
        }
    }

    public static synchronized LightweightExportableDataSet remove(String dataSetId) {
        LOGGER.info("removing the DATASET of id: " + dataSetId);
        return uniqueInstance.getDatasets().remove(dataSetId);
    }

    public static LightweightExportableDataSet get(String dataSetId) {
        LOGGER.info("Retrieving the DATASET of id: " + dataSetId);
        LOGGER.info("Retrieving the DATASET of id: " + dataSetId);
        return uniqueInstance.getDatasets().get(dataSetId);
    }
}
