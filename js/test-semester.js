// Import required modules
const StorageUtil = require('./utils/storage.js');
const Semester = require('./models/semester.js');

// Test 1: Create new semester
console.log('Test 1: Creating new semester');
const semester = new Semester('2023-2024/1', 'Học kỳ 1 năm 2023-2024', '2023-08-15', '2023-12-31');
console.log('New semester:', semester);

// Test 2: Save and retrieve semester
console.log('\nTest 2: Save and retrieve semester');
Semester.add(semester);
const retrieved = Semester.getById(semester.id);
console.log('Retrieved semester:', retrieved);

// Test 3: Update semester
console.log('\nTest 3: Update semester');
const updateData = {
    name: 'HK1 2023-2024',
    endDate: '2024-01-15'
};
Semester.update(semester.id, updateData);
const updated = Semester.getById(semester.id);
console.log('Updated semester:', updated);

// Test 4: Validate semester
console.log('\nTest 4: Validate semester');
const invalidSemester = {
    code: '',
    name: '',
    startDate: 'invalid-date',
    endDate: '2023-01-01'
};
const errors = Semester.validate(invalidSemester);
console.log('Validation errors:', errors);

// Test 5: Get current semester
console.log('\nTest 5: Get current semester');
const currentSemester = Semester.getCurrentSemester();
console.log('Current semester:', currentSemester);

// Test 6: Get all semesters sorted
console.log('\nTest 6: Get all semesters sorted');
// Add another semester for testing sort
const semester2 = new Semester('2023-2024/2', 'Học kỳ 2 năm 2023-2024', '2024-01-15', '2024-05-31');
Semester.add(semester2);
const allSemesters = Semester.getAllSorted();
console.log('All semesters (sorted):', allSemesters);

// Test 7: Delete semester
console.log('\nTest 7: Delete semester');
Semester.delete(semester.id);
const deleted = Semester.getById(semester.id);
console.log('Deleted semester (should be undefined):', deleted);

// Test 8: Date validation
console.log('\nTest 8: Date validation');
const invalidDates = {
    code: 'TEST',
    name: 'Test Semester',
    startDate: '2024-01-01',
    endDate: '2023-12-31' // End date before start date
};
const dateErrors = Semester.validate(invalidDates);
console.log('Date validation errors:', dateErrors);

// Test 9: Duplicate code validation
console.log('\nTest 9: Duplicate code validation');
const duplicate = {
    code: '2023-2024/2', // Already exists
    name: 'Duplicate Semester',
    startDate: '2024-06-01',
    endDate: '2024-08-31'
};
const duplicateErrors = Semester.validate(duplicate);
console.log('Duplicate code validation errors:', duplicateErrors);