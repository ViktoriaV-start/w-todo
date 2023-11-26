/**
 * Service worker
 * Уведомления о задачах, дата исполнения которых совпадает с сегодняшней
 */
export class SW {

  constructor(todos) {
    this.todos = todos;

    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      console.warn("Браузер не поддерживает уведомления");
    } else if (Notification.permission === "granted") {
      // Проверка - было ли разрешение на уведомления уже получено;
      // Если да - создать уведомление
      
      this.showMessage();

    } else if (Notification.permission !== "denied") {
      // Запрос разрешения
      Notification.requestPermission().then((permission) => {
        // При положительном ответе на запрос - создать уведомление
        if (permission === "granted") {
          this.showMessage();
        }
      });
    }
  }

  /**
   * Вернуть текст заметок, дата исполнения которых совпадает с сегодняшней
   * и задача еще не отмечена как выполненная
   */
  checkTodos() {
    let currentDate = (new Date()).toISOString().split('T')[0];
    let resultArr = [];
    for (let item of this.todos) {
      if ((item.fulfil === currentDate) && !item.completed) {
        resultArr.push(item.todoText);
      }
    }
    return resultArr;
  }

  /**
   * Создать уведомление
   */
  showMessage() {
    const arr = this.checkTodos();
    let i = 0;
    let timerId = null;
    let delay = 500;

    const run = () => {
      new Promise((resolve) => {
        timerId = setTimeout(() => {
          new Notification(arr[i]);
          resolve();
        }, delay);
      }).then(() => {
        delay += 500;
        i++;
        clearTimeout(timerId);
        if (arr[i]) run(i);
      });
    }

    if (arr.length) run();
  }
}
