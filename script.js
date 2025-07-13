document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById("calc-display");
    const buttons = document.getElementsByClassName('btn');
    let currentValue = "";
    let angleMode = 'deg'; // Default to degrees

    // Function to convert degrees to radians
    function degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Function to convert radians to degrees
    function radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    function calculateFactorial(n) {
        if (n < 0 || !Number.isInteger(n)) {
            return "Error: Factorial is only defined for non-negative integers.";
        } else if (n === 0) {
            return 1;
        } else {
            let result = 1;
            for (let i = 1; i <= n; i++) {
                result *= i;
            }
            return result;
        }
    }

    function evaluateResult() {
        try {
            let expression = currentValue;

            // Handle Factorial
            expression = expression.replace(/(\d+)!/g, (match, numStr) => {
                const num = parseInt(numStr);
                const factorialResult = calculateFactorial(num);
                if (typeof factorialResult === 'string' && factorialResult.startsWith('Error')) {
                    throw new Error(factorialResult);
                }
                return factorialResult.toString();
            });

            // Handle x²
            expression = expression.replace(/(\d+|\([^)]+\))²/g, (match, base) => {
                const cleanedBase = base.startsWith('(') && base.endsWith(')') ? base.slice(1, -1) : base;
                return `Math.pow(${cleanedBase}, 2)`;
            });

            // Handle x^y
            expression = expression.replace(/(\d+(\.\d+)?|\([^)]+\))\^(\d+(\.\d+)?|\([^)]+\))/g, (match, base, _, exponent) => {
                const cleanedBase = base.startsWith('(') && base.endsWith(')') ? base.slice(1, -1) : base;
                const cleanedExponent = exponent.startsWith('(') && exponent.endsWith(')') ? exponent.slice(1, -1) : exponent;
                return `Math.pow(${cleanedBase},${cleanedExponent})`;
            });

            // Convert operators and constants
            let converted = expression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/%/g, "*0.01")
                .replace(/π/g, "Math.PI")
                .replace(/e/g, "Math.E")
                .replace(/√/g, "Math.sqrt");

            // Handle trigonometric and inverse trigonometric functions based on angleMode
            converted = converted.replace(/(sin|cos|tan|asin|acos|atan|log|ln)\(([^)]*)\)/g, (match, func, arg) => {
                let processedArg = arg;
                if (func === 'sin' || func === 'cos' || func === 'tan') {
                    // For sin, cos, tan, convert argument to radians if in degree mode
                    processedArg = angleMode === 'deg' ? `degToRad(${arg})` : arg;
                    return `Math.${func}(${processedArg})`;
                } else if (func === 'asin' || func === 'acos' || func === 'atan') {
                    // For asin, acos, atan, the Math function returns radians.
                    // If in degree mode, convert the result to degrees.
                    let mathFunc = `Math.${func}(${processedArg})`;
                    return angleMode === 'deg' ? `radToDeg(${mathFunc})` : mathFunc;
                } else if (func === 'log') {
                    return `Math.log10(${processedArg})`;
                } else if (func === 'ln') {
                    return `Math.log(${processedArg})`;
                }
                return match; // Should not happen
            });

            
            const result = eval(converted);
            currentValue = result.toString();
            display.value = currentValue;

        } catch (error) {
            console.error("Calculation Error:", error);
            currentValue = "ERROR";
            display.value = currentValue;
        }
    }

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.addEventListener('click', function() {
            const value = button.innerText;

            try {
                if (value === "AC") {
                    currentValue = "";
                    display.value = currentValue;
                } else if (value === '=') {
                    evaluateResult();
                } else if (value === 'DEG') {
                    angleMode = 'deg';
                    console.log("Mode set to Degrees");
                } else if (value === 'RAD') {
                    angleMode = 'rad';
                    console.log("Mode set to Radians");
                } else if (value === '!') {
                    const lastChar = currentValue.slice(-1);
                    if ((!isNaN(parseFloat(lastChar)) && lastChar !== ' ') || lastChar === ')') { // Use parseFloat for more robust check
                        currentValue += value;
                    } else {
                        console.warn("Factorial '!' pressed without a preceding number or closing parenthesis.");
                    }
                    display.value = currentValue;
                } else if (value === 'x²') {
                    const lastChar = currentValue.slice(-1);
                    if ((!isNaN(parseFloat(lastChar)) && lastChar !== ' ') || lastChar === ')') { // Use parseFloat for more robust check
                        currentValue += '²';
                    } else {
                        console.warn("Square 'x²' pressed without a preceding number or closing parenthesis.");
                    }
                    display.value = currentValue;
                } else if (value === 'x^y') {
                    const lastChar = currentValue.slice(-1);
                    if ((!isNaN(parseFloat(lastChar)) && lastChar !== ' ') || lastChar === ')') { // Use parseFloat for more robust check
                        currentValue += '^';
                    } else {
                        console.warn("Exponent 'x^y' pressed without a preceding number or closing parenthesis.");
                    }
                    display.value = currentValue;
                }
                // Add this condition to specifically handle the "More" button
                else if (value === 'More') {
                    // Do nothing for the display, just let Bootstrap handle the dropdown
                    console.log("More button clicked - dropdown should toggle.");
                }
                // For trigonometric functions, ensure they are appended with an opening parenthesis
                else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', '√'].includes(value)) {
                    currentValue += value + '(';
                    display.value = currentValue;
                }
                else {
                    currentValue += value;
                    display.value = currentValue;
                }
            } catch (error) {
                console.error(error);
                currentValue = "ERROR";
                display.value = currentValue;
            }
        });
    }
});