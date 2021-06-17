## js类型转换汇总

### 数据类型

+ 基本数据类型
  + number、string、boolean、null、undefined
+ 引用数据类型
  + object
    + 普通对象、数组对象、正则对象、日期对象、数学函数(Math)....
  + function

### 类型转换

#### 其他类型转换为number类型

发生的情况：

+ isNaN检测

  + 先调用Number方法转换为数字，再检测是否为有效数字

+ 基于parseInt/parseFloat/Number 手动转换为数字类型

+ 基于数学运算符: + - * / % 转换

  + **注意：+ 不仅仅是数学运算，还有可能是字符串拼接**

    + ````javascript
      '3' - 1 === 2 // true
      Number.isNaN('3px' - 1) // true
      var i = '3'
      i = i+1; // i: '31'
      i += 1; // i: '31'
      i++ || ++i; // i: 4, i++和++i是单纯的数据运算，摒弃字符串拼接规
      ````

+ 进行比较的时候(>、>=、<、<=、==)

转换规则：

+ string -> number
  + 遇到非有效数字字符，结果将是NaN
  + '' -> 0
  + ' ' -> 0 // 1个或多个空格都转换为0
  + '\r' -> 0 // 回车符（回到当前行行首）
  + '\n' -> 0 // 换行符（换到当前位置的下一行，不会回到行首）
  + '\t' -> 0 // 制表符(Tab)
  + '\f' -> 0 // 换页符
  + '\v' -> 0 // 垂直制表符
  + ......
+ boolean -> number
  + true -> 1, false-> 0
+ null/undefined -> number
  + null -> 0
  + undefined -> NaN
+ 引用类型 -> number
  + 先将其转换为字符串(toString)，再转换成数字(Number)

#### 其他类型转换为string类型

发生的情况: 

+ 基于alert、confirm、prompt、document.write等方法输出时，会将输出的值转换为字符串再输出

  + ````javascript
    alert(1) // => '1'
    ````

+ 基于 + 进行字符串拼接的时候

+ 把引用类型转换为数字类型的时候，首先会转换为字符串，再转换为数字

+ 给对象设置值属性名，如果不是字符串，首先转换为字符串，再当作属性存储到对象中(**注意：对象的属性只能是数字或者字符串**)

  + ````javascript
    const arr = [7,2,3]
    const obj = {a:1}
    const o = {
        8: '8',
        4: '4',
        '1': '1',
        x: 'x',
        a: 'a',
        '8ax': '8ax',
        '1bc': '1bc',
        [arr]: arr,
        [obj]: obj
    }
    Object.keys(o) // ["1", "4", "8", "x", "a", "8ax", "1bc", "7,2,3", "[object Object]"]
    ````

+ 手动调用toString、toFixed、join、String等放啊时，会将相关对象转换为字符串

  + ````javascript
    Math.PI.toFixed(2) // '3.14'
    ````



转换规律: 

+ 调用对象的**toString**方法

  + ````javascript
    1 -> '1'
    NaN -> 'NaN'
    true -> 'true'
    [] -> ''
    [1] -> '1'
    [1,2] -> '1,2'
    ...
    // 所有对象都会转换成'[object Object]'
    {a: 1} -> '[object Object]'
    {} -> '[object Object]'
    ````



#### 把其他类型转换为boolean类型

发生的情况: 

+ 基于! 、!! 、Boolean等方法转换

+ 条件判断中的条件最后都会转换为布尔类型

  + ````javascript
    if('a' + 1) {
    	// 先计算表达式的结果'a'+1 -> 'a1'，再把结果转换为布尔值true，条件成立
    }
    ````

转换的规律: 

+ 只有0 、 NaN 、'' 、null 、undefined 五个值转换为布尔的false，其余都是转换为true



### 特殊情况

#### 数学运算和字符串拼接 ‘+’

````javascript
// 当表达式中出现字符串，就是字符串拼接，否则就是数学运算
1 + true => 2 // 没有出现字符串，为计算
'1' + true => '1true' // 出现字符串，为字符串拼接

// 虽然没看见字符串，但引用类型运算时，会先转换为字符串，即 '12' + 10
[12] + 10 => '1210'

// {}转换为字符串'[object Object]'
({}) + 10 => '[object Object]10'

// 注意，此处{}代表的并非一个Object，此处会被识别成一个代码块(块级作用域)
// 此处代码会被识别成类似与 {}; +10，相当于只执行了+10
{} + 10 => 10
````

思考题: 

````javascript
12+true+false+null+undefined+[]+'中文'+null+undefined+[]+true
// 解析：：
// 12 + true + false +null => 13
// 13 + undefined => NaN // Number(undefined)为NaN,此处相当于13 + NaN
// NaN + [] => 'NaN' // 注意，对象运算时会先转换为字符串
// 'NaN'+'中文'+null+undefined+[] => 'NaN中文nullundefined' + '' => 'NaN中文nullundefined'
// 'NaN中文nullundefined' + true => 'NaN中文nullundefinedtrue'
// 结果：：
// 'NaN中文nullundefinedtrue'
````

#### 在进行“==”比较的时候，如果两边数据类型不一样，先转换为相同类型，再进行比较

````javascript
{name: 'xxx'} == {name: 'xxx'} // false;类型一样，则比较引用地址
````

<details>
    <summary>类型不一致时，除了null、undefined、NaN, 都是先将左右转换成<b>数字(number类型)</b>进行比较</summary>
    <ul>
        <li>对象 == 数字：把对象转换为数字</li>
    	<li>对象 == 布尔：把对象和布尔都转换为数字</li>
    	<li>对象 == 字符串：把对象和字符串都转换为数字</li>
    	<li>字符串 == 数字：把字符串转换为数字</li>
    	<li>字符串 == 布尔：都转换为数字</li>
    	<li>布尔 == 数字：把布尔转换成数字</li>
    </ul>
    <hr>
    <p>
        <b>特殊情况：：</b>
    </p>
    <p>
        <b>注意: null和undefined跟其他值都不相等，NaN和任何值都不相等，包括它自己</b>
    </p>
    <ul>
        <li>null == undefined // true</li>
        <li>null == 0 // false</li>
        <li>null === undefined // false</li>
        <li>NaN == NaN // false</li>
    </ul>
</details>

思考题

````javascript
1 == true => true
1 == false => false
2 == true => false // 注意，都转换为数字，即比较 2 == 1

[] == false => true // 转换为数字，即 0 ==0
[] == true => false // 0 == 1
![] == false => true // 注意运算符先后顺序，![] => false,即 false == false
![] == true => false // false == true
````

#### 在进行“>、<、>=、<=”比较的时候，两边都转换为数字，再进行比较，若不能转换为有效数字，则会尝试执行字符串比较

````javascript
[] >= [] // true
null < 5 // true
null >= undefined // false
'haha' <= 'haha' // true
({}) >= ({}) // true {} 不能转换为数字，因此比较'[object Object]'<='[object Object]'

// 注意特殊情况，undefined和NaN
undefined >= undefined // false
undefined <= undefined // false
NaN >= NaN // false
NaN <= NaN // false
````

关于`({}) >= ({})`和`undefined >= undefined`结果的猜想：
对象会在进行比较时，会先尝试转换为数字，不是有效数字则比较字符串，而undefined本身不存在toString方法，因而只会转换为NaN，而NaN是特例，和任何值都不相等，包括自身
