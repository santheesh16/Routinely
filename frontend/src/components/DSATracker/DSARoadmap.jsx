import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import DSATopicForm from './DSATopicForm';
import DSATopicDetail from './DSATopicDetail';
import DSARoadmapFlowchart from './DSARoadmapFlowchart';

const DSARoadmap = ({ onUpdate }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicForm, setShowTopicForm] = useState(false);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const [roadmapRes, topicsRes] = await Promise.all([
        api.get('/dsa/topics/roadmap'),
        api.get('/dsa/topics'),
      ]);
      setRoadmap(roadmapRes.data);
      setTopics(topicsRes.data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleTopicUpdate = () => {
    fetchRoadmap();
    if (onUpdate) onUpdate();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Default roadmap structure based on NeetCode 150
  const defaultRoadmap = {
    nodes: [
      { id: 'arrays-hashing', name: 'Arrays & Hashing', level: 0 },
      { id: 'two-pointers', name: 'Two Pointers', level: 1, parent: 'arrays-hashing' },
      { id: 'stack', name: 'Stack', level: 1, parent: 'arrays-hashing' },
      { id: 'binary-search', name: 'Binary Search', level: 2, parent: 'two-pointers' },
      { id: 'sliding-window', name: 'Sliding Window', level: 2, parent: 'two-pointers' },
      { id: 'linked-list', name: 'Linked List', level: 2, parent: 'stack' },
      { id: 'trees', name: 'Trees', level: 3, parents: ['binary-search', 'sliding-window', 'linked-list'] },
      { id: 'tries', name: 'Tries', level: 4, parent: 'trees' },
      { id: 'heap', name: 'Heap / Priority Queue', level: 4, parent: 'trees' },
      { id: 'backtracking', name: 'Backtracking', level: 4, parent: 'trees' },
      { id: 'intervals', name: 'Intervals', level: 5, parent: 'heap' },
      { id: 'greedy', name: 'Greedy', level: 5, parent: 'heap' },
      { id: 'advanced-graphs', name: 'Advanced Graphs', level: 5, parent: 'heap' },
      { id: 'graphs', name: 'Graphs', level: 5, parent: 'backtracking' },
      { id: '1d-dp', name: '1-D DP', level: 5, parent: 'backtracking' },
      { id: '2d-dp', name: '2-D DP', level: 6, parent: 'graphs' },
      { id: 'bit-manipulation', name: 'Bit Manipulation', level: 6, parent: '1d-dp' },
      { id: 'math-geometry', name: 'Math & Geometry', level: 7, parents: ['2d-dp', 'bit-manipulation'] },
    ],
  };

  // Merge user topics with default structure
  const mergedNodes = defaultRoadmap.nodes.map((node) => {
    const userTopic = topics.find((t) => 
      t.topicName.toLowerCase().replace(/\s+/g, '-') === node.id ||
      t.topicName.toLowerCase().includes(node.name.toLowerCase())
    );
    return {
      ...node,
      ...(userTopic && {
        progress: userTopic.progress,
        problemCount: userTopic.problems.length,
        solvedCount: userTopic.problems.filter((p) => p.solved).length,
        isDue: userTopic.nextReviewDate <= new Date(),
        topicId: userTopic._id,
      }),
    };
  });

  // Group nodes by level for layout
  const nodesByLevel = {};
  mergedNodes.forEach((node) => {
    if (!nodesByLevel[node.level]) {
      nodesByLevel[node.level] = [];
    }
    nodesByLevel[node.level].push(node);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DSA Roadmap</h2>
        <button
          onClick={() => setShowTopicForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          + Add Topic
        </button>
      </div>

      {/* Roadmap Visualization with Flowchart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 overflow-hidden">
        <div className="relative" style={{ minHeight: '700px', height: '700px' }}>
          <DSARoadmapFlowchart
            nodes={mergedNodes}
            onNodeClick={(node) => {
              if (node.topicId) {
                setSelectedTopic(topics.find((t) => t._id === node.topicId));
              } else {
                // Create new topic with default name
                const newTopic = {
                  topicName: node.name,
                  parentTopics: node.parent ? [node.parent] : node.parents || [],
                  childTopics: [],
                  problems: [],
                };
                setSelectedTopic(newTopic);
                setShowTopicForm(true);
              }
            }}
          />
        </div>
      </div>

      {/* Topic Form Modal */}
      {showTopicForm && (
        <DSATopicForm
          topic={selectedTopic}
          onClose={() => {
            setShowTopicForm(false);
            setSelectedTopic(null);
          }}
          onSuccess={handleTopicUpdate}
        />
      )}

      {/* Topic Detail Modal */}
      {selectedTopic && !showTopicForm && (
        <DSATopicDetail
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onUpdate={handleTopicUpdate}
        />
      )}
    </div>
  );
};

export default DSARoadmap;

