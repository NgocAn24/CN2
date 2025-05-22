// Import required modules
const StorageUtil = require('./utils/storage.js');
const Teacher = require('./models/teacher.js');

// Test 1: Create new teacher
console.log('Test 1: Creating new teacher');
const teacher = new Teacher('T001', 'Test Teacher', 'test@test.com', '1234567890');
console.log('New teacher:', teacher);
console.log('assignedClasses is array:', Array.isArray(teacher.assignedClasses));
console.log('assignedClasses length:', teacher.assignedClasses.length);

// Test 2: Save and retrieve teacher
console.log('\nTest 2: Save and retrieve teacher');
Teacher.add(teacher);
const retrieved = Teacher.getById(teacher.id);
console.log('Retrieved teacher:', retrieved);
console.log('Retrieved assignedClasses is array:', Array.isArray(retrieved.assignedClasses));

// Test 3: Update teacher
console.log('\nTest 3: Update teacher');
const updateData = {
    name: 'Updated Teacher',
    email: 'updated@test.com'
};
Teacher.update(teacher.id, updateData);
const updated = Teacher.getById(teacher.id);
console.log('Updated teacher:', updated);
console.log('assignedClasses preserved:', Array.isArray(updated.assignedClasses));

// Test 4: Assign class
console.log('\nTest 4: Assign class');
Teacher.assignClass(teacher.id, 'class123');
const withClass = Teacher.getById(teacher.id);
console.log('Teacher with assigned class:', withClass);
console.log('assignedClasses:', withClass.assignedClasses);