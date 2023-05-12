import { Action, ActionType } from './action.js';
import { Record } from '../../../store/index.js';

interface Mode {
    processAction(action: Action): boolean;
}

export class AddMode implements Mode {
    input = '';

    processAction(action: Action): boolean {
        if (action.type === ActionType.Delete) {
            this.input = this.input.slice(0, -1);
            return true;
        }

        if (action.type === ActionType.Text) {
            this.input += action.text;
            return true;
        }

        return false;
    }
}

export class NormalMode implements Mode {
    processAction(): boolean {
        return false;
    }
}

export class RescheduleMode implements Mode {
    input = '';
    record: Record;

    constructor(record: Record) {
        this.record = record;
    }

    processAction(action: Action): boolean {
        if (action.type === ActionType.Delete) {
            this.input = this.input.slice(0, -1);
            return true;
        }

        if (action.type === ActionType.Text) {
            this.input += action.text;
            return true;
        }

        return false;
    }
}

export class SearchMode implements Mode {
    query = '';

    processAction(action: Action): boolean {
        if (action.type === ActionType.Delete) {
            this.query = this.query.slice(0, -1);
            return true;
        }

        if (action.type === ActionType.Text) {
            this.query += action.text;
            return true;
        }

        return false;
    }
}

export class SelectionMode implements Mode {
    selectedRecord?: Record;

    processAction(action: Action): boolean {
        throw new Error('Method not implemented.');
    }
}

export default Mode;
