## `type-challenge`刷题

[`type-challenge`挑战地址](https://github.com/type-challenges/type-challenges/blob/main/README.zh-CN.md)

### easy

#### 一眼过的部分

```typescript
type MyPick<T, K extends keyof T> = {[k in K]: T[k]};
type MyReadonly<T> = {readonly [k in keyof T]: T[k]};
type TupleToObject<T extends readonly (string|number|symbol)[]> = {[k in T[number]]: k};
type First<T extends any[]> = T extends [infer Head, ...unknown[]] ? Head : never;
type Length<T extends readonly unknown[]> = T["length"]; // 题目要求readonly数组
type If<C extends boolean, T, F> = C extends true ? T : F;
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];
type Push<T extends unknown[], U> = [...T, U];
type Unshift<T extends unknown[], U> = [U, ...T];
type MyParameters<T extends (...args: any[]) => any> = T extends (...args: infer U) => any ? U : never;
```



#### Exclude

原题[地址](https://github.com/type-challenges/type-challenges/blob/main/questions/00043-easy-exclude/README.zh-CN.md)

```typescript
type MyExclude<T, U> = T extends U ? never : T;
```

这里有个遗漏的知识点...[分配条件类型](https://www.typescriptlang.org/zh/docs/handbook/2/conditional-types.html#%E5%88%86%E9%85%8D%E6%9D%A1%E4%BB%B6%E7%B1%BB%E5%9E%8B)

当`type`参数联合类型时，内部其实是作循环处理的。以`Exclude`为例，分配条件类型的实际处理如下

```typescript
MyExclude<'a'|'b'|'c', 'a'|'b'> = 
  ('a' extends 'a' ? never : 'a') |
  ('b' extends 'a' ? never : 'b') |
  ('c' extends 'a' ? never : 'c') |
  ('a' extends 'b' ? never : 'a') |
  ('b' extends 'b' ? never : 'b') |
  ('c' extends 'b' ? never : 'c')
```

这里应该是作了两层循环，之前看有些文章里说是处理成这种

```typescript
// 错误的理解
MyExclude<'a'|'b'|'c', 'a'|'b'> = 
  ('a' extends 'a'|'b' ? never : 'a') |
  ('b' extends 'a'|'b' ? never : 'b') |
  ('c' extends 'a'|'b' ? never : 'c') 
```

例如我们要实现反过来的`Exclude`，代码如下：

```typescript
// ReverseExclude<'a'|'b', 'a'|'b'|'c'>  -> 'c'
type ReverseExclude<T, U> = U extends T ? never : U;
```

如果只有一层循环，按照如下处理只能得到`never`类型，显然和事实不符

```typescript
// 错误的理解
ReverseExclude<'a'|'b', 'a'|'b'|'c'> = 
  ('a'|'b'|'c' extends 'a' ? never : 'a'|'b'|'c') |
  ('a'|'b'|'c' extends 'b' ? never : 'a'|'b'|'c')
```

但按理说解析器会和具体代码业务解耦，`ts`类型解析时应该不会结合上下文去判断多个参数之间的关系。

#### Await

原题[地址](https://github.com/type-challenges/type-challenges/blob/main/questions/00189-easy-awaited/README.zh-CN.md)

```typescript
type PromiseLike<T = unknown> = {then: (cb: (arg: T)=>unknown) => unknown};
type MyAwaited<T extends PromiseLike> = T extends PromiseLike<infer U> ? (U extends PromiseLike ? MyAwaited<U> : U) : never;
```

需要实现`await`，即`const result = await PromiseVal`的`await`。

此处实现方式类似Promise A+协议中的`resolvePromise`部分，之所以以自定义的`PromiseLike`作为`Promise`的判断条件，是因为在`resolvePromise`中，判断一个对象是否是Promise，是以`typeof promise.then === "function"`作为判断条件，这保证了不同pollyfill实现的Promise函数之间可以相互进行链式调用，且满足`PromiseLike`的对象都能用`async...await`语法。



#### Include

原题[地址](https://github.com/type-challenges/type-challenges/blob/main/questions/00898-easy-includes/README.zh-CN.md)

```typescript
type Eq<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false

type Includes<T extends readonly any[], U> =
  T extends [infer H, ...infer Rest]
  ? (Eq<H, U> extends false ? Includes<Rest, U>: true)
  : false;
```

`Include`主体部分还好，最麻烦的是`Equal`部分，一开始写的`Equal`如下

```typescript
type Eq<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
// 这个是错的，测试用例如下
type check = Eq<boolean, true> // boolean
```

这里忽略了`boolean`其实是个复合类型，根据前面[分配条件类型](https://www.typescriptlang.org/zh/docs/handbook/2/conditional-types.html#%E5%88%86%E9%85%8D%E6%9D%A1%E4%BB%B6%E7%B1%BB%E5%9E%8B)提到的，**作为参数**传递时会进行遍历

```typescript
type check = Eq<boolean, true> // boolean
// ⬇️
// boolean -> true|false
// ====> Eq<true, true>|Eq<false, true> -> true|false -> boolean
```

直接翻看了`'@type-challenges/utils'`的库，发现它是利用`function`的定义绕过对象的`extends`判断。。这一点比较具有启发性

```typescript
type Eq<X, Y> =
	// 这里没有直接进行X和Y的比较，那样会触发分配条件类型
	// 因此借助范型的变量T作为桥梁进行比较
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false
```

**习惯了常规编程语言的语法后，很容易忽略【分配条件类型】这条规则，可以借用中间变量的思想，间接绕过直接的`extends`判定**
