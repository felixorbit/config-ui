// src/components/JsonDisplay.tsx
import React from 'react';
import type { FormData } from '../types';
// import './JsonDisplay.css'; // 样式文件后续创建

interface JsonDisplayProps {
  data: FormData | null;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  const [generatedJson, setGeneratedJson] = React.useState<string>('');

  const handleGenerateJson = () => {
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
  };

  return (
    <div className="json-display">
      <h2>3. 生成 JSON</h2>
      <button onClick={handleGenerateJson}>生成 JSON</button>
      {generatedJson && (
        <pre>
          <code>{generatedJson}</code>
        </pre>
      )}
    </div>
  );
};

export default JsonDisplay;