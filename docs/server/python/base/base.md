---
outline: deep
---

# Python 基础

Python 是动态强类型语言，变量无需声明类型，但运行时类型是确定的。

## 数据类型

以下按类别介绍 Python 核心数据类型。

### 数值类型
#### int（整数）

Python 3 中 `int` 为**任意精度**，无溢出问题。

```python
a = 10          # 十进制
b = 0b1010      # 二进制 (10)
c = 0o12        # 八进制 (10)
d = 0xA         # 十六进制 (10)
e = 10_000_000  # 数字分隔符，提高可读性
f = int("42")   # 字符串转整数
```

#### float（浮点数）

双精度（IEEE 754），存在精度误差，精确运算需用 `Decimal`。

```python
a = 3.14
b = 1.2e-5      # 科学计数法 (0.000012)
c = float("3.14")

# 精度问题示例
print(0.1 + 0.2)  # 0.30000000000000004
```

#### complex（复数）

```python
a = 3 + 4j
print(a.real)   # 3.0
print(a.imag)   # 4.0
print(abs(a))   # 5.0  (模)
```

#### Decimal & Fraction（精确运算）

```python
from decimal import Decimal
from fractions import Fraction

print(Decimal("0.1") + Decimal("0.2"))  # 0.3
print(Fraction(1, 3) + Fraction(1, 3))   # 2/3
```

### 布尔类型

`bool` 是 `int` 的子类，`True == 1`，`False == 0`。

```python
print(True + 1)   # 2
print(isinstance(True, int))  # True
```

#### 判断为 False 的值

| 值 | 说明 |
|---|---|
| `None` | 空值 |
| `False` | 布尔假 |
| `0` / `0.0` / `0j` | 零值 |
| `""` | 空字符串 |
| `[]` / `()` / `{}` / `set()` | 空容器 |

### 序列类型

序列类型支持索引、切片、`in` 成员检测、`len()`、`+`、`*` 等通用操作。

```python
s = "hello"
print(s[0])       # 'h'
print(s[-1])      # 'o'
print(s[1:4])     # 'ell'
print(s[::-1])    # 'olleh' (反转)
```

#### str（字符串）

Python 3 中 `str` 是 **Unicode** 字符串。

```python
# 三种写法
s1 = '单引号'
s2 = "双引号"
s3 = """多行
字符串"""
s4 = '''也是
多行'''

# f-string（推荐）
name = "Tom"
age = 18
print(f"姓名: {name}, 年龄: {age}, 明年: {age + 1}")

# 常用方法
print("hello".upper())           # 'HELLO'
print("hello".capitalize())      # 'Hello'
print("hello world".split())     # ['hello', 'world']
print(",".join(["a", "b"]))     # 'a,b'
print("  abc  ".strip())         # 'abc'
print("abc".replace("a", "x"))   # 'xbc'
print("abc.txt".endswith(".txt")) # True
print("abc".find("b"))           # 1
```

#### bytes（字节串）

不可变字节序列，用于二进制数据、网络传输、文件 I/O。

```python
b = b"hello"         # 字节字面量
b = bytes([65, 66])  # b'AB'
b = "你好".encode("utf-8")   # 编码
s = b.decode("utf-8")         # 解码
```

#### list（列表）

可变有序序列，元素可任意类型，底层为动态数组。

```python
lst = [1, 2, 3]
lst.append(4)            # 尾部追加: [1, 2, 3, 4]
lst.extend([5, 6])       # 扩展:     [1, 2, 3, 4, 5, 6]
lst.insert(0, 0)         # 指定位置: [0, 1, 2, 3, 4, 5, 6]
lst.pop()                # 弹出末尾: 6
lst.pop(0)               # 弹出索引0: 0
lst.remove(3)            # 按值删除:  删除第一个3
del lst[0]               # 按索引删除
lst.sort()               # 原地排序
lst.reverse()            # 原地反转
idx = lst.index(2)       # 查找索引

# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(10) if x % 2 == 0]
```

#### tuple（元组）

不可变有序序列，可作为字典键。

