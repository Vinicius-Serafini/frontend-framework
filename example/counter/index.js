import { computed, elements, observableOf } from "../../framework/index.js";
const { h1, div, p, button } = elements;

const root = document.getElementById('app');

const App = () => {
  const count = observableOf(0);

  const counterClass = computed(() => {
    if (count.get() < 0) {
      return 'counter--danger';
    }

    if (count.get() > 0) {
      return 'counter--success';
    }

    return 'counter--neutral';
  });

  return div({
    class: 'counter'
  },
    h1({ class: 'counter__title' }, "Counter"),
    p({
      class: ['counter__count', counterClass],
    }, 'Count: ', count),
    div({ class: 'counter__buttons' }, [
      button({
        onclick: () => count.update((x) => x + 1),
        class: 'counter__button counter__button--success'
      }, '👆'),
      button({
        onclick: () => count.update((x) => x - 1),
        class: 'counter__button counter__button--danger'
      }, '👇'),
    ])
  );
}

root.append(App());
