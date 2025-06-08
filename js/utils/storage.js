// Storage keys
export const STORAGE_KEYS = {
    COURSE_MODULES: 'courseModules',
    SEMESTERS: 'semesters',
    CLASSES: 'classes',
    TEACHERS: 'teachers',
    RATE_PER_LESSON: 'ratePerLesson',
    TEACHER_COEFFICIENTS: 'teacherCoefficients',
    CLASS_COEFFICIENTS: 'classCoefficients'
};

// Initialize storage with empty arrays if not exists
export function initStorage() {
    Object.values(STORAGE_KEYS).forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify([]));
        }
    });
}

// Generic CRUD operations
export function getAll(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

export function getById(key, id) {
    const items = getAll(key);
    return items.find(item => item.id === id);
}

export function add(key, item) {
    const items = getAll(key);
    const newItem = {
        id: Date.now().toString(),
        ...item
    };
    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    return newItem;
}

export function update(key, id, updates) {
    const items = getAll(key);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = {...items[index], ...updates };
        localStorage.setItem(key, JSON.stringify(items));
        return items[index];
    }
    return null;
}

export function remove(key, id) {
    const items = getAll(key);
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
}

// Validation helpers
export function validateRequired(data, fields) {
    const errors = [];
    fields.forEach(field => {
        if (!data[field]) {
            errors.push(`${field} is required`);
        }
    });
    return errors;
}

export function validateUnique(key, field, value, excludeId = null) {
    const items = getAll(key);
    return !items.some(item =>
        item[field] === value && (!excludeId || item.id !== excludeId)
    );
}