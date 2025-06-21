// src/components/FormConfigurator.tsx
import React, { useState } from 'react';
import type { FormConfig, InitialFormType } from '../types';
import ObjectConfigurator from './ObjectConfigurator';
import ArrayConfigurator from './ArrayConfigurator';
// import './FormConfigurator.css'; // 样式文件后续创建

interface FormConfiguratorProps {
  onConfigChange: (config: FormConfig) => void; // 配置变更回调
}

const FormConfigurator: React.FC<FormConfiguratorProps> = ({ onConfigChange }) => {
  const [initialType, setInitialType] = useState<InitialFormType | null>(null);
  const [config, setConfig] = useState<FormConfig | null>(null);

  const handleInitialTypeSelect = (type: InitialFormType) => {
    setInitialType(type);
    if (type === 'object') {
      const newConfig: FormConfig = { 
        type: 'object', 
        fields: [] 
      };
      setConfig(newConfig);
      onConfigChange(newConfig);
    } else if (type === 'array') {
      const newConfig: FormConfig = { 
        type: 'array', 
        elementConfig: { elementType: 'string' } // 默认数组元素类型为 string
      };
      setConfig(newConfig);
      onConfigChange(newConfig);
    }
  };

  // 后续将在此处添加对象和数组配置器的渲染逻辑

  return (
    <div className="form-configurator">
      <h2>1. 配置表单</h2>
      {!initialType && (
        <div>
          <p>请选择表单的根类型：</p>
          <button onClick={() => handleInitialTypeSelect('object')}>对象 (Object)</button>
          <button onClick={() => handleInitialTypeSelect('array')}>数组 (Array)</button>
        </div>
      )}

      {config && config.type === 'object' && (
        <ObjectConfigurator 
          config={config} 
          onFieldsChange={(fields) => {
            const newConfig: FormConfig = { type: 'object', fields };
            setConfig(newConfig);
            onConfigChange(newConfig);
          }}
        />
      )}
      {config && config.type === 'array' && (
        <ArrayConfigurator 
          config={config} 
          onElementConfigChange={(elementConfig) => {
            const newConfig: FormConfig = { type: 'array', elementConfig };
            setConfig(newConfig);
            onConfigChange(newConfig);
          }}
        />
      )}

      {config && (
        <div>
          <h3>当前配置预览:</h3>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FormConfigurator;