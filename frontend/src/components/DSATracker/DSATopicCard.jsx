const DSATopicCard = ({ node, onClick, isDraggable = false }) => {
  const progress = node.progress || 0;
  const isDue = node.isDue || false;

  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-3 md:p-4 w-[180px] hover:shadow-lg transition-all ${
        isDue ? 'ring-2 ring-red-500' : ''
      } ${isDraggable ? 'cursor-move' : 'cursor-pointer'}`}
    >
      <h3 className="text-white font-bold text-xs md:text-sm mb-2 break-words">{node.name}</h3>
      
      {/* Progress Bar */}
      <div className="w-full bg-blue-700 dark:bg-blue-800 rounded-full h-1.5 md:h-2 mb-2">
        <div
          className="bg-white h-1.5 md:h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Stats */}
      <div className="flex justify-between text-xs text-white/80">
        <span className="text-[10px] md:text-xs">{node.solvedCount || 0}/{node.problemCount || 0}</span>
        <span className="text-[10px] md:text-xs">{progress}%</span>
      </div>

      {/* Due Badge */}
      {isDue && (
        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
          Due
        </div>
      )}
    </div>
  );
};

export default DSATopicCard;

