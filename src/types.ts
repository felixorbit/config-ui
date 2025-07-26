// src/types.ts

// 基本数据类型
export type BasicType = 'string' | 'number' | 'boolean';

// 复杂数据类型
export type ComplexType = 'object' | 'array';

// 所有支持的字段类型
export type FieldType = BasicType | ComplexType;

// 对象字段配置接口
export interface ObjectFieldConfig {
  id: string; // 唯一标识
  name: string; // 字段显示名称
  key: string; // 字段的 key
  type: FieldType;
  remark?: string; // 备注
  // 当 type 为 'object' 时，嵌套的对象配置
  nestedObject?: ObjectConfig;
  // 当 type 为 'array' 时，嵌套的数组元素类型配置
  nestedArray?: ArrayConfig;
}

// 数组元素配置接口
export interface ArrayElementConfig {
  type: FieldType;
  // 当 type 为 'object' 时，嵌套的对象配置
  nestedObject?: ObjectConfig;
  // 当 type 为 'array' 时，嵌套的数组元素类型配置 (支持多维数组)
  nestedArray?: ArrayConfig;
}

export interface ObjectConfig {
  type: 'object';
  fields: ObjectFieldConfig[];
}

export interface ArrayConfig {
  type: 'array';
  element: ArrayElementConfig;
}

// 表单配置接口
export type FormConfig = ObjectConfig | ArrayConfig;

// 初始表单类型选择
export type InitialFormType = 'object' | 'array';

// 用于表单填写的数据结构，将根据 FormConfig 动态生成
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormData = { [key: string]: any } | any[];