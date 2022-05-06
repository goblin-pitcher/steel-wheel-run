// 目标:::
// function App() {
//   const [num, updateNum] = useState(0);
//   return {
//     click() {
//       updateNum(num=>num+1);
//       updateNum(num=>num+1);
//       updateNum(num=>num+1);
//     }
//   }
// }

// 拆分下来，首先需要实现一个useState
// interface IUseState<T> {
//   (state: T): [T, (T)=>T]
// }
// template::
// function useState(state) {
//   ......
//   return [state, updateState]
// }

// 我们已知react中各个节点的状态存储在fiber中，假设初始fiber状态如下：

// interface IBaseFiber {
//   memorizedState: IHook,
//   startNode: FunctionalComponent,
//   [otherProps: string]: any
// }

// 假设某个fiber节点结构如下
const fiberNode = {
  memorizedState: null,
  startNode: App,
  isMounted: false,
  workInProgressHook: null,
};

const genUseState = (fiber) => (state) => {
  const { isMounted } = fiber;
  if (!isMounted) {
    fiberHookInit(fiber, state);
  } else {
    handleHookUpdates(fiber);
  }
  return [state, updateState];
};

// => 相关内容实现
// hook初始化，并将其挂载在fiber上，首先先确定一下hook的数据结构：
// interface IHook<T> {
//    // 存储的状态
//   memorizedState: T;
//   queue: {
//     pending: IUpdate
//   };
//   next: IHook<T>
// }

// 准备开发fiberHookInit之前，我们需要意识到以下几个关键点：
// 1. 这个init不止会运行一次，因为一个函数式组件中会用到多次useState,我们需要根据useState使用的顺序，生成一个hook的调用链挂载到fiber上.
// 2. pending上挂载的update何时生成？以App函数为例，我们执行App()时，其return的内容不会在此时执行，也就是说obj = App(),
//    只有obj.click时，才会调用update方法，fiberHookInit是执行App()时运行的，因此此时暂且不管pending, update方法中再更新pending
function getLastNode(linkList) {
  let rtn = linkList;
  while (rtn.next) {
    rtn = rtn.next;
  }
  return rtn;
}

function fiberHookInit(fiber, state) {
  const hookTemp = {
    memorizedState: state,
    queue: { pending: null },
    next: null,
  };
  if (!fiber.memorizedState) {
    fiber.memorizedState = hookTemp;
  } else {
    const lastNode = getLastNode(fiber);
    lastNode.next = hookTemp;
  }
}
// 首先需要明确该方法是在isMounted为true时执行，isMounted为true表示组件执行uodate，那么组件何时执行update？
// 还是以App为例，假设obj = App(), 明显是执行obj.click，触发了update方法才会更新组件。
// 既然是触发了update方法，那么我们暂且假设我们已经实现了hook.queue.pending，也就是update。
// 执行hooks中的内容，执行的是什么？
// 既然是触发了update，那我们执行的应该就是update参数中的方法
// 我们需要知道queue.pending的数据结构是环状链表，原因暂时不知道。。update数据结构如下
// interface IUpdate<T> {
//   action: (state: T)=>T,
//   next: IUpdate<T>
// }

function handleHookUpdates(fiber) {
  const { workInProgressHook: hook } = fiber;
  // 执行update链
  if (hook.queue.pending) {
    let update = hook.queue.pending;
    const head = update;
    let { memorizedState: state } = hook;
    do {
      state = update.action(state);
      update = update.next;
    } while (head !== update);
    hook.memorizedState = state;
  }
  fiber.workInProgressHook = hook.next;
}
// 生成update的方法，触发App更新
function dispatchAction(fiber, ) {

}
