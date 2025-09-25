import Display from './methods.js';

export default class Interactive {
  static toggleCompleted(index, completed) {
    Display.update(index, { completed });
    window.dispatchEvent(new CustomEvent('todos:updated'));
  }

  static clearCompleted() {
    Display.clearCompleted();
    window.dispatchEvent(new CustomEvent('todos:updated'));
  }
}
