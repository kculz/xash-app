// src/components/ui/Card.jsx
export const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`card p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};