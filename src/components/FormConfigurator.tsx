// src/components/FormConfigurator.tsx
import React, { useState, useEffect } from 'react';
import type { FormConfig, InitialFormType } from '../types';
import ObjectConfigurator from './ObjectConfigurator';
import ArrayConfigurator from './ArrayConfigurator';
import './Modal.css'; // 模态框样式

// 导入/导出模态框组件
import ExportConfigModal from './ExportConfigModal'; 
import ImportConfigModal from './ImportConfigModal';

interface FormConfiguratorProps {
  onConfigChange: (config: FormConfig) => void; // 配置变更回调
}

const FormConfigurator: React.FC<FormConfiguratorProps> = ({ onConfigChange }) => {
  const [initialType, setInitialType] = useState<InitialFormType | null>(null);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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

  const handleShare = () => {
    if (config) {
      try {
        const configString = JSON.stringify(config);
        const encodedConfig = btoa(encodeURIComponent(configString));
        const url = `${window.location.origin}${window.location.pathname}?config=${encodedConfig}`;
        navigator.clipboard.writeText(url).then(() => {
          alert('分享链接已复制到剪贴板！');
        });
      } catch (error) {
        console.error('创建分享链接失败:', error);
        alert('创建分享链接失败。');
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const configData = params.get('config');
    if (configData) {
      try {
        const decodedConfig = decodeURIComponent(atob(configData));
        const parsedConfig = JSON.parse(decodedConfig);
        if (parsedConfig && typeof parsedConfig === 'object' && 'type' in parsedConfig) {
          setConfig(parsedConfig as FormConfig);
          setInitialType(parsedConfig.type);
          onConfigChange(parsedConfig as FormConfig);
        }
      } catch (error) {
        console.error('解析分享链接中的配置失败:', error);
      }
    }
  }, []);

  return (
    <div className="form-configurator">
      <h2>1. 配置表单</h2>
      
      <div className="config-actions">
        <button onClick={() => setShowImportModal(true)}>导入配置</button>
        <button onClick={() => setShowExportModal(true)}>导出配置</button>
        <button onClick={handleShare}>分享</button>
      </div>

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

      {/* 导出配置模态框 */}
      {showExportModal && (
        <ExportConfigModal 
          config={config}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* 导入配置模态框 */}
      {showImportModal && (
        <ImportConfigModal 
          onImport={(newConfig) => {
            setConfig(newConfig);
            onConfigChange(newConfig);
            // 根据导入的配置类型，可能需要更新 initialType
            if (newConfig.type) {
              setInitialType(newConfig.type);
            }
            setShowImportModal(false);
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

export default FormConfigurator;