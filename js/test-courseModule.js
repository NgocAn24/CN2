// Import required modules
const StorageUtil = require('./utils/storage.js');
const CourseModule = require('./models/courseModule.js');

// Test 1: Create new course module
console.log('Test 1: Creating new course module');
const module = new CourseModule('CS001', 'Intro to CS', 3, 1.0, 45);
console.log('New course module:', module);

// Test 2: Save and retrieve course module
console.log('\nTest 2: Save and retrieve course module');
CourseModule.add(module);
const retrieved = CourseModule.getById(module.id);
console.log('Retrieved course module:', retrieved);

// Test 3: Update course module
console.log('\nTest 3: Update course module');
const updateData = {
    name: 'Introduction to Computer Science',
    credits: 4
};
CourseModule.update(module.id, updateData);
const updated = CourseModule.getById(module.id);
console.log('Updated course module:', updated);

// Test 4: Validate course module
console.log('\nTest 4: Validate course module');
const invalidModule = {
    code: '',
    name: '',
    credits: 0,
    coefficient: -1,
    periods: 0
};
const errors = CourseModule.validate(invalidModule);
console.log('Validation errors:', errors);

// Test 5: Delete course module
console.log('\nTest 5: Delete course module');
CourseModule.delete(module.id);
const deleted = CourseModule.getById(module.id);
console.log('Deleted course module (should be undefined):', deleted);