```python
t = (1, 2, 3)
t = 1, 2, 3            # 括号可省略
t = (1,)               # 单元素必须加逗号

# 拆包
a, b, c = (1, 2, 3)
a, *rest = (1, 2, 3, 4)  # a=1, rest=[2,3,4]

# namedtuple（具名元组）
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(p.x, p.y)  # 1 2
```

### 集合类型

#### set（集合）

无序、可变、元素唯一（基于哈希表），**不可作为字典键**。

```python
s = {1, 2, 3}
s = set([1, 2, 3])       # 从可迭代对象构造

s.add(4)                 # 添加
s.remove(2)              # 删除（不存在抛 KeyError）
s.discard(5)             # 删除（不存在不报错）

# 集合运算
a = {1, 2, 3}
b = {2, 3, 4}
print(a | b)   # 并集: {1, 2, 3, 4}
print(a & b)   # 交集: {2, 3}
print(a - b)   # 差集: {1}
print(a ^ b)   # 对称差: {1, 4}

# 集合推导式
s = {x**2 for x in range(10)}
```

#### frozenset（冻结集合）

`set` 的不可变版本，可哈希，可作为字典键或放入另一个集合中。

```python
fs = frozenset([1, 2, 3])
d = {fs: "value"}  # 可用作字典键
```

### 映射类型

#### dict（字典）

键值对映射，键必须可哈希（不可变），Python 3.7+ 保证插入顺序。

```python
d = {"name": "Tom", "age": 18}
d = dict(name="Tom", age=18)
d = dict([("name", "Tom"), ("age", 18)])

# 访问
print(d["name"])        # 键不存在抛 KeyError
print(d.get("key", 0))  # 键不存在返回默认值

# 修改
d["new"] = "value"       # 新增/更新
del d["new"]              # 删除
val = d.pop("key", None)  # 弹出并返回值

# 常用方法
d.keys()                  # 返回视图对象
d.values()
d.items()                 # 返回 (key, value) 对

# 合并字典
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
print(d1 | d2)        # {'a': 1, 'b': 3, 'c': 4} (Python 3.9+)
print({**d1, **d2})   # 同上（通用写法）

# 字典推导式
square_map = {x: x**2 for x in range(5)}

# 嵌套取值安全写法
user = {"profile": {"name": "Tom"}}
print(user.get("profile", {}).get("name", "unknown"))

# defaultdict
from collections import defaultdict
dd = defaultdict(list)
dd["key"].append(1)   # 无需判断 key 是否存在

# Counter（计数器）
from collections import Counter
c = Counter("abracadabra")
print(c.most_common(3))  # 出现频率最高的3个
```

### None 类型

`None` 是 `NoneType` 的单例，表示"无值"或"空"。

```python
x = None
print(x is None)   # True（推荐用 is 而非 ==）
```

### 类型互转

| 转换 | 函数 |
|---|---|
| → int | `int(x)` |
| → float | `float(x)` |
| → str | `str(x)` |
| → bool | `bool(x)` |
| → list | `list(x)` |
| → tuple | `tuple(x)` |
| → set | `set(x)` |
| → dict | `dict(x)` |

```python
print(int("42"))           # 42
print(float("3.14"))       # 3.14
print(str(100))            # "100"
print(bool(""))            # False
print(list("abc"))         # ['a', 'b', 'c']
print(tuple([1, 2, 3]))   # (1, 2, 3)
print(set([1, 1, 2]))     # {1, 2}
```

### 可变与不可变

| 分类 | 不可变 (Immutable) | 可变 (Mutable) |
|---|---|---|
| 数值 | `int`, `float`, `complex` | - |
| 序列 | `str`, `bytes`, `tuple` | `list`, `bytearray` |
| 集合 | `frozenset` | `set` |
| 映射 | - | `dict` |
| 其他 | `bool`, `NoneType` | - |

不可变类型一旦创建，内容不可修改；可变类型允许原地修改。

```python
# 不可变：每次操作返回新对象
s = "hello"
print(id(s))
s += " world"       # 创建了新字符串
print(id(s))        # 地址已改变

# 可变：原地修改
lst = [1, 2, 3]
print(id(lst))
lst.append(4)
print(id(lst))      # 地址不变
```

注意：默认参数不要使用可变对象，否则会导致意外行为：

