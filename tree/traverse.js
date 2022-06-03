// interface TreeNode {
//   val: unknow;
//   left: TreeNode|null;
//   right: TreeNode|null
// }

const preorderTraverse = (root, visit) => {
  let checkItems = [root];
  while(checkItems.length) {
    const task = checkItems.shift();
    visit(task);
    const children = [task.left, task.right].filter(Boolean)
    checkItems = children.concat(checkItems)
  }
};

const inorderTraverse = (root, visit) => {
  const checkItems = []
  const pushDeepLeft = (node) => {
    while(node) {
      checkItems.push(node)
      node = node.left
    }
  }
  pushDeepLeft(root)
  while(checkItems.length) {
    const task = checkItems.pop();
    if(task.right) {
      pushDeepLeft(task.right)
    }
  }
};
/**
 * 分析：
 * 后续遍历时，先遍历左子节点再遍历右子节点，而父节点最后
 * 麻烦的地方是只有父->子的指针，没有指向兄弟节点的指针，因此需要转换思路
 * 我们需要的遍历方向是左子->右子->父，而【反过来】的顺序父->右子->左子就很熟悉了
 * 因此先按照父-> 右子 -> 左子遍历，然后反过来输出就行，流程类似于先序
 */
const postorderTraverse = (root, visit) => {
  const checkItems = [root]
  while(checkItems.length) {
    const task = checkItems.shift();
    visit(task);
    const children = [task.right, task.left].filter(Boolean)
    checkItems = children.concat(checkItems)
  }
};
