// Utility function for conditional class names
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Common dark mode class combinations
export const darkModeClasses = {
  // Backgrounds
  card: 'bg-white dark:bg-gray-800',
  cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  
  // Text colors
  heading: 'text-gray-900 dark:text-white',
  body: 'text-gray-700 dark:text-gray-300',
  muted: 'text-gray-600 dark:text-gray-400',
  subtle: 'text-gray-500 dark:text-gray-400',
  
  // Borders
  border: 'border-gray-200 dark:border-gray-700',
  borderInput: 'border-gray-300 dark:border-gray-600',
  
  // Inputs
  input: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600',
  select: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600',
  
  // Buttons
  buttonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white',
  buttonSecondary: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
};

// Helper to apply dark mode classes to common patterns
export const applyDarkMode = {
  card: (additional = '') => `${darkModeClasses.card} ${additional}`,
  text: (type = 'body', additional = '') => `${darkModeClasses[type]} ${additional}`,
  input: (additional = '') => `${darkModeClasses.input} ${additional}`,
  button: (type = 'primary', additional = '') => `${darkModeClasses[`button${type.charAt(0).toUpperCase() + type.slice(1)}`]} ${additional}`,
};