```python
# 错误示例
def add_item(item, lst=[]):
    lst.append(item)
    return lst

print(add_item(1))   # [1]
print(add_item(2))   # [1, 2] — 不是预期的 [2]

# 正确写法
def add_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

### 类型注解 (Type Hints)

Python 3.5+ 支持类型注解，提高可读性和 IDE 支持。

```python
# 基本类型
name: str = "Tom"
age: int = 18
price: float = 9.99
active: bool = True
data: bytes = b"hello"

# 容器类型 (Python 3.9+)
names: list[str] = ["a", "b"]
point: tuple[int, int] = (1, 2)
scores: set[int] = {1, 2, 3}
user: dict[str, str] = {"name": "Tom"}

# 可选类型
from typing import Optional
val: Optional[str] = None   # str | None

# 联合类型 (Python 3.10+)
from typing import Union
uid: str | int = 42

# Any（任意类型）
from typing import Any
data: Any = "anything"

# 函数注解
def greet(name: str, age: int = 0) -> str:
    return f"{name} is {age}"

# Callable（可调用对象）
from typing import Callable
def apply(func: Callable[[int, int], int], x: int, y: int) -> int:
    return func(x, y)

# 自定义类型
UserId = int
Vector = list[float]

def get_user(uid: UserId) -> dict[str, str]:
    return {"id": str(uid)}
```

### 类型检查

```python
# type() 获取类型
print(type(42))          # <class 'int'>
print(type("hello"))     # <class 'str'>

# isinstance() 检查继承关系（推荐）
print(isinstance(42, int))           # True
print(isinstance(True, int))         # True (bool 是 int 子类)
print(isinstance(42, (int, float)))  # True (匹配多种类型)
```

#### type() vs isinstance() 对比

| 场景 | `type()` | `isinstance()` |
|---|---|---|
| 精确类型匹配 | 适用 | 需结合判断 |
| 子类匹配 | 不适用 | 适用 |
| 多类型匹配 | 不支持 | 支持元组 |
| 检查鸭子类型 | 不支持 | 配合 ABC 支持 |

## 条件判断

### if / elif / else

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(grade)  # B
```

### 三元表达式（条件表达式）

```python
# 语法：value_if_true if condition else value_if_false
age = 20
status = "成年" if age >= 18 else "未成年"
print(status)  # 成年

# 可嵌套（不推荐，降低可读性）
x = 10
result = "正数" if x > 0 else ("零" if x == 0 else "负数")
```

### match / case（模式匹配，Python 3.10+）

```python
# 基础用法：替代多重 if/elif
status_code = 404

match status_code:
    case 200:
        msg = "OK"
    case 201:
        msg = "Created"
    case 400:
        msg = "Bad Request"
    case 401 | 403:
        msg = "Auth Error"      # 多个值用 | 分隔
    case 404:
        msg = "Not Found"
    case 500 | 502 | 503:
        msg = "Server Error"
    case _:
        msg = "Unknown"         # _ 为通配符

print(msg)  # Not Found

# 解构匹配
point = (0, 5)
match point:
    case (0, 0):
        desc = "原点"
    case (0, y):
        desc = f"Y轴上, y={y}"
    case (x, 0):
        desc = f"X轴上, x={x}"
    case (x, y):
        desc = f"坐标 ({x}, {y})"

# 带守卫的匹配（结合 if 条件）
value = 42
match value:
    case x if x < 0:
        desc = "负数"
    case x if x == 0:
        desc = "零"
    case x if x > 0:
        desc = "正数"

# 匹配数据结构
data = {"type": "error", "msg": "timeout"}
match data:
    case {"type": "error", "msg": msg}:
        print(f"错误: {msg}")
    case {"type": "success", "data": d}:
        print(f"成功: {d}")
    case _:
        print("未知格式")
```

### 比较运算符

| 运算符 | 含义 | 示例 |
|---|---|---|
| `==` | 等于 | `a == b` |
| `!=` | 不等于 | `a != b` |
| `>` | 大于 | `a > b` |
| `<` | 小于 | `a < b` |
| `>=` | 大于等于 | `a >= b` |
| `<=` | 小于等于 | `a <= b` |
| `is` | 身份相同 | `a is None` |
| `is not` | 身份不同 | `a is not None` |
| `in` | 成员存在 | `"a" in ["a","b"]` |
| `not in` | 成员不存在 | `"c" not in ["a","b"]` |

