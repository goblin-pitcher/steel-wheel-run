## this指向问题

> 基础定义类的东西最好还是查看正规文档，网上文章有诸多错误，容易误导人

### this指向相关定义

这里主要讨论function函数和箭头函数的this相关定义：

+ function函数，参考[mdn官方文档(this)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
  + 在绝大多数情况下，函数的调用方式决定了 `this` 的值（**运行时绑定**）。
  + `this` 不能在执行期间被赋值，并且在每次函数被调用时 `this` 的值也可能会不同。
+ 箭头函数，参考[mdn官方文档(箭头函数)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
  + 箭头函数不会创建自己的`this`，它只会从自己的作用域链的上一层继承 `this`



### 如何理解

#### 箭头函数的this

理解箭头函数的`this`，最好的方式是查看`babel`是如何对其进行转义的，示例如下：

原代码：

```javascript
const name = 'a'
const obj = {
  name: 'b',
  f: ()=> {
  	console.log(this.name)
  },
  f0(){
	return ()=>{
    	console.log(this.name)
    }
  }
}
```

转义为es5的代码：

```javascript
var _this = void 0;
var name = 'a';
var obj = {
  name: 'b',
  f: function f() {
    console.log(_this.name);
  },
  f0: function f0() {
    var _this2 = this;
    return function () {
      console.log(_this2.name);
    };
  }
};
```

可以发现，箭头函数的转义，即是在其所在**上层作用域**中定义`_this`对象，再将箭头函数内部`this`替换为`_this`。

结合箭头函数`this`的定义，**箭头函数不会创建自己的`this`，它只会从自己的作用域链的上一层继承 `this`**，我们可以不把箭头函数中的this当作一个普通对象，例如将上述代码改成如下写法

```javascript
const _context = void 0;
const name = 'a';
const obj = {
  name: 'b',
  f: function f() {
    console.log(_this.name);
  },
  f0: function f0() {
    const _context = this;
    return function () {
      console.log(_context.name);
    };
  }
};
obj.f0()() // 输出b
obj.f0.call({name: 123})() // 输出123
```

将箭头函数转义成上述es5写法，同样可正确实现其效果，这样**箭头函数this指向**问题就变成了一个**闭包问题**

对于`obj.f0()()`，当执行`obj.f0()`时，会将给`_context`赋值`obj`对象，执行箭头函数时，先从其作用域链中获取`_context`，再打印`_context.name`，因此输出`obj.name`，即`b`
`obj.f0.call({name: 123})()`输出123也是同理



#### function函数的this

如文档定义所说，function函数的this在**运行时绑定**，常规情况下很容易理解，例子如下

```javascript
const name = 'a'
const obj = {
  name: 'b',
  c: {
    name: 'c',
    f(){
    	console.log(this.name)
    }
  }
}
obj.c.f() // f运行时，绑定运行环境obj.c，输出c
const f = obj.c.f
f() // 运行时，绑定运行环境global，输出a
```

常规情况，例如<span style="color: red">obj.c</span>.f()，我们将f前面的对象作为运行环境(标红部分)，前面没有就将运行环境视为global。

##### 易错例子

```javascript
const name = 'a'
const obj = {
  name: 'b',
  c: {
    name: 'c',
    f(){
      return function() {
        console.log(this.name)
      }
    }
  }
}
obj.c.f()() // 输出a
obj.c.f.call({name: 'xxx'})() // 输出a
```

这个例子最容易迷惑的地方是，`obj.c.f()`生成了一个function，生成的function会不会以`obj.c.f`或`obj.c`作为运行时的环境，继而输出对应name。

##### 个人见解

function函数的this在**运行时绑定**，我们不妨将一个function函数的执行分成两部：

1. 查找其运行环境，绑定this
2. 执行函数

按上述理解，`obj.c.f()`的执行用代码表述，结果如下

```javascript
// obj.c.f()
const env = obj.c
const func = obj.c.f
func.call(env)
```

按照此思路，再看`obj.c.f()()`的执行。首先，所有运算都有各自的**优先级**，例如

```javascript
const a = 1;
console.log(a||3+1) // 输出a的结果，即1
```

对于`a||3+1`，加法优先级高于或，即先执行了`3+1`，再执行`a||4`，a为真，即输出a的值

同理，对于`obj.c.f()()`，可看作如此结构`(obj.c.f())()`，将`(obj.c.f())`看作一整个方法，当`(obj.c.f())()`执行时，`(obj.c.f())`前面没有环境，因此`(obj.c.f())()`执行环境为global。转换成代码如下

```javascript
// obj.c.f()()
// 首先执行了(obj.c.f())，生成了一个function
// 开始查找(obj.c.f())的执行环境，可以看到(obj.c.f())前面没有任何内容，因此环境为global
const env = global
(obj.c.f()).call(env)
```

##### 回头再看箭头函数

利用babel转义的代码理解箭头函数，无疑不会出问题。但还是以箭头函数定义去理解一下。

箭头函数不会创建自己的`this`，它只会从自己的作用域链的上一层继承 `this`。结合定义，按照上面的分析方式分析以下代码

```javascript
const name = 'a'
const obj = {
  name: 'b',
  f(){
    return ()=>{
    	console.log(this.name)
    }
  }
}
/**
 * 原本式子obj.f()()，分析如下：
 * const env0 = obj;
 * const f0 = obj.f
 * const f1 = f0.call(env0)
 * // f1为箭头函数，因此其作用域使用其上一层
 * const env1 = env0
 * f1.call(env1) // 输出obj.name, 即b
 */
obj.f()() // b
```



### 综合练习

结合上述对于function函数和箭头函数this指向的理解，解析一下多层嵌套函数的输出（注释为辅助分析内容）

```javascript
const name = 'a'
const obj = {
  name: 'b',
  c: {
    name: 'c',
    f(){
      console.log('==>0::', this.name)
      return function() {
        // const _context = this
        console.log('==>1::', this.name)
        return () =>{
          // 将其视作普通函数后，打印 _context.name
          console.log('==>2::', this.name)
          return function(){
      	    // const _context = this
            console.log('==>3::', this.name)
            return () => {
              // 将其视作普通函数后，打印 _context.name
              console.log('==>4::', this.name)
            }
          }
        }
      }
    }
  }
}
/**
 * 原始式子为obj.c.f()()()()(), 解析如下：
 * const env0 = obj.c
 * const f0 = obj.c.f
 * // 式子优化为(f0.call(env0))()()()()
 * const f1 = f0.call(env0) // 输出 ==>0::c
 * const env1 = global
 * // 式子优化为(f1.call(env1))()()()
 * const f2 = f1.call(env1) // 输出 ==>1::a
 * let _context = env1 // f2为箭头函数，因此_context赋值父级环境env1
 * const env2 = _context;
 * // 式子优化为(f2.call(env2))()()
 * const f3 = f2.call(env2) // _context==env1==global, 输出 ==>2::a
 * const env3 = global;
 * // 式子优化为(f3.call(env3))()
 * const f4 = f3.call(env3) // 输出 ==>3::a
 * _context = env3
 * const env4 = _context;
 * f4.call(env4) // _context==env1==global, 输出 ==>4::a
 * 
 * 总结，输出如下：
 * ==>0::c
 * ==>1::a
 * ==>2::a
 * ==>3::a
 * ==>4::a
 */
obj.c.f()()()()()
/**
 * 原始式子为obj.c.f().call({name: 1})()()(), 解析如下：
 * const env0 = obj.c
 * const f0 = obj.c.f
 * // 式子优化为(f0.call(env0)).call({name: 1})()()()
 * const f1 = f0.call(env0) // 输出 ==>0::c
 * const env1 = {name: 1}
 * // 式子优化为(f1.call(env1))()()()
 * const f2 = f1.call(env1) // 输出 ==>1::1
 * let _context = env1 // f2为箭头函数，因此_context赋值父级环境env1
 * const env2 = _context;
 * // 式子优化为(f2.call(env2))()()
 * const f3 = f2.call(env2) // _context==env1=={name: 1}, 输出 ==>2::1
 * const env3 = global;
 * // 式子优化为(f3.call(env3))()
 * const f4 = f3.call(env3) // 输出 ==>3::a
 * _context = env3
 * const env4 = _context;
 * f4.call(env4) // _context==env1==global, 输出 ==>4::a
 * 
 * 总结，输出如下：
 * ==>0::c
 * ==>1::1
 * ==>2::1
 * ==>3::a
 * ==>4::a
 */
obj.c.f().call({name: 1})()()()
/**
 * 原始式子为obj.c.f.call().call({name: 1}).call({name:2}).call({name: 3})(), 解析如下：
 * const env0 = global // call没参数，视作global
 * const f0 = obj.c.f
 * // 式子优化为(f0.call(env0)).call({name: 1}).call({name:2}).call({name: 3})()
 * const f1 = f0.call(env0) // 输出 ==>0::a
 * const env1 = {name: 1}
 * // 式子优化为(f1.call(env1)).call({name:2}).call({name: 3})()
 * const f2 = f1.call(env1) // 输出 ==>1::1
 * let _context = env1 // f2为箭头函数，因此_context赋值父级环境env1
 * // 注意这里，即使执行.call({name: 2}), env2仍是_context，因为箭头函数中this替换成了_context
 * const env2 = _context;
 * // 式子优化为(f2.call(env2)).call({name: 3})()
 * const f3 = f2.call(env2) // _context==env1=={name: 1}, 输出 ==>2::1
 * const env3 = {name: 3};
 * // 式子优化为(f3.call(env3)).call(env3)()
 * const f4 = f3.call(env3) // 输出 ==>3::3
 * _context = env3
 * const env4 = _context;
 * f4.call(env4) // _context==env1==global, 输出 ==>4::3
 * 
 * 总结，输出如下：
 * ==>0::a
 * ==>1::1
 * ==>2::1
 * ==>3::3
 * ==>4::3
 */
obj.c.f.call().call({name: 1}).call({name:2}).call({name: 3})()
```

以上内容先写的分析，再在浏览器中运行，结果正确。按照此思路一步步分析，即使嵌套再复杂，也能一步步分析出对应的结果。