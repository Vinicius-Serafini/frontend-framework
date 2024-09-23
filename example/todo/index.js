import { addReactiveElement, computed, elements, mapReactiveElement, observableOf } from "../../framework/index.js";
import { ObservableOf } from "../../framework/reactive-system/entities.js";
const { h1, div, p, button, ul, li, input, dialog, form, textarea, label } = elements;

/**
 * 
 * @typedef {Object} Todo
 * @property {string} title
 * @property {string} description
 */

/** 
 * @param {Todo} todo
 * @param {{ onDelete: () => void }}
 */
const TodoCard = (todo, {
  onDelete
}) => {
  return div({
    class: 'todo-card',
  }, [
    button({
      class: 'todo-card__delete',
      onclick: () => {
        onDelete(todo);
      }
    }, 'X'),
    p({
      class: 'todo-card__title',
    }, todo.title),
    p({
      class: 'todo-card__description',
    }, todo.description),
  ])
}

/**
 * 
 * @param {ObservableOf<Todo[]>} todos 
 * 
 * @param {{ onDelete: (todo: Todo) => void }}
 * @returns 
 */
const TodoList = (todos, {
  onDelete
}) => {
  const hasElements = computed(() => {
    return todos.get().length > 0
  });

  return addReactiveElement(hasElements, (hasElements) => {
    if (!hasElements) {
      return p({
        class: 'todo-list__empty'
      }, 'Nenhum item encontrado');
    }

    return mapReactiveElement(ul({
      class: 'todo__list',
    }), todos, (todo) => {
      return li({
        class: 'todo__item',
      }, TodoCard(todo, {
        onDelete
      }));
    });
  })
}

const App = () => {
  const todos = observableOf([{
    id: 1,
    title: 'Todo 1',
    description: 'Descrição do todo 1'
  }, {
    id: 2,
    title: 'Todo 2',
    description: 'Descrição do todo 2'
  },
  {
    id: 3,
    title: 'Todo 2',
    description: 'Descrição do todo 2'
  }]);

  const todoSearch = observableOf('');

  const filteredTodos = computed(() => {
    return todos.get().filter((todo) => {
      return todo.title.toLowerCase().includes(todoSearch.get().toLowerCase());
    });
  });

  /** 
   * @param {Todo} todo
   */
  const onAddTodo = (todo) => {
    todos.update((todos) => {
      return [...todos, todo];
    })
  }

  const todoDialog = TodoDialog({ onAddTodo });

  return div({
    class: 'container'
  }, [
    h1({
      class: 'title'
    }, 'Todo List'),
    input({
      class: 'todo-search',
      oninput: (event) => {
        todoSearch.update(event.target.value);
      }
    }),
    TodoList(filteredTodos, {
      onDelete: (todo) => {
        todos.update((todos) => {
          return todos.filter((t) => t.id !== todo.id);
        })
      }
    }),
    button({
      class: 'todo-create-fab',
      onclick: () => {
        todoDialog.showModal();
      }
    }, '+'),
    todoDialog
  ])
}

/**
 * @param {{onAddTodo: (todo: Todo) => void}} params
 */
const TodoDialog = ({ onAddTodo }) => {
  const dialogDom = dialog({
    id: 'todo-dialog',
    class: 'todo-dialog',
  }, [
    form({
      class: 'todo-dialog__form',
      id: 'todo-dialog__form',
      onsubmit: (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const title = formData.get('todo-title');
        const description = formData.get('todo-description');

        onAddTodo({
          title: title,
          description: description,
          id: Date.now(),
        });

        event.target.reset();

        dialogDom.close();
      }
    }, [
      label({
        for: 'todo-title',
        class: 'todo-dialog__form-label',
      }, 'Title'),
      input({
        id: 'todo-title',
        class: 'todo-dialog__form-input',
        type: 'text',
        name: 'todo-title',
        required: true,
        autocomplete: 'off',
      }),
      label({
        for: 'todo-description',
        class: 'todo-dialog__form-label',
      }, 'Description'),
      textarea({
        id: 'todo-description',
        class: 'todo-dialog__form-input',
        name: 'todo-description',
        required: true,
        autocomplete: 'off',
      }),
      button({
        type: 'submit',
        class: 'todo-dialog__form-button',
      }, 'Add'),
    ]),
    button({
      class: 'todo-dialog__close',
      type: 'button',
      onclick: () => {
        dialogDom.close();
      }
    }, 'X'),
  ]);

  return dialogDom;
}

const root = document.getElementById('app');
root.append(App());