```python
# == 比较值，is 比较内存地址（身份）
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)   # True  (值相同)
print(a is b)   # False (地址不同)

# 字符串比较按字典序
print("abc" < "abd")   # True
print("abc" > "ABC")   # True (小写 > 大写)

# None 必须用 is 判断
x = None
if x is None:    # 正确
    pass
if x == None:    # 不推荐
    pass
```

### 逻辑运算符

| 运算符 | 含义 | 短路特性 |
|---|---|---|
| `and` | 与 | 左侧为假时不执行右侧 |
| `or` | 或 | 左侧为真时不执行右侧 |
| `not` | 非 | - |

```python
# 短路求值
def check():
    print("check called")
    return True

if False and check():   # check() 不会执行
    pass

if True or check():     # check() 不会执行
    pass

# 利用短路实现安全取值
name = user and user.get("name") and user.get("name").upper()

# or 常用于设置默认值
val = raw_value or "default"   # 注意：0、"" 等假值也会被替换

# not 反转布尔值
print(not True)    # False
print(not [])      # True (空列表为假)
```

### 链式比较

```python
# Python 支持链式比较，更简洁直观
age = 25
if 18 <= age <= 60:          # 等价于 if age >= 18 and age <= 60
    print("工作年龄")

if a == b == c:               # 等价于 a == b and b == c
    print("三者相等")
```

### 常用判断模式

```python
# 判断变量类型
if isinstance(x, (int, float)):
    print("是数字")

# 判断字符串是否为空
if s:           # 优于 if s != "" 和 if len(s) > 0
    pass

# 判断列表是否为空
if lst:         # 优于 if len(lst) > 0
    pass

# 判断键是否存在
if "key" in d:
    val = d["key"]

# 判断文件是否存在
from pathlib import Path
if Path("data.txt").exists():
    with open("data.txt") as f:
        content = f.read()

# all() — 所有元素为真
if all(x > 0 for x in [1, 2, 3]):
    print("全部为正数")

# any() — 任一元素为真
if any(x > 5 for x in [1, 2, 10]):
    print("存在大于5的数")
```

### 海象运算符 `:=`（Python 3.8+）

在条件判断中赋值并同时使用，避免重复调用。

```python
# 传统写法
line = f.readline()
while line:
    print(line.strip())
    line = f.readline()

# 海象运算符
while line := f.readline():
    print(line.strip())

# 条件中使用
if (n := len(data)) > 10:
    print(f"数据过长 ({n})")

# 列表推导中使用
results = [v for x in data if (v := process(x)) is not None]
```

### 异常处理中的条件分支

```python
try:
    result = 10 / divisor
except ZeroDivisionError:
    result = float("inf")
except TypeError as e:
    print(f"类型错误: {e}")
    result = None
else:
    print("计算成功")          # 未发生异常时执行
finally:
    print("清理收尾工作")       # 总是执行
```

## 循环

### for 循环

```python
# 遍历列表
for item in [1, 2, 3]:
    print(item)

# 遍历字符串
for ch in "hello":
    print(ch)

# 遍历字典
d = {"a": 1, "b": 2}
for key in d:
    print(key, d[key])

for key, val in d.items():
    print(f"{key}: {val}")
```

#### range()

```python
# range(stop)
for i in range(5):       # 0 1 2 3 4
    print(i)

# range(start, stop)
for i in range(2, 6):    # 2 3 4 5
    print(i)

# range(start, stop, step)
for i in range(1, 10, 2): # 1 3 5 7 9
    print(i)

# 倒序
for i in range(10, 0, -1): # 10 9 8 ... 1
    print(i)

# range 返回的不是 list，而是惰性对象（节省内存）
r = range(1000000)
print(type(r))  # <class 'range'>
```

#### enumerate() — 同时获取索引和值

```python
items = ["a", "b", "c"]
for i, val in enumerate(items):
    print(f"{i}: {val}")    # 0: a  1: b  2: c

# 自定义起始索引
for i, val in enumerate(items, start=1):
    print(f"{i}: {val}")    # 1: a  2: b  3: c
```

