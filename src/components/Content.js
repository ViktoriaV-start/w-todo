import {
  CONTENT_SELECTOR,
  CONTROL_BTNS_SELECTOR,
  INITIAL_TODO_ARRAY,
  TODO_SELECTOR,
  CONTENT_HEADER_SELECTOR,
  CONTENT_TEXT_CLASS,
  CONTENT_DATE_CLASS,
  DELETE_CLASS_NAME,
  CHECKBOX_CLASS_NAME
} from "@/config/constants";
import { Todo } from "@models/Todo";
import { controlButtons } from "@/components/controlButtons";
import { ContentHeader } from "@/components/ContentHeader";
import { SW } from "@/SW";


export class Content {

  contentContainer = document.querySelector(CONTENT_SELECTOR);
  sortingAsc = true;
  todos = [];

  constructor() {

    // Вызвать ф-ции получения списка задач, рендера кнопок, заголовков, установки слушателей событий и запуска Service Workers
    this._getTodos();
    this._renderBtns();
    this._renderContentHeader();

    this._init();
    this.notification = new SW(this.todos);
  }

/**
 * Получить данные из localStorage, распарсить и передать дальше.
 * Если хранилище пустое - поместить начальный вариант
 */
  _getTodos() {
    let data = localStorage.getItem('todos');

    if (!data) {
      localStorage.setItem('todos', JSON.stringify(INITIAL_TODO_ARRAY));
      data = localStorage.getItem('todos');
    }

    this._handleData(JSON.parse(data));
  }

/**
 * Получить массив заметок, создать newTodo для каждого элемента и поместить в массив this.todos, вызвать рендер
 */
  _handleData(data) {
    data.map(item => {
      this.todos.push(new Todo(item));
    });
    this._render();
  }

  /**
   * Рендер кнопок
   */
  _renderBtns() {
    this.contentContainer.insertAdjacentHTML('afterbegin', controlButtons);
  }

  /**
   * Рендер заголовков контента (списка задач)
   */
  _renderContentHeader() {
    document.querySelector(CONTROL_BTNS_SELECTOR).insertAdjacentHTML('afterend', (new ContentHeader).getContentHeader());
  }

  /**
   * Рендер списка задач
   */
  _render() {
    for (let item of this.todos) {
      if(item.rendered) {
        continue;
      }
      this.contentContainer.insertAdjacentHTML('beforeend', item.markUp(this.todos.indexOf(item)));
    }
  }

/**
 * Рендер заметки в конце списка заметок
 */
  _renderBottom(todo) {
    if(!todo.rendered) {
      this.contentContainer.insertAdjacentHTML('beforeend', todo.markUp(this.todos.indexOf(todo)));
    }
  }

  /**
   * Рендер заметки в начале списка заметок 
  */
  _renderTop(todo) {
    if(!todo.rendered) {
      document.querySelector(CONTENT_HEADER_SELECTOR).insertAdjacentHTML('afterend', todo.markUp(todo));
    }
  }

/**
 * Удалить разметку одной заметки по id
 */
  _removeMarkUp(id) {
    this._getOneTodo(id).rendered = false;
    document.querySelector(`${TODO_SELECTOR}[data-id="${id}"]`).remove();
  }

/**
 * Найти в this.todos item по id и вернуть
 */
  _getOneTodo(id) {
    return this.todos.find(el => el.id === id);
  }

/**
 * Сохранить в localStorage
 */
  _setTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  _deleteTodo(ev) {
    const id = +ev.target.dataset['id'];
    this._removeMarkUp(id);
    const todo = this._getOneTodo(id);
    this.todos.splice(this.todos.indexOf(todo), 1);
    this._setTodos();
    console.log('Todo was deleted');
  }

