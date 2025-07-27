// src/components/ObjectConfigurator.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { ObjectFieldConfig, ObjectConfig, ArrayConfig } from '../types';
import ArrayConfigurator from './ArrayConfigurator';
import FormFieldModal from './FormFieldModal';
import './ObjectConfigurator.css';

interface ObjectConfiguratorProps {
  config: ObjectConfig;
  onFieldsChange: (fields: ObjectFieldConfig[]) => void; // 字段变更回调
  path?: string; // 用于追踪嵌套路径，方便调试和唯一 ID 生成
}

const ObjectConfigurator: React.FC<ObjectConfiguratorProps> = ({ config, onFieldsChange, path = 'root' }) => {
  const [fields, setFields] = useState<ObjectFieldConfig[]>(config.fields);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Partial<ObjectFieldConfig> | null>(null); // Partial for new field
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setFields(config.fields);
    // 重置引用数组大小以匹配字段数量
    fieldRefs.current = fieldRefs.current.slice(0, config.fields.length);
  }, [config]);

  // 新增字段打开模态框
  const handleOpenModalForNew = () => {
    setEditingField({}); // Empty object for a new field
    setEditingFieldIndex(null); // No index for new field
    setIsModalOpen(true);
  };

  // 编辑字段打开模态框
  const handleOpenModalForEdit = (index: number) => {
    setEditingField(fields[index]);
    setEditingFieldIndex(index);
    setIsModalOpen(true);
  };

  // 删除字段
  const handleDeleteField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    onFieldsChange(updatedFields);
    // Also close modal if it was open for this action, though typically save is separate
    // setIsModalOpen(false); 
  };

  const handleFieldUpdate = (index: number, updatedFieldConfig: ObjectFieldConfig) => {
    const updatedFields = [...fields];
    updatedFields[index] = updatedFieldConfig;
    setFields(updatedFields);
    onFieldsChange(updatedFields);
  };
  
  // 处理拖拽开始
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    // 如果有有效的拖拽和放置索引
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // 创建字段的新顺序
      const updatedFields = [...fields];
      const [draggedField] = updatedFields.splice(draggedIndex, 1);
      updatedFields.splice(dragOverIndex, 0, draggedField);
      
      // 更新状态并触发回调
      setFields(updatedFields);
      onFieldsChange(updatedFields);
    }
    
    // 重置拖拽状态
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 处理拖拽经过
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // 允许放置
    setDragOverIndex(index);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragEnd();
  };

  // 嵌套对象或数组的配置更新回调
  const handleNestedConfigChange = (fieldIndex: number, nestedConfig: ObjectConfig | ArrayConfig) => {
    const fieldToUpdate = fields[fieldIndex];
    let updatedField: ObjectFieldConfig;

    if (fieldToUpdate.type === 'object' && 'type' in nestedConfig && nestedConfig.type === 'object') {
      updatedField = { ...fieldToUpdate, nestedObject: nestedConfig as ObjectConfig };
    } else if (fieldToUpdate.type === 'array' && 'type' in nestedConfig && nestedConfig.type === 'array') {
      updatedField = { ...fieldToUpdate, nestedArray: nestedConfig as ArrayConfig };
    } else {
      console.error('Mismatched types in handleNestedConfigChange');
      return;
    }
    handleFieldUpdate(fieldIndex, updatedField);
  };


  return (
    <div className="object-configurator">
      <h4>配置对象字段:</h4>
      {fields.map((field, index) => (
        <div 
          key={field.id} 
          className={`field-config-item ${dragOverIndex === index ? 'drag-over' : ''}`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          ref={(el) => { fieldRefs.current[index] = el; }}
        >
          <div className="field-header">
            <span className="drag-handle" title="拖动调整顺序">⋮⋮</span>
            <span>{field.name} ({field.key}): {field.type}</span>
            <div className="field-actions">
              <button onClick={() => handleOpenModalForEdit(index)}>编辑</button>
              <button className="delete" onClick={() => handleDeleteField(index)}>删除</button>
            </div>
          </div>
          {field.type === 'object' && (
            <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
              <ObjectConfigurator 
                config={field.nestedObject || { type: 'object', fields: [] }} 
                onFieldsChange={(updatedNestedFields) => handleNestedConfigChange(index, { type: 'object', fields: updatedNestedFields })} 
                path={`${path}.${field.key}`}
              />
            </div>
          )}
          {field.type === 'array' && (
            <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
              <ArrayConfigurator 
                config={field.nestedArray || { type: "array", element: { type: 'string' } }} 
                onElementChange={(updatedElementConfig) => handleNestedConfigChange(index, { type: "array", element: updatedElementConfig })} 
                path={`${path}.${field.key}`}
              />
            </div>
          )}
        </div>
      ))}
      <button onClick={handleOpenModalForNew}>+ 添加字段</button>

      {isModalOpen && (
        <FormFieldModal
          field={editingField || {}} // Pass empty object if editingField is null (for new field)
          onClose={() => {
            setIsModalOpen(false);
            setEditingField(null);
            setEditingFieldIndex(null);
          }}
          onSave={(savedField) => {
            let updatedFields;
            if (editingFieldIndex !== null) { // Editing existing field
              updatedFields = [...fields];
              updatedFields[editingFieldIndex] = savedField;
            } else { // Adding new field
              updatedFields = [...fields, savedField];
            }
            setFields(updatedFields);
            onFieldsChange(updatedFields);
            setIsModalOpen(false);
            setEditingField(null);
            setEditingFieldIndex(null);
          }}
          existingKeys={fields
            .map(f => f.key)
            .filter(k => editingField && k !== editingField.key) // Exclude current field's key if editing
          }
          path={path}
        />
      )}
    </div>
  );
};

export default ObjectConfigurator;