// Import required modules
const StorageUtil = require('./utils/storage.js');
const Teacher = require('./models/teacher.js');
const Class = require('./models/class.js');
const CourseModule = require('./models/courseModule.js');
const Semester = require('./models/semester.js');

console.log('Starting integration tests...');

// Test 1: Complete flow of creating semester, course module, class and assigning teacher
console.log('\nTest 1: Complete flow test');

// 1.1 Create semester
console.log('1.1 Creating semester');
const semester = new Semester('2023-1', 'Fall 2023', '2023-08-15', '2023-12-31');
Semester.add(semester);
console.log('Semester created:', semester);

// 1.2 Create course module
console.log('\n1.2 Creating course module');
const courseModule = new CourseModule('CS101', 'Programming Basics', 3, 1.0, 45);
CourseModule.add(courseModule);
console.log('Course module created:', courseModule);

// 1.3 Create class
console.log('\n1.3 Creating class');
const classData = new Class(
    semester.id,
    courseModule.id,
    'CS101-A',
    'Programming Basics - Group A',
    30
);
Class.add(classData);
console.log('Class created:', classData);

// 1.4 Create teacher
console.log('\n1.4 Creating teacher');
const teacher = new Teacher('T001', 'John Doe', 'john@example.com', '1234567890');
Teacher.add(teacher);
console.log('Teacher created:', teacher);

// 1.5 Assign teacher to class
console.log('\n1.5 Assigning teacher to class');
Teacher.assignClass(teacher.id, classData.id);
console.log('Teacher assigned to class');

// Test 2: Verify relationships
console.log('\nTest 2: Verifying relationships');

// 2.1 Get teacher's assigned classes
console.log('2.1 Getting teacher\'s assigned classes');
const teacherClasses = Teacher.getAssignedClasses(teacher.id);
console.log('Teacher\'s assigned classes:', teacherClasses);
console.log('Class assignment correct:', teacherClasses.some(c => c.id === classData.id));

// 2.2 Get class full info
console.log('\n2.2 Getting class full info');
const classInfo = Class.getFullInfo(classData.id);
console.log('Class full info:', classInfo);
console.log('Class-Semester relationship correct:', classInfo.semester.id === semester.id);
console.log('Class-CourseModule relationship correct:', classInfo.courseModule.id === courseModule.id);

// Test 3: Update and cascade effects
console.log('\nTest 3: Testing update cascading');

// 3.1 Update teacher
console.log('3.1 Updating teacher');
Teacher.update(teacher.id, { name: 'John Smith' });
const updatedTeacher = Teacher.getById(teacher.id);
console.log('Teacher updated:', updatedTeacher);

// 3.2 Update class
console.log('\n3.2 Updating class');
Class.update(classData.id, { studentCount: 35 });
const updatedClass = Class.getById(classData.id);
console.log('Class updated:', updatedClass);

// Test 4: Delete and cascade effects
console.log('\nTest 4: Testing delete cascading');

// 4.1 Delete teacher
console.log('4.1 Deleting teacher');
Teacher.delete(teacher.id);
const deletedTeacherClass = Class.getById(classData.id);
console.log('Class after teacher deletion:', deletedTeacherClass);
console.log('Teacher reference removed:', deletedTeacherClass.teacherId === null);

// Clean up test data
console.log('\nCleaning up test data...');
Class.delete(classData.id);
CourseModule.delete(courseModule.id);
Semester.delete(semester.id);

console.log('\nIntegration tests completed.');