package com.capricorn.calculator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class ArithmeticParserTest {
    @Test
    void evaluatesOperatorPrecedenceAndParentheses() {
        assertEquals(14, new ArithmeticParser("2 + 3 * 4").parse());
        assertEquals(20, new ArithmeticParser("(2 + 3) * 4").parse());
    }

    @Test
    void supportsUnarySignsAndDecimals() {
        assertEquals(-1.5, new ArithmeticParser("-2 + .5").parse());
    }

    @Test
    void rejectsDivisionByZero() {
        assertThrows(IllegalArgumentException.class,
                () -> new ArithmeticParser("8 / (3 - 3)").parse());
    }

    @Test
    void rejectsTrailingOrUnsupportedInput() {
        assertThrows(IllegalArgumentException.class,
                () -> new ArithmeticParser("2 + 2; Runtime.getRuntime()").parse());
    }
}
