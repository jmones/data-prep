package org.talend.dataprep.schema;


import java.io.*;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.talend.dataprep.exception.CommonErrorCodes;
import org.talend.dataprep.exception.TDPException;

@Component
public class LineBasedFormatGuesser implements FormatGuesser {

    /** This class' logger. */
    private static final Logger LOGGER = LoggerFactory.getLogger(LineBasedFormatGuesser.class);

    /** Replacement char used to replace a char that cannot be displayed, typical when you read binary files. */
    private static final int REPLACEMENT_CHAR = 65533;

    /** Threshold to detect binary stream in percentage. */
    private static final int BINARY_DETECTION_THRESHOLD = 10;

    /** The csv format guesser. */
    @Autowired
    private CSVFormatGuess csvFormatGuess;
    /** The fallback guess if the input is not CSV compliant. */
    @Autowired
    private NoOpFormatGuess fallbackGuess;

    /**
     * @see FormatGuesser#guess(InputStream)
     */
    @Override
    public FormatGuesser.Result guess(InputStream stream) {
        Separator sep = guessSeparator(stream, "UTF-8");
        if (sep != null) {
            return new FormatGuesser.Result(csvFormatGuess, //
                    Collections.singletonMap(CSVFormatGuess.SEPARATOR_PARAMETER, String.valueOf(sep.getSeparator())));
        }
        return new FormatGuesser.Result(fallbackGuess, Collections.emptyMap()); // Fallback
    }

    /**
     * Try to guess the separator used in the CSV.
     *
     * @param is the inputstream to read the CSV from.
     * @param encoding the encoding to use for the reading.
     * @return the guessed CSV separator or null if none found.
     */
    private Separator guessSeparator(InputStream is, String encoding) {
        try {
            Reader reader = encoding != null ? new InputStreamReader(is, encoding) : new InputStreamReader(is);
            try (LineNumberReader lineNumberReader = new LineNumberReader(reader)) {
                List<Separator> separators = new ArrayList<>();
                Map<Character, Separator> separatorMap = new HashMap<>();
                int replacementCharsCount = 0;
                int totalChars = 0;
                int lineCount = 0;
                boolean inQuote = false;
                String s;
                while (totalChars < 64 * 1024 && lineCount < 100 && (s = lineNumberReader.readLine()) != null) {
                    totalChars += s.length() + 1; // count the new line character
                    if (s.length() == 0) {
                        continue;
                    }
                    if (!inQuote) {
                        lineCount++;
                    }
                    for (int i = 0; i < s.length(); i++) {
                        char c = s.charAt(i);
                        if (REPLACEMENT_CHAR == (int) c) {
                            replacementCharsCount++;
                            int replacementCharPercentage = replacementCharsCount * 100 / totalChars;
                            if (replacementCharPercentage > BINARY_DETECTION_THRESHOLD) {
                                LOGGER.debug("binary stream detected, hence cannot be a CSV");
                                return null;
                            }
                        }
                        if ('"' == c) {
                            inQuote = !inQuote;
                        }
                        if (!Character.isLetterOrDigit(c) && !"\"' .-".contains(s.subSequence(i, i + 1)) && (!inQuote)) {
                            Separator separator = separatorMap.get(c);
                            if (separator == null) {
                                separator = new Separator(c);
                                separatorMap.put(c, separator);
                                separators.add(separator);
                            }
                            separator.totalCountPlusOne();
                        }
                    }
                }

                return chooseSeparator(separators, lineCount);

            }
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_READ_CONTENT, e);
        }

    }

    /**
     * Choose the best separator out of the ones.
     *
     * @param separators the list of separators found in the CSV (may be empty but not null.
     * @param lineCount number of lines in the CSV.
     * @return the separator to use to read the CSV or null if none found.
     */
    private Separator chooseSeparator(List<Separator> separators, int lineCount) {

        // easy case where there's no choice
        if (separators.isEmpty()) {
            if (lineCount > 0) {
                // There are some lines processed, but no separator (a one-column content?), so pick a default separator.
                return new Separator(',');
            }
            return null;
        }

        // if there's only one separator, let's use it
        if (separators.size() == 1) {
            return separators.get(0);
        }

        // compute the average per line for separators
        for (Separator separator : separators) {
            double averagePerLine = separator.getTotalCount() / lineCount;
            separator.setAveragePerLine(averagePerLine);
        }

        // remove irrelevant separators (0 as average per line that can happen when you read binary files)
        final Separator dominantSeparator = separators.stream()
                .filter(separator -> separator.getAveragePerLine() > 0) //
                .sorted((sep0, sep1) -> Double.compare(sep1.getAveragePerLine(), sep0.getAveragePerLine())) //
                .findFirst() //
                .get();
        return dominantSeparator;
    }


}