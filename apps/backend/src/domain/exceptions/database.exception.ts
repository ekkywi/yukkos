export class RelationalConstraintError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RelationalContraintError';
    }
}

export class DatabaseOperationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseOperationError';
    }
}

export class ListingNotFoundError extends Error {
    constructor(message: string = 'Data kos tidak ditemukan.') {
        super(message);
        this.name = 'ListingNotFoundError';
    }
}