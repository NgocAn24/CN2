// Import required modules
const StorageUtil = require('./utils/storage.js');
const Class = require('./models/class.js');
const Teacher = require('./models/teacher.js');

// Test 1: Create new class
console.log('Test 1: Creating new class');
const classData = new Class(
    'sem123', // semesterId
    'cs101', // courseModuleId
    'CS101-A', // code
    'Introduction to Programming - Group A', // name
    30 // studentCount
);
console.log('New class:', classData);
console.log('teacherId is null:', classData.teacherId === null);

// Test 2: Save and retrieve class
console.log('\nTest 2: Save and retrieve class');
Class.add(classData);
const retrieved = Class.getById(classData.id);
console.log('Retrieved class:', retrieved);

// Test 3: Update class
console.log('\nTest 3: Update class');
const updateData = {
    name: 'Introduction to Programming - Section A',
    studentCount: 35
};
Class.update(classData.id, updateData);
const updated = Class.getById(classData.id);
console.log('Updated class:', updated);

// Test 4: Assign teacher to class
console.log('\nTest 4: Assign teacher to class');
const teacher = new Teacher('T001', 'Test Teacher', 'test@test.com', '1234567890');
Teacher.add(teacher);
Class.assignTeacher(classData.id, teacher.id);
const withTeacher = Class.getById(classData.id);
console.log('Class with assigned teacher:', withTeacher);
console.log('Teacher ID matches:', withTeacher.teacherId === teacher.id);

// Test 5: Get classes by semester
console.log('\nTest 5: Get classes by semester');
const semesterClasses = Class.getBySemester('sem123');
console.log('Classes in semester:', semesterClasses);

// Test 6: Get classes by course module
console.log('\nTest 6: Get classes by course module');
const moduleClasses = Class.getByCourseModule('cs101');
console.log('Classes in course module:', moduleClasses);

// Test 7: Validate class
console.log('\nTest 7: Validate class');
const invalidClass = {
    semesterId: '',
    courseModuleId: '',
    code: '',
    name: '',
    studentCount: 0
};
const errors = Class.validate(invalidClass);
console.log('Validation errors:', errors);

// Test 8: Get full class info
console.log('\nTest 8: Get full class info');
const fullInfo = Class.getFullInfo(classData.id);
console.log('Full class info:', fullInfo);

// Test 9: Delete class
console.log('\nTest 9: Delete class');
Class.delete(classData.id);
const deleted = Class.getById(classData.id);
console.log('Deleted class (should be undefined):', deleted);