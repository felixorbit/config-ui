import React, { useState } from 'react';
import type { FormConfig } from '../types';
import './Modal.css';

interface ImportConfigModalProps {
  onImport: (config: FormConfig) => void;
  onClose: () => void;
}

const ImportConfigModal: React.FC<ImportConfigModalProps> = ({ onImport, onClose }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    if (!jsonInput.trim()) {
      setError('请输入 JSON 配置');
      return;
    }
    try {
      const parsedConfig = JSON.parse(jsonInput);
      // 在这里可以添加更复杂的验证逻辑，确保配置结构符合 FormConfig 类型
      if (typeof parsedConfig === 'object' && parsedConfig !== null && ('type' in parsedConfig)) {
        onImport(parsedConfig as FormConfig);
      } else {
        throw new Error('无效的配置格式');
      }
    } catch (e) {
      setError('JSON 解析失败或配置格式不正确，请检查输入。');
      console.error(e);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setJsonInput(text);
          setError(''); // 清除旧的错误信息
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>导入配置</h2>
        <p>在下方粘贴 JSON 或上传配置文件。</p>
        <textarea 
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='在此处粘贴 JSON 配置...'
          style={{ width: '100%', height: '250px' }}
        />
        <input type="file" accept=".json" onChange={handleFileChange} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="modal-actions">
          <button onClick={handleImport}>导入</button>
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default ImportConfigModal;