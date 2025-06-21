// src/components/FormFieldModal.tsx
import React, { useState, useEffect } from 'react';
import type { ObjectFieldConfig, FieldType, ArrayElementConfig, ArrayConfig, ObjectConfig } from '../types';
import ObjectConfigurator from './ObjectConfigurator';
import ArrayConfigurator from './ArrayConfigurator';

interface FormFieldModalProps {
  field: Partial<ObjectFieldConfig>; // Partial for new field, full for editing
  onClose: () => void; // 关闭模态框回调
  onSave: (field: ObjectFieldConfig) => void; // 保存字段配置回调
  existingKeys: string[]; // 用于校验 keyName 是否重复 (编辑时排除自身)
  path: string; // 当前配置路径，用于生成唯一 ID
}

const FormFieldModal: React.FC<FormFieldModalProps> = ({ field, onClose, onSave, existingKeys, path }) => {
  const [fieldName, setFieldName] = useState(field.fieldName || '');    // 字段名
  const [keyName, setKeyName] = useState(field.keyName || '');          // Key
  const [type, setType] = useState<FieldType>(field.type || 'string');  // 字段类型
  const [remark, setRemark] = useState(field.remark || '');             // 备注
  const [keyError, setKeyError] = useState('');

  const [nestedObjectConfig, setNestedObjectConfig] = useState<ObjectConfig | undefined>(
    field.type === 'object' ? field.nestedObjectConfig : undefined
  );
  const [nestedArrayConfig, setNestedArrayConfig] = useState<ArrayConfig | undefined>(
    field.type === 'array' ? field.nestedArrayConfig : undefined
  );

  useEffect(() => {
    // Initialize nested configs if type changes or on initial load for an existing complex field
    if (type === 'object' && !nestedObjectConfig) {
      setNestedObjectConfig(field.nestedObjectConfig || { type: 'object', fields: [] });
      setNestedArrayConfig(undefined);
    } else if (type === 'array' && !nestedArrayConfig) {
      setNestedArrayConfig(field.nestedArrayConfig || { type: 'array', elementConfig: { elementType: 'string' } });
      setNestedObjectConfig(undefined);
    } else if (type !== 'object' && type !== 'array'){
      setNestedObjectConfig(undefined);
      setNestedArrayConfig(undefined);
    }
  }, [type, field.nestedObjectConfig, field.nestedArrayConfig, nestedObjectConfig, nestedArrayConfig]);

  const handleSave = () => {
    if (!keyName.trim()) {
      setKeyError('Key 不能为空');
      return;
    }
    if (existingKeys.includes(keyName.trim()) && keyName.trim() !== field.keyName) {
      setKeyError('Key 已存在，请使用其他 Key');
      return;
    }
    setKeyError('');

    const newFieldData: ObjectFieldConfig = {
      id: field.id || `${path}-field-${keyName.trim()}`,
      fieldName: fieldName.trim() || keyName.trim(), // 如果字段名为空，使用 key 作为字段名
      keyName: keyName.trim(),
      type,
      remark: remark.trim(),
      nestedObjectConfig: type === 'object' ? nestedObjectConfig : undefined,
      nestedArrayConfig: type === 'array' ? nestedArrayConfig : undefined,
    };
    onSave(newFieldData);
  };

  const handleTypeChange = (newType: FieldType) => {
    setType(newType);
    if (newType === 'object') {
      setNestedObjectConfig(current => current || { type: 'object', fields: [] });
      setNestedArrayConfig(undefined);
    } else if (newType === 'array') {
      setNestedArrayConfig(current => current || { type: 'array', elementConfig: { elementType: 'string' } });
      setNestedObjectConfig(undefined);
    } else {
      setNestedObjectConfig(undefined);
      setNestedArrayConfig(undefined);
    }
  };
  
  const handleNestedObjectConfigChange = (updatedFields: ObjectFieldConfig[]) => {
    if (type === 'object') {
      setNestedObjectConfig({ type: 'object', fields: updatedFields });
    }
  };

  const handleNestedArrayConfigChange = (updatedElementConfig: ArrayElementConfig) => {
    if (type === 'array') {
      setNestedArrayConfig({ type: 'array', elementConfig: updatedElementConfig });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{field.id ? '编辑字段' : '新增字段'}</h3>
        <div>
          <label>字段名:</label>
          <input type="text" value={fieldName} onChange={(e) => setFieldName(e.target.value)} />
        </div>
        <div>
          <label>Key:</label>
          <input type="text" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
          {keyError && <p style={{ color: 'red' }}>{keyError}</p>}
        </div>
        <div>
          <label>类型:</label>
          <select value={type} onChange={(e) => handleTypeChange(e.target.value as FieldType)}>
            <option value="string">字符串 (String)</option>
            <option value="number">数字 (Number)</option>
            <option value="boolean">布尔 (Boolean)</option>
            <option value="object">对象 (Object)</option>
            <option value="array">数组 (Array)</option>
          </select>
        </div>
        <div>
          <label>备注:</label>
          <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
        </div>

        {type === 'object' && nestedObjectConfig && (
          <div style={{ marginTop: '15px', paddingLeft: '15px', borderLeft: '2px solid #eee' }}>
            <h4>配置嵌套对象:</h4>
            <ObjectConfigurator 
              config={nestedObjectConfig} 
              onFieldsChange={handleNestedObjectConfigChange} 
              path={`${path}.${keyName || 'newObjectField'}`}
            />
          </div>
        )}
        {type === 'array' && nestedArrayConfig && (
          <div style={{ marginTop: '15px', paddingLeft: '15px', borderLeft: '2px solid #eee' }}>
            <h4>配置嵌套数组元素:</h4>
            <ArrayConfigurator 
              config={nestedArrayConfig} 
              onElementConfigChange={handleNestedArrayConfigChange} 
              path={`${path}.${keyName || 'newArrayField'}`}
            />
          </div>
        )}

        <button onClick={handleSave}>保存</button>
        <button onClick={onClose}>取消</button>
      </div>
    </div>
  );
};

export default FormFieldModal;