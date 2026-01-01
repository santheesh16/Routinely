import { useSettings } from '../../context/SettingsContext';
import { CloseIcon } from '../Shared/Icons';

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Appearance Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Appearance</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                  settings.theme === 'light'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                  settings.theme === 'dark'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Font Size Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Font Size</h3>
            <div className="flex gap-4 flex-wrap">
              {['small', 'medium', 'large', 'extra-large'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors capitalize ${
                    settings.fontSize === size
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {size.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Home Widgets Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Home Widgets</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Streaks Widget</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show streak cards on home page</p>
                </div>
                <button
                  onClick={() => handleWidgetToggle('streaks')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabledWidgets.streaks ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabledWidgets.streaks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Budget Widget</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show budget summary on home page</p>
                </div>
                <button
                  onClick={() => handleWidgetToggle('budget')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabledWidgets.budget ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabledWidgets.budget ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Recent Activity Widget</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show recent activities on home page</p>
                </div>
                <button
                  onClick={() => handleWidgetToggle('recentActivity')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabledWidgets.recentActivity ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabledWidgets.recentActivity ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Motivation Widget</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show daily motivation quotes</p>
                </div>
                <button
                  onClick={() => handleWidgetToggle('motivation')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabledWidgets.motivation ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
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
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Show Daily Motivation</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Display inspirational quotes on the home page</p>
            </div>
            <button
              onClick={handleMotivationToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showMotivation ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
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
    </div>
  );
};

export default SettingsModal;
