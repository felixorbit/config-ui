// src/components/ArrayConfigurator.tsx
import React, { useState, useEffect } from 'react';
import type { ArrayElementConfig, FieldType, FormConfig, ObjectFieldConfig, ArrayConfig, ObjectConfig } from '../types';
import ObjectConfigurator from './ObjectConfigurator';
// Recursive import: ArrayConfigurator imports itself for nested arrays.
// This is fine in React if structured correctly (e.g. default export and named import if needed)
// or by ensuring the component can handle its own recursive rendering through props.
// For simplicity, we'll assume the direct import works as React handles module resolution.
import ArrayConfiguratorSelf from './ArrayConfigurator'; 

interface ArrayConfiguratorProps {
  config: ArrayConfig;
  onElementConfigChange: (config: ArrayElementConfig) => void; // 数组元素配置变更回调
  path?: string; // 用于追踪嵌套路径
}

const ArrayConfigurator: React.FC<ArrayConfiguratorProps> = ({ config, onElementConfigChange, path = 'root' }) => {
  const [elementType, setElementType] = useState<FieldType>(config.elementConfig.elementType);
  const [nestedObjectConfig, setNestedObjectConfig] = useState<ObjectConfig| undefined>(
    config.elementConfig.elementType === 'object'  ? config.elementConfig.nestedObjectConfig : undefined
  );
  const [nestedArrayConfig, setNestedArrayConfig] = useState<ArrayConfig | undefined>(
    config.elementConfig.elementType === 'array' ? config.elementConfig.nestedArrayConfig : undefined
  );

  useEffect(() => {
    setElementType(config.elementConfig.elementType);
  }, [config]);

  const handleElementTypeChange = (newType: FieldType) => {
    setElementType(newType);
    let newElementConfig: ArrayElementConfig = { elementType: newType };

    if (newType === 'object') {
      const defaultObjectConfig: Extract<FormConfig, { type: 'object' }> = { type: 'object', fields: [] };
      setNestedObjectConfig(defaultObjectConfig);
      setNestedArrayConfig(undefined);
      newElementConfig = { ...newElementConfig, nestedObjectConfig: defaultObjectConfig };
    } else if (newType === 'array') {
      const defaultArrayConfig: ArrayConfig = { type: 'array', elementConfig: { elementType: 'string' } }; // 默认嵌套数组元素为 string
      setNestedArrayConfig(defaultArrayConfig);
      setNestedObjectConfig(undefined);
      newElementConfig = { ...newElementConfig, nestedArrayConfig: defaultArrayConfig };
    } else {
      setNestedObjectConfig(undefined);
      setNestedArrayConfig(undefined);
    }
    onElementConfigChange(newElementConfig);
  };

  const handleNestedObjectConfigChange = (updatedFields: ObjectFieldConfig[]) => {
    if (elementType === 'object') {
      const newNestedConfig: ObjectConfig = { type: 'object', fields: updatedFields };
      setNestedObjectConfig(newNestedConfig);
      onElementConfigChange({ elementType, nestedObjectConfig: newNestedConfig });
    }
  };

  const handleNestedArrayConfigChange = (updatedElementConfig: ArrayElementConfig) => {
    if (elementType === 'array') {
      const newNestedConfig: ArrayConfig = { type: 'array', elementConfig: updatedElementConfig };
      setNestedArrayConfig(newNestedConfig);
      onElementConfigChange({ elementType, nestedArrayConfig: newNestedConfig});
    }
  };

  return (
    <div className="array-configurator">
      <h4>配置数组元素类型:</h4>
      <select value={elementType} onChange={(e) => handleElementTypeChange(e.target.value as FieldType)}>
        <option value="string">字符串 (String)</option>
        <option value="number">数字 (Number)</option>
        <option value="boolean">布尔 (Boolean)</option>
        <option value="object">对象 (Object)</option>
        <option value="array">数组 (Array)</option>
      </select>

      {elementType === 'object' && nestedObjectConfig && (
        <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
          <ObjectConfigurator 
            config={nestedObjectConfig} 
            onFieldsChange={handleNestedObjectConfigChange} 
            path={`${path}.elements`}
          />
        </div>
      )}
      {elementType === 'array' && nestedArrayConfig && (
        <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
          <ArrayConfiguratorSelf 
            config={nestedArrayConfig} 
            onElementConfigChange={handleNestedArrayConfigChange} 
            path={`${path}.elements`}
          />
        </div>
      )}
    </div>
  );
};

export default ArrayConfigurator;