#### zip() — 并行遍历多个序列

```python
names = ["Tom", "Jerry", "Mike"]
ages = [18, 20, 22]

for name, age in zip(names, ages):
    print(f"{name}: {age}")

# 长度不一致时取最短
a = [1, 2, 3]
b = ["x", "y"]
for pair in zip(a, b):
    print(pair)  # (1, 'x')  (2, 'y')

# zip_longest 取最长（需导入 itertools）
from itertools import zip_longest
for pair in zip_longest(a, b, fillvalue=None):
    print(pair)  # (1, 'x')  (2, 'y')  (3, None)
```

#### reversed() / sorted()

```python
# 反向遍历
for item in reversed([1, 2, 3]):
    print(item)  # 3 2 1

# 排序后遍历（原序列不变）
for item in sorted([3, 1, 2]):
    print(item)  # 1 2 3
```

### while 循环

```python
# 基础 while
count = 0
while count < 5:
    print(count)
    count += 1

# 无限循环 + 条件退出
while True:
    user_input = input("输入 q 退出: ")
    if user_input == "q":
        break
    print(f"你输入了: {user_input}")
```

### break / continue / else

```python
# break — 终止整个循环
for i in range(10):
    if i == 5:
        break
    print(i)  # 0 1 2 3 4

# continue — 跳过本次迭代，进入下一轮
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0 1 3 4

# else — 循环正常结束（未被 break 打断）时执行
for i in range(5):
    if i == 10:
        break
else:
    print("循环正常结束")  # 会执行

for i in range(5):
    if i == 3:
        break
else:
    print("不会执行")      # 被 break 打断了，不执行

# 典型用法：搜索未找到的场景
for item in data:
    if item == target:
        print("找到了")
        break
else:
    print("未找到")
```

### 推导式

推导式是 Python 特有语法，比传统循环更简洁高效。

#### 列表推导式

```python
# 基础
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 带条件过滤
evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]

# if-else 三元
labels = ["偶数" if x % 2 == 0 else "奇数" for x in range(5)]
# ['偶数', '奇数', '偶数', '奇数', '偶数']

# 嵌套循环
pairs = [(x, y) for x in range(3) for y in range(2)]
# [(0,0), (0,1), (1,0), (1,1), (2,0), (2,1)]

# 嵌套 + 过滤
pairs = [(x, y) for x in range(3) for y in range(3) if x != y]
# [(0,1), (0,2), (1,0), (1,2), (2,0), (2,1)]
```

#### 字典推导式

```python
square_map = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 翻转键值对
d = {"a": 1, "b": 2}
flipped = {v: k for k, v in d.items()}
# {1: 'a', 2: 'b'}

# 带条件过滤
filtered = {k: v for k, v in d.items() if v > 1}
```

#### 集合推导式

```python
unique_lengths = {len(word) for word in ["hi", "hello", "hey", "world"]}
# {2, 5, 3}

# 去重
nums = [1, 1, 2, 2, 3]
unique = {x for x in nums}
# {1, 2, 3}
```

#### 生成器表达式

与列表推导式语法一致，但用 `()` 代替 `[]`，**惰性生成**，不一次性加载全部数据。

```python
# 列表推导式 — 立即计算，占内存
squares = [x**2 for x in range(1000000)]

# 生成器表达式 — 惰性计算，省内存
squares = (x**2 for x in range(1000000))

# 常用于 sum、max、min 等聚合函数
total = sum(x**2 for x in range(1000000))
even_count = sum(1 for x in range(1000000) if x % 2 == 0)

# all / any
if all(x > 0 for x in nums): ...
if any(x > 100 for x in nums): ...

# 拼接字符串
text = ",".join(str(x) for x in range(10))
```

| 对比 | 列表推导式 `[...]` | 生成器表达式 `(...)` |
|---|---|---|
| 求值时机 | 立即生成全部元素 | 每次迭代生成一个 |
| 内存占用 | 大 | 小（O(1)） |
| 可重复遍历 | 是 | 否（消耗后消失） |
| 适用场景 | 需要多次使用 | 一次性消费 |

### itertools 常用工具

