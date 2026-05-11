import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  isTextArea?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  readonly = false,
  required = false,
  isTextArea = false,
}) => {
  const { isRTL } = useLanguage();

  const baseClasses = `
    w-full bg-natural-bg border border-sage-border rounded-xl px-4 py-3 
    text-natural-text placeholder-sage-medium/50 
    focus:outline-none focus:ring-1 focus:ring-sage-light focus:border-sage-light
    transition-all duration-200 text-sm
    ${readonly ? 'opacity-70 bg-sage-border/10 cursor-not-allowed font-bold' : ''}
    ${isRTL ? 'text-right' : 'text-left'}
    font-urdu-body
  `;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={name} 
        className={`block text-xs font-bold uppercase tracking-widest text-sage-medium font-urdu-title ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseClasses} min-h-[100px] resize-none`}
          readOnly={readonly}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
          readOnly={readonly}
          required={required}
        />
      )}
    </div>
  );
};

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, icon: Icon }) => {
  const { isRTL } = useLanguage();
  
  return (
    <div className="bg-white border border-sage-border rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {Icon && (
          <div className="p-2 bg-sage-light/10 rounded-lg text-sage-dark border border-sage-light/20">
            <Icon size={18} />
          </div>
        )}
        <h3 className="text-xl font-serif text-natural-text font-urdu-title">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
};
