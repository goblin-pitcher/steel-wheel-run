## typescript type 分配条件类型

关于分配条件类型，官方文档描述[地址](https://www.typescriptlang.org/zh/docs/handbook/2/conditional-types.html#%E5%88%86%E9%85%8D%E6%9D%A1%E4%BB%B6%E7%B1%BB%E5%9E%8B)。

之前看的时候没真正理解，关于联合类型的分配条件，官方文档其实也没有讲得很明白，和翻译无关，英文文档一样很模糊，这些天做[`type challenge`](https://github.com/type-challenges/type-challenges)，发现有些题做出来的结果和预期不太一致，所以重新梳理这块内容。

### 先说结论

联合类型什么时候会分配，必须符合4个条件（后面直接用条件1、条件2等代指下面条件）：

1. 首先，只分配extends前的内容
   + 无论这个extends是不是子断言语句中的
   + 例如`type Test<T> = 'b' extends 'b' ? (T extends 'b' ? true: false) : false;`, 其中的`T extends 'b'`在子语句中，但事实上依旧是有效的

2. 分配的内容未做任何处理
   + `type Test<T> = keyof T extends null ? never: false;`，`T`被`keyof`操作符处理了，因此不会分配
   + 官方文档中，提到避免分配的方法`type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;`，能规避分配也是这个道理

3. 分配内容必须作为参数传入

4. 传入时是联合类型



### 相关题目与解析

#### 验证条件1

```typescript
type Test<T> = 'b' extends 'b' ? (T extends 'b' ? true: false) : false;
Test<'a'| 'b'> // boolean
```

可见在子条件中的`extends`也符合自动分配，否则`'a'|'b' extends 'b'`会返回`false`，而不是`true|false`

#### 验证条件2

发现这个问题是在DeepReadonly，题目[地址](https://github.com/type-challenges/type-challenges/blob/main/questions/00009-medium-deep-readonly/README.md)

这一题一看看过去，直接写出如下：

```typescript
type DeepReadonly<T> = keyof T extends never ? T : {readonly [k in keyof T]: DeepReadonly<T[k]>};
```

但是发现对于测试用例`X2`不生效

```typescript
type X2 = { a: string } | { b: number };
DeepReadonly<X2> // { a: string } | { b: number }
```

仔细看，虽然X2是联合类型，但`keyof T extends never`显然不符合前面说的**条件2**，因此不会自动分配，而`keyof ({ a: string } | { b: number })`值为`never`。因此该题正确写法如下：

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: keyof T[P] extends never ? T[P] : DeepReadonly<T[P]>;
};
```

#### 验证条件3

显然，普通使用`extands`不会触发自动分配

```typescript
type Test = 'a'|'b' extends 'a' ? true: false; // false
```

那么，假设传入的参数是联合类型，`extends`前的对象也是联合类型呢？

```typescript
type Test<T> = 'b' extends 'b' ? (keyof T extends 'b' ? true: false) : false;
type Result = Test<{a:1,b:string}|{a:2,b:number}> // false
```

这里，参数`T`是联合类型，但`extends`前进行了`keyof`处理，但`keyof {a:1,b:string}|{a:2,b:number}`结果为`'a'|'b'`，依然是联合类型，若这里进行了自动分配，结果应是`boolean`而非`false`。

根据结果来看，这里并未进行分配，这个例子同时违背了**条件2**和**条件3**

#### 验证条件4

```typescript
type Test<T> = 'a'|'b' extends 'b' ? T: false;
Test<5> // false
```

条件4显而易见，官方文档上已经说的很明确了。

#### 不注意优先级导致的错误

在测试分配条件类型的规律时，曾因为一条用例卡了半天，用例如下：

```typescript
type A = keyof null|undefined; // undefined
type UndefinedExtendsNull = undefined extends null ? true: false; //false
type Test<T> = keyof T extends null ? true: false;
Test<null|undefined>; // true ！！！！
```

此时已经知道了，`keyof T`会避免自动分配，因此对于`Test<null|undefined>`，可以写成

```typescript
keyof null|undefined extends null ? true : false; // 这里有个坑...
```

而`keyof null|undefined`结果是`undefined`，但是

```typescript
type UndefinedExtendsNull = undefined extends null ? true: false; //false
```

结果是`false`，同样的式子，结果不一样，一开始我以为是分配规律的理解有问题，但即使分配了，结果也应该是`true|false`，也就是`boolean`，而不是`true`。

后来发现，`type`是有**优先级**的，且**`keyof`优先级高于`|`**.

按理说`keyof null|undefined`结果应该是`never`，之所以会显示结果是`undefined`，是因为优先级运算：

```typescript
keyof null|undefined -> (keyof null)|undefined -> never|undefined -> undefined
```

**在实际写类型的时候，要重点注意优先级问题**
