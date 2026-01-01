import { useSettings } from '../context/SettingsContext';

const Settings = () => {
  const { settings, updateSettings } = useSettings();

  const handleThemeChange = (theme) => {
    updateSettings({ theme });
  };

  const handleFontSizeChange = (fontSize) => {
    updateSettings({ fontSize });
  };

  const handleWidgetToggle = (widget) => {
    updateSettings({
      enabledWidgets: {
        ...settings.enabledWidgets,
        [widget]: !settings.enabledWidgets[widget],
      },
    });
  };

  const handleMotivationToggle = () => {
    updateSettings({ showMotivation: !settings.showMotivation });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-md border-2 transition-colors ${
                  settings.theme === 'light'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-md border-2 transition-colors ${
                  settings.theme === 'dark'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Font Size Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Font Size</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Size
            </label>
            <div className="flex gap-4 flex-wrap">
              {['small', 'medium', 'large', 'extra-large'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`px-4 py-2 rounded-md border-2 transition-colors capitalize ${
                    settings.fontSize === size
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {size.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Home Widgets Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Home Widgets</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Streaks Widget
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show streak cards on home page
              </p>
            </div>
            <button
              onClick={() => handleWidgetToggle('streaks')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabledWidgets.streaks
                  ? 'bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabledWidgets.streaks ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Budget Widget
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show budget summary on home page
              </p>
            </div>
            <button
              onClick={() => handleWidgetToggle('budget')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabledWidgets.budget
                  ? 'bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabledWidgets.budget ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Recent Activity Widget
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show recent activities on home page
              </p>
            </div>
            <button
              onClick={() => handleWidgetToggle('recentActivity')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabledWidgets.recentActivity
                  ? 'bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabledWidgets.recentActivity ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Motivation Widget
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show daily motivation quotes
              </p>
            </div>
            <button
              onClick={() => handleWidgetToggle('motivation')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabledWidgets.motivation
                  ? 'bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabledWidgets.motivation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Motivation Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Motivation</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Show Daily Motivation
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Display inspirational quotes on the home page
            </p>
          </div>
          <button
            onClick={handleMotivationToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.showMotivation
                ? 'bg-primary-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showMotivation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
