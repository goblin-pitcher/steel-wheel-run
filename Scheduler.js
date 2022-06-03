class Scheduler {
  constructor(maxParallel) {
    this._maxParallel = maxParallel;
    this._activeTaskSt = new Set();
    this._taskList = [];
  }
  get _isWaiting() {
    return this._activeTaskSt.size >= this._maxParallel;
  }

  async add(task) {
    const rst = await this._execTask(task);
    return rst;
  }
  _getNextTask() {
    if (this._taskList.length) return this._taskList.shift();
    return null;
  }
  _getDecoTask(task, callback) {
    const promisifyTask = async () => {
      const res = await task();
      callback(res);
    };
    return promisifyTask;
  }
  _execTask(task) {
    return new Promise((resolve) => {
      const decoTask = this._getDecoTask(task, resolve);
      if (this._isWaiting) {
        this._taskList.push(decoTask);
        return;
      }
      const p = decoTask();
      this._activeTaskSt.add(p);
      p.then(() => {
        this._activeTaskSt.delete(p);
        const nextTask = this._getNextTask();
        if (nextTask) {
          this._execTask(nextTask);
        }
      });
    });
  }
}

// test
const sleep = (time) => new Promise(resolve => {
  setTimeout(resolve, time)
})
const scheduler = new Scheduler(2)
const addTask = (time, order) => {
  const result = scheduler.add(() => sleep(time))
  result.then(() => console.log(order + 'order'))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')