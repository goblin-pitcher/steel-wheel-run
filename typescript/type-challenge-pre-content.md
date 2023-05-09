## 前置内容

### 目的

最近准备开始刷[`type-challenges`](https://github.com/type-challenges/type-challenges)，因此先梳理一下ts类型相关知识点。

### 遗漏知识点总结

**`ts`的type符合图灵完备**。这意味着`ts`类型包含循环、判断等一系列基本操作。

#### 类型集合

类型应当作集合来看，其中：

1. `unknown`是全集，包含所有类型，是所有类型的父级
   + 之前在泛型中会写`Comp<T extends unknown>`看来是有些多此一举了...
2. `never`是空集，是所有类型的子集

ts的设计符合**里氏替换原则**，即子集可以替换所有父级，这意味着：

```typescript
interface Parent {
  id: string;
}
// 符合里氏替换原则，不会报错
interface Child extends Parent {
  id: "childIdA"|"childIdB"; // "childIdA"|"childIdB"是string的子集
  key: number; // Parent中没有key，该属性是Parent的拓展
}
// 不符合里氏替换原则，报错
interface ChildError extends Parent {
  id: number; // number不是string的子集
}


type A = {a: string};
type B = {a: "A"|"a", b: number};
let a: A = {a: "xxx"};
let b: B = {a: "a", b: 2};
// 符合B是A的子集，该赋值符合里氏替换原则, 反之 b=a 会报错
a = b;
```

#### 将TS的type看作编程语言

既然`ts`的type是图灵完备的，那么它自然可以完成一切计算，因此可以看作是一门语言

##### 函数

在类型语境中，可将泛型看做是函数

```typescript
type Fn<T> = T; // 看作 const Fn = val => val;
```

##### 循环

经常可以在代码中看到如下写法：
```typescript
type R = "A" | "B"
type T = {
  [k in R]: k
}
```

这里`[k in R]`可看做循环`for(const k in R){}`

借助此特性，可以完成如下操作：

```typescript
type MyPick<T, K extends keyof T> = {
  [k in K]: T[k]
}

type A = MyPick<{a: string, b: number, c: boolean}, "a"|"c">
```

当然这种循环只针对特定类型（`"a"|"b"`这种），稍微复杂点的循环还是得通过**递归**实现，例子的话，后面用`ts type`实现四则运算时会用到。

##### 条件语句

`type`支持三元运算符，这个没什么好说的。。

需要注意的是，`type`里没有等号，但可以用extends代替等号

```typescript
type Equal5<T> = T extends 5 ? true : false;
```

来点练习

```typescript
// eq1: 实现`GetProp<Obj, K>`（获取Obj[K]类型）
type GetProp<Obj, K> = K extends keyof Obj ? Obj[K] : undefined;
// eq2: 实现getName<User>
type GetName<User> = GetProp<User, "name">
```

`extends`也常和`infer`一起用于类型推断。

例如

```typescript
// 实现KeyOf
type KeyOf<T> = T extends {[k in infer U]: unknown} ? U : never;
// 实现ValueOf
type ValueOf<T> = T extends { [k in keyof T]: infer U } ? U : never;

// 实现Parameters和ReturnType
type FuncBase<F, C extends "params"|"return"> = F extends (...params: infer P) => infer R ? (C extends "params" ? P : R) : never;

type Params<F> = FuncBase<F, "params">;
type Return<F> = FuncBase<F, "return">;
```

##### 赋值

赋值部分参看前面**类型集合**章节，赋值要遵循里氏替换原则。

**条件语句**章节提到了`infer`，或许可以用`infer`实现解构赋值。

```typescript
// 需要实现类似js的const {name, ...extra} = user,求extra。（其实就是Omit方法）
type MyPick<Obj, T extends keyof Obj> = {[k in T]: Obj[k]};
type MyExclude<Obj, T extends keyof Obj> = keyof Obj extends T|(infer U extends keyof Obj) ? U : never;
type MyOmit<Obj, T extends keyof Obj> =  MyPick<Obj, MyExclude<Obj, T>>;

// 实现数组的解构赋值const [A, ...extra] = arr;
type GetArrBase<T extends unknown[], C extends "first"|"rest"> = T extends [infer First, ...infer Rest] ? (C extends "first"?First: Rest): never;

type GetFirst<T extends unknown[]> = GetArrBase<T, "first">;
type GetRest<T extends unknown[]> = GetArrBase<T, "rest">;
```



##### 对象

`type`的对象可以类比`js`中的对象，使用方法如下，**注意最后一个例子**

```typescript
type Obj = {
  name: string;
  age: 20;
}

Obj["name"] // string;
Obj.age // Error
Obj["age"] // 20
Obj['name'|'age'] // string | 20 , 这个特性很重要！！！
```

利用这个特性，可以完成如下功能

```typescript
interface Test {
  a: string;
  b: number;
  c: boolean;
}
// 之前不知道这个特性时，用infer也能达到同样的效果，但实现不如这个直观
type ValueOf<T> = T[keyof T];
type R = ValueOf<Test>;
```

##### 数组

`ts`中的数组分为`Array`数组和`Tuple`元组。

`Array`数组是诸如`string[]`的写法，类似`java`或其他语言的数组。

`Tuple`元组更像是`js`中的数组，写法是`[string, number, boolean]`这种。

(*注：`js`中不存在真正意义上的数组，数组是在内存上开辟连续空间，每个单元格所占内存都一样，在`js`中，数组写成`['a', 5555, {a: 1}]`都没问题，显然在实现上不是真正的开辟了连续内存空间，应该是用链表模拟的，为了解决链表本身查询慢的问题，应该是采用了跳表或者红黑树的方式组织的？*)

数组中需要注意的点如下：

```typescript
type A = string[];
type B = [string, number, boolean];
// =========================分割线==========================
// 重点注意！！！
A[0]; // string
A[1]; // string
B[0]; // string
B[1]; // number;
B[0|2]; // string|boolean
// 注意以下写法，为什么可以这么写，因为number是所有数字的集合
A[number]; // string
B[number]; // string | number | boolean
A["length"]; // number
B["length"]; // 3
// ts数组同样可以像js数组那样展开
type Spread<T extends unknown[]> = [...T]
Spread<[1,2,3]> // [1,2,3]
```

根据以上特性，很容易实现以下练习：

```typescript
// eq1: 实现 `ItemOf`方法（获取数组中项的类型）
type ItemOf<T extends unknown[]> = T[number];
// 之前不知道这个特性时，用infer实现的代码如下
type ItemOfByinfer<T> = T extends (infer N)[] ? N : never;

// eq2:实现`Append`方法
type Append<T extends unknown[], Ele> = [...T, Ele];

// eq3: 实现返回数组length+1
// ts虽然无法实现加减运算，但可以通过模拟生成对应新类型，返回其属性，从而模拟加减运算
type LengthAddOne<T extends unknown[]> = [unknown, ...T]["length"];
```

##### 四则运算

运算加减依赖于元组长度，因此先定义一些基本方法，注意..由于是依赖元组长度，因此无法算负数和小数，只能算正整数...

(*注：虽然无法计算负数和小数，但ts的type依旧是图灵完备的，位运算也只是01的运算，负数和小数都是一堆01的定义，比如把10000看做0，且最后两位是小数，那么9999就是 -0.01*)

```typescript
// 返回Push后的数组
type Append<T extends unknown[], E = unknown> = [...T, U];
// 同理，返回Pop后的数组代码如下，暂时用不到
// type RemoveTop<T extends unknown[]> = T extends [...(infer U), unknown] ? U : never;

type Tuple<N extends number, Arr extends unknown[] = []> = Arr["length"] extends N ? Arr : Tuple<N, Append<Arr>>
```

有了这些基本方法，先实现**加法**和**减法**

```typescript
type Add<A extends number, B extends number> = [...Tuple<A>, ...Tuple<B>]["length"];

type Subtract<A extends number, B extends number> = Tuple<A> extends [...Tuple<B>, ...(infer U)] ? U["length"] : never;
```

**乘法**的话，`A*B`就是`A`个`B`相加，简易版乘法如下，思路不难，但直接用Add和Subtract封装，很多写法都提示嵌套太深。。

注意，这里用于统计和的参数S以元组表示，因为所有运算都是以元组为基准，S用数字表示会先转元组再转数字，来来回回开销比较大。

```typescript
type MultipleBase<A extends number, B extends number, S extends unknown[] = []> = 
	B extends 0
	? S["length"]
	: MultipleBase<A, Subtract<B, 1>, [...S, ...Tuple<A>]>;
```

乘法还有优化的空间，例如`2*100`，直接用这个算的是100个2相加，时间复杂度不如`100*2`,而计算这么优化的前提是，实现`BiggerThan`方法。

```typescript
type BiggerThan<A extends number, B extends number> = Tuple<A> extends [...Tuple<B>, ...infer U] ? (U["length"] extends (never|0) ? false : true): false;
// 优化后的乘法如下
type Mutiple<A extends number, B extends number> = BiggerThan<A, B> extends true ? MultipleBase<A, B> : MultipleBase<B, A>;
```

有了`BiggerThan`，**除法**也好说，例如`a/b`，判定`b*2、b*3...b*n`和A的大小就行。

同乘法的实现，用于统计的参数R为元组。。

```typescript
type Divide<A extends number, B extends number, R extends unknown[] = []> = BiggerThan<B, A> extends true ? R["length"] : Divide<Subtract<A,B>, B, Append<R>>;
```

至此，四则运算实现完毕。
