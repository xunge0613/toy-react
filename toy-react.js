// 希望像 react 一样调用 render 方法
export class Component {
  constructor() {
    // 初始化变量，沿用 react 
    this.props = Object.create(null);
    this.children = [];
    // 获取组件的 root
    this._root = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  // 插入子节点
  appendChild(component) {
    this.children.push(component)
  }

  // 真实的渲染过程

  get root() {
    if (!this._root) {
      // 递归调用直到节点是原生节点或文本节点
      console.log(this, this.render)
      // 希望像 react 一样调用 render 方法
      this._root = this.render().root;
    }
    return this._root;
  }
}

// 节点
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }

  // 插入子组件
  appendChild(component) {
    this.root.appendChild(component.root)
  }
}

// 普通文本节点
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
}

export function createElement(type, attributes, ...children) {
  let e;
  console.log("createElement", type, children)
  if (typeof type === "string") {
    // 原生子节点
    e = new ElementWrapper(type);
  } else {
    // 组件
    e = new type;
  }

  // 遍历属性 obj，设置
  for (let p in attributes) {
    e.setAttribute(p, attributes[p]);
  }
  // 遍历子节点 []，添加

  const insertChild = function (childNodes) {
    for (let child of childNodes) {
      if (typeof child === "string") {
        // 如果传入子节点是文本，则创建文本节点 
        child = new TextWrapper(child);
      }
      // 传入子节点数组 eg:children
      if (typeof child === "object" && child instanceof Array) {
        // 递归调用子组件
        insertChild(child);
      } else {
        e.appendChild(child);
      }

    }
  }
  insertChild(children)
  return e
}

// 实 dom
export function render(component, parentElement) {
  parentElement.appendChild(component.root)
}