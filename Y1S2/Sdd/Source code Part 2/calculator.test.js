// calculator.test.js
const { addChar, deleteChar, compute, cos, sin, tan, sqrt, ln, checkNum } = require('./calculator');

describe('Input Manipulation', () => {
    let input;

    beforeEach(() => {
        input = { value: '0' }; // Mocking the input field
    });

    test('Adds a character to an existing value', () => {
        input.value = '12';
        addChar(input, '3');
        expect(input.value).toBe('123');
    });
});

describe('Mathematical functions', () => {
    let form;

    beforeEach(() => {
        form = { display: { value: '' } }; // Mocking the form and display
    });

    test('Correct Cosine calculations', () => {
        form.display.value = '0';
        cos(form);
        expect(form.display.value).toBe(1);
    });

    test('Correct Sine calculations', () => {
        form.display.value = '0';
        sin(form);
        expect(form.display.value).toBe(0);
    });

    test('Correct Tangent calculation', () => {
        form.display.value = '0';
        tan(form);
        expect(form.display.value).toBe(0);
    });

    test('Correct Sqrt calculation', () => {
        form.display.value = '4';
        sqrt(form);
        expect(form.display.value).toBe(2);
    });

    test('Correct ln calculation', () => {
        form.display.value = '1';
        ln(form);
        expect(form.display.value).toBe(0);
    });

});

describe('Character deletion and input evaluation', () => {
    let input, form;

    beforeEach(() => {
        input = { value: '123' }; // Mock input
        form = { display: { value: '2+3' } }; // Mock the display
    });

    test('Previous character is deleted from input', () => {
        deleteChar(input);
        expect(input.value).toBe('12');
    });

    test('Correctly calculates when brackets are present', () => {
        form.display.value = '(2+3)*2';
        compute(form);
        expect(form.display.value).toBe(10);
    });
});

describe('Invalid inputs validation', () => {
    let form;
    
    beforeEach(() => {
        form = { display: { value: '' } };
        global.alert = jest.fn();
    });


    test('Correctly identifies invalid inputs', () => {
        const invalidInput = 'abcde'; // Invalid input for the calculator
        expect(checkNum(invalidInput)).toBe(false); // Expect the function to return false
        expect(alert).toHaveBeenCalledWith('invalid entry!'); // Ensure the alert is called
    });
    
    test('Correctly identifies valid inputs', () => {
        const validInput = '123+45*(67-89)';
        expect(checkNum(validInput)).toBe(true); // Valid input should return true
        expect(alert).not.toHaveBeenCalled(); // No alert should be triggered
    });
});
