### 关于深拷贝

深拷贝要点如下：

+ 为防止循环引用，应利用weakMap缓存已拷贝的对象
+ 拷贝对象类型未知，可能是class，因此根据其constructor new一个对象
+ 创建完对象后，应在递归前将其放入weakMap，避免死循环
+ 应用Object.getOwnPropertyDescriptors或Object.getOwnPropertyNames获取对象的key，避免enumerable为false，以及原型链上自己定义的对象无法拷贝

其他次要要点：

+ Object.getOwnPropertyDescriptors获取对象状态后，对其状态的拷贝
+ 对于时间对象，创建对象的方式为`new value.constructor(value)`
+ .....



#### 关于迭代实现

借助`{ parent: null, key: null, value: data }`的数据结构，可不必关心遍历的顺序