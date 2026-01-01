import { FireIcon } from './Icons';

const StreakIcon = ({ streak }) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-sm font-semibold shadow-sm">
      <FireIcon className="w-3 h-3" />
      <span>{streak}</span>
    </div>
  );
};

export default StreakIcon;

