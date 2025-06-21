// src/components/ObjectConfigurator.tsx
import React, { useState } from 'react';
import type { ObjectFieldConfig, ObjectConfig, ArrayConfig } from '../types';
import ArrayConfigurator from './ArrayConfigurator';
import FormFieldModal from './FormFieldModal';

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

  // 嵌套对象或数组的配置更新回调
  const handleNestedConfigChange = (fieldIndex: number, nestedConfig: ObjectConfig | ArrayConfig) => {
    const fieldToUpdate = fields[fieldIndex];
    let updatedField: ObjectFieldConfig;

    if (fieldToUpdate.type === 'object' && 'type' in nestedConfig && nestedConfig.type === 'object') {
      updatedField = { ...fieldToUpdate, nestedObjectConfig: nestedConfig as ObjectConfig };
    } else if (fieldToUpdate.type === 'array' && 'type' in nestedConfig && nestedConfig.type === 'array') {
      updatedField = { ...fieldToUpdate, nestedArrayConfig: nestedConfig as ArrayConfig };
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
        <div key={field.id} className="field-config-item">
          <span>{field.fieldName} ({field.keyName}): {field.type}</span>
          <button onClick={() => handleOpenModalForEdit(index)}>编辑</button>
          <button onClick={() => handleDeleteField(index)}>删除</button>
          {field.type === 'object' && (
            <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
              <ObjectConfigurator 
                config={field.nestedObjectConfig || { type: 'object', fields: [] }} 
                onFieldsChange={(updatedNestedFields) => handleNestedConfigChange(index, { type: 'object', fields: updatedNestedFields })} 
                path={`${path}.${field.keyName}`}
              />
            </div>
          )}
          {field.type === 'array' && (
            <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
              <ArrayConfigurator 
                config={field.nestedArrayConfig || { type: "array", elementConfig: { elementType: 'string' } }} 
                onElementConfigChange={(updatedElementConfig) => handleNestedConfigChange(index, { type: "array", elementConfig: updatedElementConfig })} 
                path={`${path}.${field.keyName}`}
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
            .map(f => f.keyName)
            .filter(k => editingField && k !== editingField.keyName) // Exclude current field's key if editing
          }
          path={path}
        />
      )}
    </div>
  );
};

export default ObjectConfigurator;