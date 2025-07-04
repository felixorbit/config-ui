// src/components/FormDataFiller.tsx
import React, { useEffect } from 'react';
import type { FormConfig, FormData, ObjectFieldConfig, ArrayElementConfig, FieldType, ArrayConfig, ObjectConfig } from '../types';
// import './FormDataFiller.css'; // 样式文件后续创建

interface FormDataFillerProps {
  config: FormConfig | null;
  formData: FormData | null;
  onDataChange: (data: FormData) => void; // 数据变化时的回调
}

// 初始化表单数据
const initializeDataFromConfig = (currentConfig: FormConfig): any => {
    if ('type' in currentConfig && currentConfig.type === 'object') {
      const objData: { [key: string]: any } = {};
      currentConfig.fields.forEach(field => {
        objData[field.keyName] = getDefaultValue(field.type, field.nestedObjectConfig, field.nestedArrayConfig);
      });
      return objData;
    } else if ('type' in currentConfig && currentConfig.type === 'array') {
      return []; 
    }
    return undefined;
  };

// 获取表单字段默认值
const getDefaultValue = (type: FieldType, objConfig?: ObjectConfig, arrConfig?: ArrayConfig): any => {
  switch (type) {
    case 'string': return '';
    case 'number': return 0;
    case 'boolean': return false;
    case 'object': return objConfig ? initializeDataFromConfig(objConfig) : {};
    case 'array': return arrConfig ? initializeDataFromConfig(arrConfig) : [];
    default: return undefined;
  }
};

