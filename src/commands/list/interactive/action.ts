export interface Key {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}

export enum ActionType {
    Abort,
    Delete,
    Down,
    Exit,
    Submit,
    Text,
    Up,
}

export type Action =
    | {
          type:
              | ActionType.Abort
              | ActionType.Delete
              | ActionType.Down
              | ActionType.Exit
              | ActionType.Submit
              | ActionType.Up;
      }
    | { type: ActionType.Text; text: string };

const getAction = (data: string, key: Key): Action => {
    if (key.ctrl) {
        if (key.name === 'c') return { type: ActionType.Abort };
    }

    if (key.name === 'return') return { type: ActionType.Submit };
    if (key.name === 'enter') return { type: ActionType.Submit };
    if (key.name === 'backspace') return { type: ActionType.Delete };
    if (key.name === 'escape') return { type: ActionType.Exit };
    if (key.name === 'up') return { type: ActionType.Up };
    if (key.name === 'down') return { type: ActionType.Down };

    return { type: ActionType.Text, text: data };
};

export default getAction;
