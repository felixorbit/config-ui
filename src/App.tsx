// src/App.tsx
import { useState, useEffect } from 'react';
import { FormConfigurator } from './components/FormConfigurator';
import { FormDataFiller, initializeDataFromConfig } from './components/FormDataFiller';
import JsonDisplay from './components/JsonDisplay';
import type { FormConfig, FormData } from './types';
import './App.css'; // 主应用样式

function App() {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'fill'>('config');

  // 从URL获取当前标签页
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'fill') {
      setActiveTab('fill');
    } else {
      setActiveTab('config');
    }
  }, []);

  // 更新URL以反映当前标签页
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab]);

  const handleConfigChange = (config: FormConfig) => {
    setFormConfig(config);
    // 根据新配置初始化表单数据
    const initialData = initializeDataFromConfig(config);
    setFormData(initialData);
  };

  const handleDataChange = (data: FormData) => {
    setFormData(data);
  };

  return (
    <div className="app-container">
      <header>
        <h1>可视化 JSON 生成工具</h1>
      </header>
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            表单配置
          </button>
          <button 
            className={`tab-button ${activeTab === 'fill' ? 'active' : ''}`}
            onClick={() => setActiveTab('fill')}
          >
            表单填写
          </button>
        </div>
      </div>
      <main className="main-content">
        <div className="content-wrapper">
          {activeTab === 'config' && (
            <section className="config-section">
              <FormConfigurator config={formConfig} onConfigChange={handleConfigChange} />
            </section>
          )}
          {activeTab === 'fill' && (
            <>
              <section className="filler-section">
                <FormDataFiller config={formConfig} formData={formData} onDataChange={handleDataChange} />
              </section>
              <section className="display-section">
                <JsonDisplay data={formData} />
              </section>
            </>
          )}
        </div>
      </main>
      <footer>
        <p>JSON Configurator UI</p>
      </footer>
    </div>
  );
}

export default App;
