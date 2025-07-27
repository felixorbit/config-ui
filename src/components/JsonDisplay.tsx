// src/components/JsonDisplay.tsx
import React, { useEffect } from 'react';
import type { FormData } from '../types';
import './JsonDisplay.css';

interface JsonDisplayProps {
  data: FormData | null;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  const [generatedJson, setGeneratedJson] = React.useState<string>('');
  const [copySuccess, setCopySuccess] = React.useState<string>('');

  // 当数据变化时自动更新JSON
  useEffect(() => {
    if (data) {
      try {
        const jsonString = JSON.stringify(data, null, 2);
        setGeneratedJson(jsonString);
      } catch (error) {
        console.error('Error generating JSON:', error);
        setGeneratedJson('Error generating JSON. Check console for details.');
      }
    } else {
      setGeneratedJson('No data to generate JSON from.');
    }
  }, [data]);

  const handleGenerateJson = () => {
    if (data) {
      try {
        const jsonString = JSON.stringify(data, null, 2);
        setGeneratedJson(jsonString);
        setCopySuccess('');
      } catch (error) {
        console.error('Error generating JSON:', error);
        setGeneratedJson('Error generating JSON. Check console for details.');
      }
    } else {
      setGeneratedJson('No data to generate JSON from.');
    }
  };

  const handleCopyJson = () => {
    if (generatedJson) {
      navigator.clipboard.writeText(generatedJson)
        .then(() => {
          setCopySuccess('已复制到剪贴板！');
          setTimeout(() => setCopySuccess(''), 2000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          setCopySuccess('复制失败，请重试');
        });
    }
  };

  const handleExportJson = () => {
    if (generatedJson) {
      const blob = new Blob([generatedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="json-display">
      <h2>JSON 数据预览</h2>
      <div className="json-actions">
        <button onClick={handleGenerateJson}>刷新 JSON</button>
        {generatedJson && (
          <>
            <button onClick={handleCopyJson}>复制 JSON</button>
            <button onClick={handleExportJson}>导出 JSON</button>
            {copySuccess && <span className="copy-message">{copySuccess}</span>}
          </>
        )}
      </div>
      {generatedJson && (
        <pre>
          <code>{generatedJson}</code>
        </pre>
      )}
    </div>
  );
};

export default JsonDisplay;