class Scheduler {
  constructor(maxParallel) {
      this.max = maxParallel
      this._active = new Set();
      this._cache = []
  }
  add(task) {
      return new Promise(resolve=>{
          const decoFunc = async () => {
              const res = await task()
              resolve(res)
          }
          this._addCache(decoFunc)
      })
  }
  _addCache(decoTask){
      this._cache.push(decoTask);
      this._notify()
  }
  _notify(){
      if(!this._cache.length || this._active.size>=this.max) return;
      const task = this._cache.shift();
      const addTask = task().then(()=>{
          this._active.delete(addTask)
          this._notify()
      })
      this._active.add(addTask)
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