const gradients = {
  primary: 'from-cyan-400 to-purple-500',
  accent: 'from-amber-400 to-red-500',
  emergency: 'from-red-400 to-red-600',
  success: 'from-emerald-400 to-cyan-500',
};

const GradientText = ({
  children,
  gradient = 'primary',
  animate = false,
  as: Tag = 'span',
  className = '',
}) => {
  const gradientClass = gradients[gradient] || gradients.primary;

  return (
    <Tag
      className={`
        bg-gradient-to-r ${gradientClass}
        bg-clip-text text-transparent
        ${animate ? 'animate-gradient bg-[length:200%_200%]' : ''}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
};

export default GradientText;
