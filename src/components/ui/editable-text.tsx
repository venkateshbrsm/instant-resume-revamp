import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  fieldType?: 'text' | 'email' | 'phone';
  maxLength?: number;
}

export function EditableText({
  value,
  onChange,
  isEditing,
  multiline = false,
  className,
  placeholder,
  fieldType = 'text',
  maxLength
}: EditableTextProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleBlur = () => {
    onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      (e.target as HTMLElement).blur();
    }
  };

  if (!isEditing) {
    return (
      <span className={cn(
        "transition-colors duration-200",
        isEditing && "ring-2 ring-primary/20 bg-background/50 rounded px-1",
        className
      )}>
        {value || placeholder}
      </span>
    );
  }

  const inputProps = {
    ref: inputRef as any,
    value: localValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocalValue(e.target.value),
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    placeholder,
    maxLength,
    className: cn(
      "border-primary/30 bg-background/80 backdrop-blur-sm",
      "focus:ring-primary/50 focus:border-primary/50",
      "text-inherit font-inherit leading-inherit",
      multiline ? "min-h-[2em] resize-none" : "h-auto",
      className
    )
  };

  if (multiline) {
    return (
      <Textarea
        {...inputProps}
        rows={Math.max(2, Math.ceil(localValue.split('\n').length))}
      />
    );
  }

  return (
    <Input
      {...inputProps}
      type={fieldType}
    />
  );
}