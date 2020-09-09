const RENDER_TO_DOM = Symbol("render to dom")

// 希望像 react 一样调用 render 方法
export class Component {
  constructor() {
    // 初始化变量，沿用 react 的 props
    this.props = Object.create(null);
    this.children = [];
    // 获取组件的 root
    this._root = null;
    // range
    this._range = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  // 插入子节点
  appendChild(component) {
    this.children.push(component)
  }

  // 渲染
  [RENDER_TO_DOM](range) {
    this._range = range; // 记录当前组件的节点 range
    this.render()[RENDER_TO_DOM](range)
  }

  // 重新渲染
  // ps：此处逻辑不用太纠结，后面都会改
  rerender() {
    // 获取旧的 range
    const oldRange = this._range;

    // 添加新内容
    const range = document.createRange();
    range.setStart(oldRange.startContainer, oldRange.startOffset)
    range.setEnd(oldRange.startContainer, oldRange.startOffset)
    this[RENDER_TO_DOM](range);

    // 删除所有旧的内容
    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents();
  }

  // setState
  setState(newState) {
    // 判断老 state 是否是 null 或非对象
    if (this.state === null || typeof this.state !== "object") {
      this.state = newState;
      this.rerender();
      return;
    }
    let merge = (oldState, newState) => {
      // 递归合并对象，只替换 newState 中的成员
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== "object") {
          oldState[p] = newState[p];
        } else {
          merge(oldState[p], newState[p]);
        }
      }
    }
    merge(this.state, newState)
    // 自动重新渲染
    this.rerender();
  }

}

// 节点
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    // 处理 onXXX 事件
    if (name.match(/^on([\s\S]+)/)) {
      // 处理首字母大写的情况
      this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
    } else if (name === "className") {
      this.root.setAttribute("class", value);
    } else {
      this.root.setAttribute(name, value)
    }
  }

  // 插入子组件
  // 用 range 替换 component.root
  appendChild(component) {
    let range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length); // 从第一到最后一个节点
    range.setEnd(this.root, this.root.childNodes.length);
    component[RENDER_TO_DOM](range)
  }

  // 更新
  [RENDER_TO_DOM](range) {
    range.deleteContents(); // 先删除，后更新
    range.insertNode(this.root)
  }
}

// 普通文本节点
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }

  // 更新
  [RENDER_TO_DOM](range) {
    range.deleteContents(); // 先删除，后更新
    range.insertNode(this.root)
  }
}

// 创建原生节点 or 组件
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
  // 遍历子节点 []，并添加
  const insertChild = function (childNodes) {
    for (let child of childNodes) {
      if (typeof child === "string") {
        // 如果传入子节点是文本，则创建文本节点 
        child = new TextWrapper(child);
      }
      if (child === null) {
        // child 为 null 的特殊情况，忽略该节点
        continue;
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

// 把整个 parentElement 替换掉
export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0); // 从第一道最后一个节点
  // 存在文本节点、注释节点，所以需要用 childNodes 不是 chidren
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range)
}