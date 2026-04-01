// src/Components/QuantityInput.jsx
import { useState, useRef, useEffect } from 'react';

const QuantityInput = ({ quantity, onChange, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(quantity);
  const inputRef = useRef(null);

  const handleClick = () => {
    setIsEditing(true);
    setInputValue(quantity);
  };

  const handleBlur = () => {
    const newQty = Math.max(1, parseInt(inputValue) || 1);
    setInputValue(newQty);
    onChange(newQty);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      handleBlur();
    }
  };

  useEffect(() => {
    setInputValue(quantity);
  }, [quantity]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className={className}>
      {isEditing ? (
        <input
  ref={inputRef}
  type="text"  // ← CAMBIO: text NO number (sin flechas)
  inputMode="numeric"  // ← Teclado numérico móvil
  pattern="[0-9]*"  // ← Solo números
  value={inputValue}
  onChange={(e) => {
    // ← Solo permite números
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(value || '');
  }}
  onBlur={handleBlur}
  onKeyDown={handleKeyDown}
  className="w-full h-full text-center text-lg sm:text-xl font-bold bg-white/50 rounded-lg border-1 border-transparent focus:border-[var(--primario)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--primario)]/30 transition-all text-inherit font-bold"
/>
      ) : (
        <button
          onClick={handleClick}
          className="w-full h-full flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors"
          type="button"
          tabIndex={0}
        >
          <span>{quantity}</span>
        </button>
      )}
    </div>
  );
};

export default QuantityInput;