const FormDataFiller: React.FC<FormDataFillerProps> = ({ config, formData, onDataChange }) => {

  useEffect(() => {
    if (config && !formData) {
      const initialData = initializeDataFromConfig(config);
      onDataChange(initialData);
    }
  }, [config, formData, onDataChange]);


  // 根据路径获取表单字段值
  const getFieldValue = (data: any, path: string[]): any => {
    let current = data;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else if (Array.isArray(current) && !isNaN(Number(key)) && Number(key) < current.length) {
        current = current[Number(key)];
      } else {
        return undefined; // Path does not exist
      }
    }
    return current;
  };

  // 处理字段值变化
  const handleInputChange = (path: string[], value: any) => {
    const newData = JSON.parse(JSON.stringify(formData)); // Deep copy
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      const currentPathElement = path[i];
      const nextPathElement = path[i+1];
      if (current[currentPathElement] === undefined || current[currentPathElement] === null) {
        // If path doesn't exist, create it. Check if next path element is a number to decide between object and array.
        current[currentPathElement] = isNaN(Number(nextPathElement)) ? {} : [];
      }
      current = current[currentPathElement];
    }
    current[path[path.length - 1]] = value;
    onDataChange(newData);
  };

  // 处理数组项添加
  const addArrayItem = (path: string[], itemConfig: ArrayConfig) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let parent = newData;
    for (let i = 0; i < path.length - 1; i++) {
      parent = parent[path[i]];
    }

    const arrayKey = path[path.length - 1];
    let currentArray = path.length === 0 ? newData : parent[arrayKey];

    if (!Array.isArray(currentArray)) {
      console.error('Target for addArrayItem is not an array:', path, currentArray);
      currentArray = [];
      if (path.length > 0) {
        parent[arrayKey] = currentArray;
      } else {
        // This case handles if the root formData itself is supposed to be an array but isn't.
        // However, with controlled component, parent should ensure it's an array if config is array type.
      }
    }

    currentArray.push(getDefaultValue(itemConfig.elementConfig.elementType, itemConfig.elementConfig.nestedObjectConfig, itemConfig.elementConfig.nestedArrayConfig));
    onDataChange(newData);
  };

  // 处理数组项删除
  const removeArrayItem = (path: string[], index: number) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;
    for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
    }

    if (Array.isArray(current)) {
        current.splice(index, 1);
        onDataChange(newData);
    }
  };

  // 渲染字段
  const renderField = (fieldConfig: ObjectFieldConfig, currentPath: string[]) => {
    const value = getFieldValue(formData, currentPath.concat(fieldConfig.keyName));

    switch (fieldConfig.type) {
      case 'string':
        return <input type="text" value={value || ''} onChange={(e) => handleInputChange(currentPath.concat(fieldConfig.keyName), e.target.value)} />;
      case 'number':
        return <input type="number" value={value || 0} onChange={(e) => handleInputChange(currentPath.concat(fieldConfig.keyName), parseFloat(e.target.value))} />;
      case 'boolean':
        return <input type="checkbox" checked={!!value} onChange={(e) => handleInputChange(currentPath.concat(fieldConfig.keyName), e.target.checked)} />;
      case 'object':
        return fieldConfig.nestedObjectConfig ? 
          renderForm(fieldConfig.nestedObjectConfig, currentPath.concat(fieldConfig.keyName)) :
          <span>Object configuration missing</span>;
      case 'array':
        return fieldConfig.nestedArrayConfig ? 
          renderArray(fieldConfig.nestedArrayConfig, currentPath.concat(fieldConfig.keyName)) : 
          <span>Array configuration missing</span>;
      default: return null;
    }
  };

  // 渲染数组元素
  const renderArrayElement = (elementConfig: ArrayElementConfig, itemData: any, itemPath: string[]) => {
    // Note: itemData is the actual data for the current array item.
    // itemPath is the path to this specific item in the overall formData.
    switch (elementConfig.elementType) {
      case 'string':
        return <input type="text" value={itemData || ''} onChange={(e) => handleInputChange(itemPath, e.target.value)} />;
      case 'number':
        return <input type="number" value={itemData || 0} onChange={(e) => handleInputChange(itemPath, parseFloat(e.target.value))} />;
      case 'boolean':
        return <input type="checkbox" checked={!!itemData} onChange={(e) => handleInputChange(itemPath, e.target.checked)} />;
      case 'object':
        return elementConfig.nestedObjectConfig ? 
          renderForm(elementConfig.nestedObjectConfig, itemPath) :
          <span>Object configuration missing</span>;
      case 'array': // Nested array
        return elementConfig.nestedArrayConfig ? 
          renderArray(elementConfig.nestedArrayConfig, itemPath) :
          <span>Nested array configuration missing</span>;
      default: return null;
    }
  };

  // 渲染数组
  const renderArray = (arrayConfig: ArrayConfig, currentPath: string[]) => {
    const arrayData = getFieldValue(formData, currentPath) || [];
    if (!Array.isArray(arrayData)) {
        console.warn(`Expected array at path ${currentPath.join('.')} but found:`, arrayData);
        // Attempt to recover or show error. For now, render nothing for this malformed part.
        return <span>Data at {currentPath.join('.')} is not an array.</span>;
    }

    return (
      <div className="array-filler-container">
        {arrayData.map((item: any, index: number) => (
          <div key={index} className="array-item-filler">
            {renderArrayElement(arrayConfig.elementConfig, item, currentPath.concat(index.toString()))}
            <button onClick={() => removeArrayItem(currentPath, index)}>删除项</button>
          </div>
        ))}
        <button onClick={() => addArrayItem(currentPath, arrayConfig)}>+ 添加项到 {currentPath[currentPath.length-1] || '数组'}</button>
      </div>
    );
  };

  const renderForm = (currentConfig: FormConfig, currentPath: string[] = []) => {
    if (!currentConfig) return <p>表单配置为空。</p>;

    if (currentConfig.type === 'object') {
      return (
        <div className="object-filler-container">
          {currentConfig.fields.map(field => (
            <div key={field.id || field.keyName} className="form-field-filler">
              <label>{field.fieldName || field.keyName}:</label>
              {renderField(field, currentPath)}
              {field.remark && <small> ({field.remark})</small>}
            </div>
          ))}
        </div>
      );
    } else if (currentConfig.type === 'array') {
      return renderArray(currentConfig, currentPath);
    }
    return <p>未知的表单类型。</p>; 
  };

  if (!config || !formData) {
    return <p>请先配置表单结构并初始化数据。</p>;
  }

  return (
    <div className="form-data-filler">
      <h2>2. 填写表单</h2>
      {renderForm(config)}
    </div>
  );
};

export { FormDataFiller, initializeDataFromConfig };