  _updateTodoComplete(ev) {
    const id = +ev.target.dataset['id'];
    const todo = this._getOneTodo(id);
    todo.completeTodo();
    this._removeMarkUp(id);

    this.todos = this.todos.filter(elem => elem.id !== todo.id);

    if(todo.completed) {
      this.todos.push(todo);
      this._renderBottom(todo);
    } else {
      this.todos.unshift(todo);
      this._renderTop(todo);
    }
    this._setTodos();
  }

    /**
   * Обновить текст и сохранить
   * @param {Event} ev 
   */
  _updateTodoText(ev) {
    let newText = ev.target.value;
    const id = +ev.target.dataset['id'];
    const todo = this._getOneTodo(id);
    todo.updateText(newText);
    this._setTodos();
  }


  /**
   * Обновить дату выполнения и сохранить
   * @param {Event} ev 
   */
  _updateTodoDate(ev) {
    let newDate = ev.target.value;
    const id = +ev.target.dataset['id'];
    const todo = this._getOneTodo(id);
    todo.updateDate(newDate);
    this._setTodos();
  }

  _deleteLast() {
    this._removeMarkUp(this.todos[this.todos.length-1].id);
    this.todos.pop();
    this._setTodos();
    console.log('Todo was deleted');
  }

  _deleteFirst() {
    this._removeMarkUp(this.todos[0].id);
    this.todos.shift();
    this._setTodos();
    console.log('Todo was deleted');
  }

  /**
   * Добавить новую заметку
   */
  addTodo(text, fulfil, createdAt) {
    const newTodo = new Todo({
      id: this._getMaxId()+1,
      todoText: text,
      completed: false,
      fulfil: fulfil,
      created: createdAt
    });
    this.todos.unshift(newTodo);
    this._renderTop(newTodo);
    this._setTodos();
  }

  /**
   * Получить максимальный ID в списке задач
   * @returns {number}
   */
  _getMaxId() {
    const id = this.todos.reduce((acc, item) => acc > item.id ? acc : item.id, 0);
    return(+id);
  }

  _sortDate(column) {
    const customSort = (a, b) => a > b ? 1 : -1;
    this.todos.sort((a, b) => {

      if (this.sortingAsc) {
        return customSort(a[column], b[column]);
      } else {
        return customSort(b[column], a[column]);
      }
    });
    this.sortingAsc = !this.sortingAsc;


    for (let item of this.todos) {
      this._removeMarkUp(item.id);
    }
    this._render(this.todos);
  }

/**
 * Добавить addEventListener
 */
  _init() {
    this.contentContainer.addEventListener('click', ev => {

      // Событие для сортировки по дате исполнения
      if (ev.target.getAttribute('data-name') == 'created') {
        this._sortDate('created');
      }

      // Событие для сортировки по дате создания заметки
      if (ev.target.getAttribute('data-name') == 'fulfil') {
        this._sortDate('fulfil');
      }

      // Слушать событие клика на кнопку удаления задачи
      if (ev.target.classList.contains(DELETE_CLASS_NAME)) {
        this._deleteTodo(ev);
      }

      // Слушать событие клика на кнопку выполнения задачи
      if (ev.target.classList.contains(CHECKBOX_CLASS_NAME)) {
        this._updateTodoComplete(ev);
      }

      // Слушать событие клика на кнопку удаления последней задачи
      if (ev.target.getAttribute('data-role') === 'delete-last') {
        this._deleteLast();
      }

      // Слушать событие клика на кнопку удаления первой задачи в списке
      if (ev.target.getAttribute('data-role') === 'delete-first') {
        this._deleteFirst();
      }

    });

    // Слушать событие изменения текста и даты исполнения в списке задач и
    // вызвать ф-цию сохранения
    this.contentContainer.addEventListener( 'change', ev => {

      if (ev.target.classList.contains(CONTENT_TEXT_CLASS)) {
        this._updateTodoText(ev);
      }

      if (ev.target.classList.contains(CONTENT_DATE_CLASS)) {
        this._updateTodoDate(ev);
      }

    });
  }
}
