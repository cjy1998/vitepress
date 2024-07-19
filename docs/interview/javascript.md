# javaScript
## 求两个数组的交集
### 方法一：使用filter和includes
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const intersection = arr1.filter(item => arr2.includes(item));
console.log(intersection); // [4, 5]
```
### 方法二：使用Set数据结构
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const intersection = Array.from(new Set([...set1].filter(x => set2.has(x))));
console.log(intersection); // [4, 5]
```
### 方法三：使用循环
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const intersection = [];
or (let item of array1) {
  if (array2.includes(item) &&!intersection.includes(item)) {
    intersection.push(item);
  }
}
console.log(intersection); // [4, 5]
```
## 求两个数组的并集
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const union = [...new Set([...arr1, ...arr2])];
console.log(union); // [1, 2, 3, 4, 5, 6, 7, 8]
```
## 求两个对象数组的交集
### 方法一：使用 filter 方法和 some 方法
```js
const arr1 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const arr2 = [{ id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }];
const intersection = arr1.filter(item => arr2.some(obj => obj.id === item.id));
console.log(intersection); // [{ id: 2, name: 'Bob' }]
```
### 方法二：使用 reduce 方法
```js
const intersection = arr1.reduce((acc, obj1) => {
  if (arr2.some(obj2 => obj1.id === obj2.id)) {
    acc.push(obj1);
  }
  return acc;
}, []);
console.log(intersection);
```
### 方法三：先将对象数组转换为以对象的某个属性（如 id）为键的对象，然后再进行比较
```js
const obj1 = arr1.reduce((acc, obj) => ({...acc, [obj.id]: obj}), {});
const obj2 = arr2.reduce((acc, obj) => ({...acc, [obj.id]: obj}), {});

const intersection = Object.entries(obj1).filter(([key, value]) => obj2[key]).map(([key, value]) => value);
console.log(intersection);
```