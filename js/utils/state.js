class AppState {
    constructor() {
        this.reset();
    }

    reset() {
        this._editingId = null;
        this._assigningId = null;
    }

    setEditingId(id) {
        this._editingId = id;
    }

    getEditingId() {
        return this._editingId;
    }

    setAssigningId(id) {
        this._assigningId = id;
    }

    getAssigningId() {
        return this._assigningId;
    }
}

// Create and export a singleton instance
export const appState = new AppState();