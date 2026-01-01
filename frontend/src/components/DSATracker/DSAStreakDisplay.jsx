import { FireIcon } from '../Shared/Icons';

const DSAStreakDisplay = ({ streak }) => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-8 text-white">
      <div className="text-center">
        <p className="text-lg font-medium mb-2">Current DSA Streak</p>
        <p className="text-6xl font-bold">{streak}</p>
        <p className="text-xl mt-2 flex items-center gap-1">days in a row <FireIcon className="w-5 h-5" /></p>
      </div>
    </div>
  );
};

export default DSAStreakDisplay;
