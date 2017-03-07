//  ============================================================================
//
//  Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
//  This source code is available under agreement available at
//  https://github.com/Talend/data-prep/blob/master/LICENSE
//
//  You should have received a copy of the agreement
//  along with this program; if not, write to Talend SA
//  9 rue Pages 92150 Suresnes, France
//
//  ============================================================================

package org.talend.dataprep.transformation.actions.date;

import static java.time.temporal.ChronoUnit.DAYS;
import static java.time.temporal.ChronoUnit.MONTHS;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.transformation.actions.AbstractMetadataBaseTest.ValueBuilder.value;
import static org.talend.dataprep.transformation.actions.AbstractMetadataBaseTest.ValuesBuilder.builder;
import static org.talend.dataprep.transformation.actions.ActionMetadataTestUtils.*;
import static org.talend.dataprep.transformation.actions.common.OtherColumnParameters.*;
import static org.talend.dataprep.transformation.actions.date.ModifyDate.TIME_UNIT_PARAMETER;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.talend.daikon.exception.TalendRuntimeException;
import org.talend.dataprep.api.action.ActionDefinition;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.row.DataSetRow;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.actions.ActionMetadataTestUtils;
import org.talend.dataprep.transformation.actions.category.ActionCategory;
import org.talend.dataprep.transformation.api.action.ActionTestWorkbench;

public class ModifyDateTest extends BaseDateTest {

    /** The action to test. */
    private ModifyDate action = new ModifyDate();

    private Map<String, String> parameters;

    @Before
    public void init() throws IOException {
        parameters = ActionMetadataTestUtils.parseParameters(this.getClass().getResourceAsStream("modifyDateAction.json"));
    }

    @Test
    public void testName() throws Exception {
        assertEquals("modify_date", action.getName());
    }

    @Test
    public void testParameters() throws Exception {
        // 4 predefined patterns + custom = 5
        assertThat(action.getParameters().size(), is(6));
    }

    @Test
    public void testAdapt() throws Exception {
        assertThat(action.adapt((ColumnMetadata) null), is(action));
        ColumnMetadata column = column().name("myColumn").id(0).type(Type.STRING).build();
        assertThat(action.adapt(column), is(action));
    }

    @Test
    public void testCategory() throws Exception {
        assertThat(action.getCategory(), is(ActionCategory.DATE.getDisplayName()));
    }

    @Test(expected = TalendRuntimeException.class)
    public void should_check_column_id_parameter_when_dealing_with_row_metadata() {
        //given
        Map<String, String> missingParameters = new HashMap<>();
        missingParameters.put("column_id", "");

        //when
        ActionTestWorkbench.test(new DataSetRow(Collections.emptyMap()), actionRegistry, factory.create(action, missingParameters));
    }

    @Test(expected = TalendRuntimeException.class)
    public void should_check_new_pattern_parameter_when_dealing_with_row_metadata() {
        //given
        Map<String, String> missingParameters = new HashMap<>();
        missingParameters.put("column_id", "0000");
        missingParameters.put(ModifyDate.NEW_PATTERN, "toto");

        //when
        ActionTestWorkbench.test(new DataSetRow(Collections.emptyMap()), actionRegistry, factory.create(action, missingParameters));
    }

    @Test(expected = TalendRuntimeException.class)
    public void should_check_new_pattern_parameter_when_dealing_with_row() {
        //given
        final Map<String, String> insufficientParams = new HashMap<>();
        insufficientParams.put("column_id", "0000");

        //when
        ActionTestWorkbench.test(new DataSetRow(Collections.emptyMap()), actionRegistry, factory.create(action, insufficientParams));
    }

