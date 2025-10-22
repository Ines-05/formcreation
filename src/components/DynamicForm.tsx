'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDefinition, FormSubmission, FormField } from '@/lib/types';

interface DynamicFormProps {
  formDefinition: FormDefinition;
  onSubmit: (data: FormSubmission) => void;
  isSubmitting?: boolean;
}

export function DynamicForm({ formDefinition, onSubmit, isSubmitting = false }: DynamicFormProps) {
  const [formData, setFormData] = useState<FormSubmission>({});

  const handleInputChange = (fieldId: string, value: string | string[] | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const stringValue = typeof value === 'string' ? value : typeof value === 'number' ? value.toString() : '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              value={stringValue}
              onChange={(e) => {
                const newValue = field.type === 'number' ? Number(e.target.value) : e.target.value;
                handleInputChange(field.id, newValue);
              }}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              required={field.required}
              value={stringValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              rows={4}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
            <Select onValueChange={(value) => handleInputChange(field.id, value)}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Sélectionnez ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label} {field.required && '*'}</Label>
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.id}-${option}`}
                    name={field.id}
                    value={option}
                    checked={formData[field.id] === option}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label} {field.required && '*'}</Label>
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${field.id}-${option}`}
                    value={option}
                    checked={(formData[field.id] as string[] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = formData[field.id] as string[] || [];
                      if (e.target.checked) {
                        handleInputChange(field.id, [...currentValues, option]);
                      } else {
                        handleInputChange(field.id, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{formDefinition.title}</CardTitle>
        {formDefinition.description && (
          <CardDescription>{formDefinition.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formDefinition.fields.map(renderField)}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}