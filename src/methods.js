// Data layer + rendering
export default class Display {
  static KEY = 'LocalDataList';

  static getAll() {
    try {
      const raw = localStorage.getItem(Display.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  static save(list) {
    localStorage.setItem(Display.KEY, JSON.stringify(list));
  }

  static add(description) {
    const list = Display.getAll();
    const item = {
      description: description.trim(),
      completed: false,
      index: list.length ? Math.max(...list.map(t => t.index)) + 1 : 1,
    };
    list.push(item);
    Display.save(list);
    return item;
  }

  static update(index, patch) {
    const list = Display.getAll();
    const i = list.findIndex(t => t.index === index);
    if (i === -1) return;
    list[i] = { ...list[i], ...patch };
    Display.save(list);
  }

  static remove(index) {
    let list = Display.getAll();
    list = list.filter(t => t.index !== index);
    // reindex to keep order compact
    list = list.map((t, i) => ({ ...t, index: i + 1 }));
    Display.save(list);
  }

  static clearCompleted() {
    let list = Display.getAll();
    list = list.filter(t => !t.completed).map((t, i) => ({ ...t, index: i + 1 }));
    Display.save(list);
  }
}
