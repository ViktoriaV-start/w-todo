import {FORM_CLASS_NAME, FORM_SELECTOR} from "@/config/constants";


export class Form {
  formContainer = document.querySelector(FORM_SELECTOR);
  content = null;

  constructor(content) {
    this.content = content;
    this._render();
    this._init();
  }

  _render() {
    this.formContainer.insertAdjacentHTML('afterbegin', this._markUp());
  }

  _markUp() {
    return `
      <form class="form">
        <input class="form__input"
               type="search"
               placeholder="Новая задача"
               autofocus
        >
        <input class="form__date"
               placeholder="Дата выполнения"
               type="date"
               name="trip-start"
               min="2018-01-01"
               max="2035-12-31"
        >
        <button class="form__btn" type="submit">Сохранить</button>   
      </form>
    `;
  }

  /**
   * Получить данные формы после submit и вызвать метод addTodo экземпляра класса Content
  */
  _handleSubmit(ev) {
    let textTodo = ev.target.elements[0].value;
    let fulfilTodo = ev.target.elements[1].value;
    let createdAt = (new Date()).toISOString().split('T')[0];
    this.content.addTodo(textTodo, fulfilTodo, createdAt);
    ev.target.elements[0].value ='';
    ev.target.elements[1].value ='';
  }

  /**
   * Добавить addEventListener
   */
  _init() {
    this.formContainer.addEventListener( 'submit', ev => {
      ev.preventDefault();
      if (ev.target.classList.contains(FORM_CLASS_NAME)) {
        this._handleSubmit(ev);
      }
    });
  }
}
