import { INPUT_SELECTOR, TODO_SELECTOR } from "@/config/constants";

export class Todo {
  rendered = false;

  constructor(item) {
    this.todoText = this._checkInput(item.todoText);
    this.id = item.id;
    this.completed = item.completed;
    this.fulfil = item.fulfil;
    this.created = item.created;
  }

  completeTodo() {
    this.completed = !this.completed;
    const todo = document.querySelector(`${TODO_SELECTOR}[data-id="${this.id}"]`);
    const input = document.querySelector(`${INPUT_SELECTOR}[data-id="${this.id}"]`);

    if(this.completed) {
      input.classList.add('bggray', 'line');
      todo.classList.add('bggray');
      this.rendered = false;
    } else {
      input.classList.remove('bggray', 'line');
      todo.classList.remove('bggray');
    }
  }

  updateText(text) {
    this.todoText = this._checkInput(text);
  }

  updateDate(date) {
    this.fulfil = this._checkInput(date);
  }

  /**
   * Проверка полученного из инпута текста
   * @param {string} value 
   * @returns {string}
   */
  _checkInput(value) {
    let checkedValue = value.trim().slice(0, 255);
    if(!checkedValue) return checkedValue = '';

    checkedValue = checkedValue.replace(/[><]/g, '');
    checkedValue = checkedValue.replace(/script/g, '');
    return(checkedValue);
  }

  /**
   * Проверка полученной из инпута даты: не больше 10 символов, 
   * соответствие паттерну ЧЧЧЧ-ЧЧ-ЧЧ
   * @param {string} value 
   * @returns 
   */
  _checkDate(value) {
    let checkedValue = value.trim().slice(0, 10);
    if(!checkedValue) return checkedValue = '';
    if (/^(0-9){4}-(0-9){2}-(0-9){2}$/.test(checkedValue)) {
      return checkedValue;
    } else {
      return '';
    }
  }

  /**
   * Преобразовать строку с датой из вида 2023-11-25 => 25.11.25
   * @param {string} date 
   * @returns {string}
   */
  formatDate(date) {
    let arr = date.split('-');
    return arr[2] + '.' + arr[1] + '.' + arr[0];
  }


  /**
   * Разметка для одной задачи
   * @returns {string}
   */
  markUp() {

    this.rendered = true;
    return `

      <div class="${this.completed ? "content__item bggray" : "content__item"}"
           data-id="${this.id}"
      >
      
        <label class="content__label">
          <input type="checkbox"
              data-id="${this.id}"
              class="content__checkbox"
              ${this.completed ? 'checked' : '' }
          >
          <div class="fake-chb"></div>
        </label>

        <div>${this.formatDate(this.created)}</div>
        <form class="content__form" type="submit" data-id="${this.id}">
        <input
               class="${this.completed ? "content__text bggray line" : "content__text"}"
               data-id="${this.id}"
               value="${this.todoText}"
               type="text"
        >
        </form>

        <input class="content__date"
               value="${this.fulfil}"
               data-id="${this.id}"
               type="date"
               name="trip-start"
               min="2018-01-01"
               max="2035-12-31"
        >

        <button class="content__btn" data-id="${this.id}">-</button>
      </div>
    `;
  }
}
