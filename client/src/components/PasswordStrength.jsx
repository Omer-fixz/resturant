import React from 'react';

const PasswordStrength = ({ password }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score < 2) return { strength: 1, text: 'ضعيفة جداً', color: 'bg-red-500' };
    if (score < 3) return { strength: 2, text: 'ضعيفة', color: 'bg-orange-500' };
    if (score < 4) return { strength: 3, text: 'متوسطة', color: 'bg-yellow-500' };
    if (score < 5) return { strength: 4, text: 'قوية', color: 'bg-blue-500' };
    return { strength: 5, text: 'قوية جداً', color: 'bg-green-500' };
  };

  const { strength, text, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-600">قوة كلمة المرور:</span>
        <span className={`text-xs font-medium ${
          strength === 1 ? 'text-red-600' :
          strength === 2 ? 'text-orange-600' :
          strength === 3 ? 'text-yellow-600' :
          strength === 4 ? 'text-blue-600' : 'text-green-600'
        }`}>
          {text}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrength;