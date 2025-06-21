// src/App.tsx
import { useState } from 'react';
import FormConfigurator from './components/FormConfigurator';
import FormDataFiller from './components/FormDataFiller';
import JsonDisplay from './components/JsonDisplay';
import type { FormConfig, FormData } from './types';
import './App.css'; // 主应用样式

function App() {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleConfigChange = (config: FormConfig) => {
    setFormConfig(config);
    // 当配置改变时，重置已填写的数据
    setFormData(null); 
  };

  const handleDataChange = (data: FormData) => {
    setFormData(data);
  };

  return (
    <div className="app-container">
      <header>
        <h1>可视化 JSON 生成工具</h1>
      </header>
      <main className="main-content">
        <section className="config-section">
          <FormConfigurator onConfigChange={handleConfigChange} />
        </section>
        <section className="filler-section">
          <FormDataFiller config={formConfig} onDataChange={handleDataChange} />
        </section>
        <section className="display-section">
          <JsonDisplay data={formData} />
        </section>
      </main>
      <footer>
        <p>JSON Configurator UI</p>
      </footer>
    </div>
  );
}

export default App;
