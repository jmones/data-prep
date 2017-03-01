package org.talend.dataprep.dataset.store.content.http;

import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

import org.junit.Test;
import org.talend.dataprep.dataset.DataSetBaseTest;
import org.talend.dataprep.dataset.service.locator.HttpDataSetLocator;

/**
 * Unit test for the remote http datasets.
 */
public class RemoteHttpDataSetTests extends DataSetBaseTest {

    @Test
    public void createRemoteHttp() throws Exception {

        String remoteLocation = "{\"type\": \"http\",\"url\": \"http://localhost:" + port + "/not/so/far/away\"}";

        int before = dataSetMetadataRepository.size();
        String dataSetId = given() //
                .body(remoteLocation.getBytes()) //
                .header("Content-Type", HttpDataSetLocator.MEDIA_TYPE) //
                .queryParam("name", "test_remote_http") //
                .when() //
                .post("/datasets") //
                .asString();

        int after = dataSetMetadataRepository.size();
        assertThat(after - before, is(1));
        // the next call may fail due to timing issues : TODO // make this synchronized somehow
        assertQueueMessages(dataSetId);
    }

    @Test
    public void createRemoteHttpOnMissingResource() throws Exception {

        String remoteLocation = "{\"type\": \"http\",\"url\": \"http://localhost:" + port + "/cannot/be/reached\"}";

        int statusCode = given() //
                .body(remoteLocation.getBytes()) //
                .header("Content-Type", HttpDataSetLocator.MEDIA_TYPE) //
                .queryParam("name", "test_remote_http") //
                .when() //
                .post("/datasets") //
                .statusCode();

        assertEquals(404, statusCode);
    }

}