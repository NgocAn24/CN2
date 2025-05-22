import { getItem, setItem, removeItem } from './storage';

describe('storage utility functions', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('setItem stores an item in localStorage', () => {
        setItem('key', 'value');
        expect(localStorage.getItem('key')).toBe(JSON.stringify('value'));
    });

    test('getItem retrieves an item from localStorage', () => {
        localStorage.setItem('key', JSON.stringify('value'));
        expect(getItem('key')).toBe('value');
    });

    test('removeItem removes an item from localStorage', () => {
        localStorage.setItem('key', JSON.stringify('value'));
        removeItem('key');
        expect(localStorage.getItem('key')).toBeNull();
    });
});