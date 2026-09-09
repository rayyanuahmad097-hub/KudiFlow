"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortToggle = void 0;
const react_1 = __importDefault(require("react"));
const SortToggle = ({ currentSort, onSortChange, disabled = false }) => {
    const sortOptions = [
        {
            value: 'recommended',
            label: 'Recommended',
            icon: '⭐',
            description: 'Best overall routes'
        },
        {
            value: 'fee',
            label: 'Lowest Fee',
            icon: '💰',
            description: 'Cheapest routes first'
        },
        {
            value: 'speed',
            label: 'Fastest',
            icon: '⚡',
            description: 'Quickest routes first'
        },
        {
            value: 'reliability',
            label: 'Most Reliable',
            icon: '🛡️',
            description: 'Highest success rate'
        }
    ];
    return (<div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
      {sortOptions.map((option) => (<button key={option.value} onClick={() => onSortChange(option.value)} disabled={disabled} className={`
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
            transition-all duration-200 ease-in-out
            ${currentSort === option.value
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}
            ${disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'}
          `} title={option.description}>
          <span className="text-lg">{option.icon}</span>
          <span className="hidden sm:inline">{option.label}</span>
          <span className="sm:hidden text-xs">{option.label.split(' ')[0]}</span>
        </button>))}
    </div>);
};
exports.SortToggle = SortToggle;
//# sourceMappingURL=SortToggle.js.map