    @Test
    public void should_process_row() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04/25/1999").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("tata").type(Type.STRING).name("last update")) //
                .build();

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/25/2000", "tata");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_not_process_row_wrong_amount() throws Exception {
        // given
        final DataSetRow row = getRow("toto", "04/25/1999", "tata");
        setStatistics(row, "0001", getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"));
        parameters.put(CONSTANT_VALUE, "ouf");

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/25/1999", "tata");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_alternate_unit() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04/25/1999").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("tata").type(Type.STRING).name("last update")) //
                .build();
        parameters.put(TIME_UNIT_PARAMETER, MONTHS.name());

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "05/25/1999", "tata");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_alternate_amount() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04/25/1999").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("tata").type(Type.STRING).name("last update")) //
                .build();
        parameters.put(CONSTANT_VALUE, "4");

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/25/2003", "tata");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_other_column() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04/25/1999").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("5").type(Type.STRING).name("last update")) //
                .build();
        parameters.remove(CONSTANT_VALUE);
        parameters.put(MODE_PARAMETER, OTHER_COLUMN_MODE);
        parameters.put(SELECTED_COLUMN_PARAMETER, "0002");
        parameters.put(TIME_UNIT_PARAMETER, DAYS.name());

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/30/1999", "5");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_other_column_bigger_number() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04/25/1999").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("162").type(Type.STRING).name("last update")) //
                .build();

        parameters.put(MODE_PARAMETER, OTHER_COLUMN_MODE);
        parameters.put(SELECTED_COLUMN_PARAMETER, "0002");
        parameters.put(TIME_UNIT_PARAMETER, DAYS.name());

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "10/04/1999", "162");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_other_column_float_number() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04/25/1999").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("5.0").type(Type.STRING).name("last update")) //
                .build();
        parameters.put(MODE_PARAMETER, OTHER_COLUMN_MODE);
        parameters.put(SELECTED_COLUMN_PARAMETER, "0002");
        parameters.put(TIME_UNIT_PARAMETER, DAYS.name());

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/30/1999", "5.0");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_other_column_float_number_round() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04/25/1999").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("5.2").type(Type.STRING).name("last update")) //
                .build();
        parameters.put(MODE_PARAMETER, OTHER_COLUMN_MODE);
        parameters.put(SELECTED_COLUMN_PARAMETER, "0002");
        parameters.put(TIME_UNIT_PARAMETER, DAYS.name());

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/30/1999", "5.2");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_not_process_row_other_column_wrong_amount() throws Exception {
        // given
        final DataSetRow row = getRow("toto", "04/25/1999", "ah");
        setStatistics(row, "0001", getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"));
        parameters.put(MODE_PARAMETER, OTHER_COLUMN_MODE);
        parameters.put(SELECTED_COLUMN_PARAMETER, "0002");
        parameters.put(TIME_UNIT_PARAMETER, DAYS.name());

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/25/1999", "ah");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_when_value_does_not_match_most_frequent_pattern() throws Exception {
        // given
        final DataSetRow row = builder() //
                .with(value("toto").type(Type.STRING).name("recipe")) //
                .with(value("04-25-09").type(Type.DATE).name("recipe").statistics(getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"))) //
                .with(value("tata").type(Type.STRING).name("last update")) //
                .build();

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "04/25/2010", "tata");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_when_value_does_not_match_any_pattern() throws Exception {
        // given
        DataSetRow row = getRow("toto", "NA", "tata");
        setStatistics(row, "0001", getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"));

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        final DataSetRow expectedRow = getRow("toto", "NA", "tata");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_process_row_when_value_is_empty() throws Exception {
        // given
        DataSetRow row = getRow("toto", "", "tata");
        setStatistics(row, "0001", getDateTestJsonAsStream("statistics_MM_dd_yyyy.json"));

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then (values should be unchanged)
        final DataSetRow expectedRow = getRow("toto", "", "tata");
        assertEquals(expectedRow.values(), row.values());
    }

    @Test
    public void should_accept_column() {
        assertTrue(action.acceptField(getColumn(Type.DATE)));
    }

    @Test
    public void should_not_accept_column() {
        assertFalse(action.acceptField(getColumn(Type.NUMERIC)));
        assertFalse(action.acceptField(getColumn(Type.FLOAT)));
        assertFalse(action.acceptField(getColumn(Type.STRING)));
        assertFalse(action.acceptField(getColumn(Type.BOOLEAN)));
    }

    @Test
    public void should_have_expected_behavior() {
        assertEquals(1, action.getBehavior().size());
        assertTrue(action.getBehavior().contains(ActionDefinition.Behavior.VALUES_COLUMN));
    }

}