```python
import itertools

# count — 无限计数器
for i in itertools.count(10, step=2):  # 10, 12, 14, ...
    if i > 20: break

# cycle — 无限循环
for i, item in enumerate(itertools.cycle(["A", "B", "C"])):
    if i >= 6: break  # A B C A B C

# repeat — 重复
for item in itertools.repeat("X", 3):  # X X X
    print(item)

# chain — 串联多个迭代器
for item in itertools.chain([1, 2], (3, 4), "ab"):
    print(item)  # 1 2 3 4 a b

# product — 笛卡尔积
for pair in itertools.product("AB", [1, 2]):
    print(pair)  # ('A',1) ('A',2) ('B',1) ('B',2)

# combinations — 组合（无序，不放回）
for c in itertools.combinations("ABC", 2):
    print(c)  # ('A','B') ('A','C') ('B','C')

# permutations — 排列（有序）
for p in itertools.permutations("ABC", 2):
    print(p)  # ('A','B') ('A','C') ('B','A') ('B','C') ('C','A') ('C','B')

# groupby — 按键分组
data = [{"k": "a", "v": 1}, {"k": "a", "v": 2}, {"k": "b", "v": 3}]
sorted_data = sorted(data, key=lambda x: x["k"])
for key, group in itertools.groupby(sorted_data, key=lambda x: x["k"]):
    print(key, list(group))
```

### 循环中的性能注意

```python
# 差的写法 — 每次循环都计算 len
for i in range(len(lst)):
    print(lst[i])

# 好的写法 — 直接迭代
for item in lst:
    print(item)

# 需要索引时用 enumerate
for i, item in enumerate(lst):
    print(i, item)

# 不要在迭代中修改被迭代的对象（拷贝一份再改）
for item in lst[:]:    # 切片创建副本
    if some_condition:
        lst.remove(item)

# 或用列表推导式构造新列表
lst = [item for item in lst if not some_condition]
```

## 函数

### 基本定义与调用

```python
def greet(name):
    """返回问候语（文档字符串）"""
    return f"Hello, {name}!"

print(greet("Tom"))    # Hello, Tom!
print(greet.__doc__)   # 返回问候语（文档字符串）
```

### 参数类型

#### 位置参数

按顺序传入，个数必须匹配。

```python
def add(a, b):
    return a + b

print(add(3, 5))  # 8
```

#### 默认参数

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Tom"))              # Hello, Tom!
print(greet("Tom", greeting="Hi")) # Hi, Tom!

# 默认值在函数定义时只计算一次（可变对象陷阱）
def add_item(item, lst=[]):     # 危险
    lst.append(item)
    return lst

def add_item(item, lst=None):   # 正确
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

#### 关键字参数

调用时指定参数名，顺序自由。

```python
def info(name, age, city):
    print(f"{name}, {age}, {city}")

info(name="Tom", city="NY", age=20)
```

#### `*args` — 可变位置参数

接收任意数量的位置参数，打包为元组。

```python
def sum_all(*nums):
    return sum(nums)

print(sum_all(1, 2, 3))          # 6
print(sum_all(1, 2, 3, 4, 5))    # 15

# 解包传入
nums = [1, 2, 3]
print(sum_all(*nums))            # 6
```

#### `**kwargs` — 可变关键字参数

接收任意数量的关键字参数，打包为字典。

```python
def print_info(**kwargs):
    for key, val in kwargs.items():
        print(f"{key}: {val}")

print_info(name="Tom", age=20, city="NY")

# 解包传入
config = {"host": "localhost", "port": 8080}
print_info(**config)
```

#### 参数顺序（完整签名）

```python
def func(pos_only, /, pos_or_kw, *, kw_only):
    pass

def full(a, b, /, c, d="x", *args, e, f="y", **kwargs):
    # a, b      : 仅位置参数（/ 之前）
    # c, d      : 位置或关键字参数
    # *args     : 可变位置参数
    # e, f      : 仅关键字参数（* 之后）
    # **kwargs  : 可变关键字参数
    pass
```

| 参数类型 | 语法 | 示例 |
|---|---|---|
| 位置参数 | `name` | `def f(a, b)` |
| 默认参数 | `name=val` | `def f(a=1)` |
| 可变位置 | `*args` | `def f(*args)` |
| 仅关键字 | `*, name` | `def f(*, key)` |
| 可变关键字 | `**kwargs` | `def f(**kw)` |

