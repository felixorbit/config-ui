import React from 'react';
import type { FormConfig } from '../types';
import './Modal.css'; // 模态框的通用样式

interface ExportConfigModalProps {
  config: FormConfig | null;
  onClose: () => void;
}

const ExportConfigModal: React.FC<ExportConfigModalProps> = ({ config, onClose }) => {
  const configJson = JSON.stringify(config, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(configJson).then(() => {
      alert('配置已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败: ', err);
      alert('复制失败，请手动复制。');
    });
  };

  const handleDownload = () => {
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>导出配置</h2>
        <textarea readOnly value={configJson} style={{ width: '100%', height: '300px' }} />
        <div className="modal-actions">
          <button onClick={handleCopy}>复制</button>
          <button onClick={handleDownload}>下载</button>
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default ExportConfigModal;