
export class Button {
  constructor(title) {
    this.title = title;
  }

  getBtn() {
    return `
      <button className="control__btn" type="button">${this.title}</button>
    `
  }
}