### 返回值

```python
# 单值返回
def add(a, b):
    return a + b

# 无显式 return → 隐式返回 None
def log(msg):
    print(f"[LOG] {msg}")

result = log("test")  # result 为 None

# 多值返回 → 打包为元组
def divide(a, b):
    quotient = a // b
    remainder = a % b
    return quotient, remainder

q, r = divide(10, 3)   # q=3, r=1
result = divide(10, 3)   # result=(3, 1)
```

### Lambda（匿名函数）

```python
# 语法：lambda 参数: 表达式
square = lambda x: x**2
add = lambda a, b: a + b

# 常用作排序 key
users = [{"name": "Tom", "age": 20}, {"name": "Jerry", "age": 18}]
users.sort(key=lambda u: u["age"])

# 常用作 map/filter 参数
nums = list(map(lambda x: x**2, [1, 2, 3]))      # [1, 4, 9]
evens = list(filter(lambda x: x % 2 == 0, range(10)))  # [0,2,4,6,8]

# lambda 可以立即调用
result = (lambda x, y: x + y)(3, 5)  # 8
```

### 作用域（LEGB 规则）

变量查找顺序：**L**ocal → **E**nclosing → **G**lobal → **B**uilt-in

```python
x = "global"          # Global

def outer():
    x = "enclosing"   # Enclosing

    def inner():
        x = "local"   # Local
        print(x)      # "local"

    inner()
    print(x)          # "enclosing"

outer()
print(x)              # "global"

# global — 在函数内修改全局变量
count = 0
def increment():
    global count
    count += 1

# nonlocal — 修改外层（非全局）变量
def outer():
    x = 0
    def inner():
        nonlocal x
        x += 1
        return x
    return inner

counter = outer()
print(counter())  # 1
print(counter())  # 2
```

### 闭包

函数内部定义函数，内层函数引用外层变量。

```python
def make_multiplier(n):
    def multiplier(x):
        return x * n      # n 被"捕获"
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5))  # 10
print(triple(5))  # 15
```

### 装饰器

在不修改原函数的前提下，为其增加额外功能。

```python
import time
from functools import wraps

# 基础装饰器
def timer(func):
    @wraps(func)  # 保留原函数的元信息（__name__、__doc__）
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 耗时 {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_func():
    time.sleep(1)

slow_func()  # slow_func 耗时 1.0000s

# 带参数的装饰器
def repeat(n):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")

say_hello()  # 打印 3 次 Hello!

# 类装饰器
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"调用第 {self.count} 次")
        return self.func(*args, **kwargs)

@CountCalls
def greet():
    print("Hi!")

greet()  # 调用第 1 次
greet()  # 调用第 2 次
```

### functools 常用工具

```python
from functools import wraps, lru_cache, partial

# wraps — 保留被装饰函数的元信息（见装饰器章节）

# lru_cache — 缓存函数结果（记忆化）
@lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(100))  # 很快，因为结果被缓存

# partial — 部分应用（固定部分参数）
from functools import partial

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube = partial(power, exp=3)
print(square(5))  # 25
print(cube(5))    # 125

# reduce — 累积归约
from functools import reduce
result = reduce(lambda x, y: x + y, [1, 2, 3, 4])  # 10
product = reduce(lambda x, y: x * y, [1, 2, 3, 4])  # 24
```

### 生成器函数（yield）

使用 `yield` 返回数据的函数是生成器，每次只生成一个值，惰性求值。

```python
# 简单生成器
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for num in count_up_to(3):
    print(num)  # 1 2 3

# yield from — 委托给子生成器
def chain(*iterables):
    for it in iterables:
        yield from it

for item in chain([1, 2], (3, 4), "ab"):
    print(item)  # 1 2 3 4 a b

# 生成器表达式（语法更简洁）
squares = (x**2 for x in range(10))
next(squares)  # 0
next(squares)  # 1

# send() — 向生成器发送值
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value

acc = accumulator()
next(acc)        # 启动生成器
print(acc.send(10))  # 10
print(acc.send(20))  # 30
acc.close()
```
