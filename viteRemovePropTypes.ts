import { PluginOption } from "vite";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate, { GeneratorResult } from "@babel/generator";
import * as t from "@babel/types";

interface removePropTypesParams {
  include?: RegExp|RegExp[];
  exclude?: RegExp|RegExp[];
}

/**
 * xxx.propsTypes = {name: React.PropTypes.string, ....} -> xxx.propsType = {}
 * React has move React.PropTypes to lib 'prop-types' since v15.5.0, but some old libs haven't change the code
 * NOTICE:
 * eq: A.propsTypes = {...}
 * this plugin doesn't follow the reference link to check whether A is a react component yet.
 * it's a time-consuming job and i don't have enough time now..
 * todo::
 * check whether A is a react component
 */

const removePropTypes = (params?: removePropTypesParams): PluginOption => {
  const { include = /\.tsx?$/, exclude = [] } = params || {};
  const includeArr = ([] as RegExp[]).concat(include);
  const excludeArr = ([] as RegExp[]).concat(exclude);
  const checkFilePath = (filePath: string) => {
    return includeArr.some(reg => reg.test(filePath))
            && excludeArr.every(reg => !(reg.test(filePath)));
  };

  const getMemberPath = (item: t.MemberExpression|t.Identifier) => {
    if (t.isIdentifier(item)) {
     return [item.name];
    }
    if (!t.isMemberExpression(item)) {
     return [];
    }
    return getMemberPath(item.object as t.MemberExpression).concat(getMemberPath(item.property as t.Identifier));
  };
  return {
    name: "remove-prop-types",
    transform: async (code: string, id: string) => {
			let newCode = code;
			let sourcemap: GeneratorResult["map"] = null;
      if (!checkFilePath(id)) {
       return {
        code: newCode,
        map: sourcemap
       };
      }

      const ast = parser.parse(code, {
        sourceType: "module",
        sourceFilename: id
      });

      traverse(ast, {
        AssignmentExpression: (path) => {
          if (!t.isMemberExpression(path.node.left)) {
           return;
          }
          const properties = getMemberPath(path.node.left);
          if (!properties.includes("propTypes")) {
            return;
          }
          if (t.isObjectExpression(path.node.right) && path.node.right.properties.length) {
            path.node.right = t.objectExpression([]);
          }
        }
      });

      const output = generate(ast);
      return output;
    }
  };
};

export { removePropTypes };
