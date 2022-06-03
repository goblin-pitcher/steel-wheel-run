const lowbit = (n) => n & -n;

class TreeLikeArr {
  constructor(arr) {
    this.arr = Array(arr.length).fill(0);
    this.queryArr = Array(arr.length).fill(0);
    this.init(arr);
  }
  init(arr) {
    arr.forEach((val, idx) => {
      this.update(idx, val);
    });
  }
  update(index, val) {
    const diff = val - this.arr[index];
    this.arr[index] = val;
    for (let i = index + 1; i <= this.arr.length; i += lowbit(i)) {
      this.queryArr[i - 1] += diff;
    }
  }
  sum(n) {
    let ans = 0;
    for (let i = n + 1; i > 0; i -= lowbit(i)) {
      ans += this.queryArr[i - 1] || 0;
    }
    return ans;
  }
  // 左右都是闭合区间
  query(from, end) {
    if (!Number.isFinite(end)) {
      end = from;
      from = -1;
    }
    return this.sum(end) - this.sum(from);
  }
}
