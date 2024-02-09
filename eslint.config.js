import { common, modules, node, extend, stylistic, ignores, typescript } from "@hazmi35/eslint-config";

export default [
    ...extend(common, [
        {
            rule: "id-length",
            option: ["off"]
        },
        {
            rule: "no-return-assign",
            option: ["off"]
        }
    ]),
    ...modules,
    ...node,
    ...stylistic,
    ...extend(typescript, [
        {
            rule: "@typescript-eslint/no-unnecessary-condition",
            option: ["off"]
        },
        {
            rule: "@typescript-eslint/no-unsafe-declaration-merging",
            option: ["off"]
        },
        {
            rule: "@typescript-eslint/no-base-to-string",
            option: ["off"]
        },
        {
            rule: "@typescript-eslint/naming-convention",
            option: ["off"]
        }
    ]),
    ...ignores
];
