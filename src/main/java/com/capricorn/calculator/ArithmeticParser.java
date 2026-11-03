package com.capricorn.calculator;

/** Parses basic arithmetic without evaluating arbitrary Java or JavaScript code. */
final class ArithmeticParser {
    private final String source;
    private int position;

    ArithmeticParser(String source) {
        this.source = source;
    }

    double parse() {
        double value = expression();
        skipWhitespace();
        if (position != source.length()) {
            throw invalidExpression();
        }
        if (!Double.isFinite(value)) {
            throw new IllegalArgumentException("The result is outside the supported numeric range.");
        }
        return value;
    }

    private double expression() {
        double value = term();
        while (true) {
            skipWhitespace();
            if (consume('+')) {
                value += term();
            } else if (consume('-')) {
                value -= term();
            } else {
                return value;
            }
        }
    }

    private double term() {
        double value = factor();
        while (true) {
            skipWhitespace();
            if (consume('*')) {
                value *= factor();
            } else if (consume('/')) {
                double divisor = factor();
                if (divisor == 0) {
                    throw new IllegalArgumentException("Cannot divide by zero.");
                }
                value /= divisor;
            } else if (consume('%')) {
                double divisor = factor();
                if (divisor == 0) {
                    throw new IllegalArgumentException("Cannot use zero as a modulo divisor.");
                }
                value %= divisor;
            } else {
                return value;
            }
        }
    }

    private double factor() {
        skipWhitespace();
        if (consume('+')) {
            return factor();
        }
        if (consume('-')) {
            return -factor();
        }
        if (consume('(')) {
            double value = expression();
            skipWhitespace();
            if (!consume(')')) {
                throw invalidExpression();
            }
            return value;
        }
        return number();
    }

    private double number() {
        skipWhitespace();
        int start = position;
        boolean hasDigit = false;

        while (position < source.length() && Character.isDigit(source.charAt(position))) {
            position++;
            hasDigit = true;
        }
        if (position < source.length() && source.charAt(position) == '.') {
            position++;
            while (position < source.length() && Character.isDigit(source.charAt(position))) {
                position++;
                hasDigit = true;
            }
        }
        if (!hasDigit) {
            throw invalidExpression();
        }

        try {
            double value = Double.parseDouble(source.substring(start, position));
            if (!Double.isFinite(value)) {
                throw new IllegalArgumentException("Enter a finite numeric value.");
            }
            return value;
        } catch (NumberFormatException exception) {
            throw invalidExpression();
        }
    }

    private boolean consume(char expected) {
        if (position < source.length() && source.charAt(position) == expected) {
            position++;
            return true;
        }
        return false;
    }

    private void skipWhitespace() {
        while (position < source.length() && Character.isWhitespace(source.charAt(position))) {
            position++;
        }
    }

    private IllegalArgumentException invalidExpression() {
        return new IllegalArgumentException("Enter a valid arithmetic expression.");
    }
}
