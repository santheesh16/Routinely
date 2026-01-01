import { 
  HiXMark, 
  HiPencil, 
  HiTrash, 
  HiClipboard, 
  HiLink, 
  HiClock,
  HiCheck,
  HiComputerDesktop,
  HiHome,
  HiCurrencyDollar,
  HiBookOpen,
  HiFire,
  HiGlobeAlt,
  HiBolt,
  HiStar,
  HiSparkles
} from 'react-icons/hi2';

// Classic icon components
export const CloseIcon = ({ className = "w-5 h-5" }) => <HiXMark className={className} />;
export const EditIcon = ({ className = "w-5 h-5" }) => <HiPencil className={className} />;
export const DeleteIcon = ({ className = "w-5 h-5" }) => <HiTrash className={className} />;
export const ClipboardIcon = ({ className = "w-5 h-5" }) => <HiClipboard className={className} />;
export const LinkIcon = ({ className = "w-4 h-4" }) => <HiLink className={className} />;
export const LoadingIcon = ({ className = "w-5 h-5 animate-spin" }) => <HiClock className={className} />;
export const CheckIcon = ({ className = "w-5 h-5" }) => <HiCheck className={className} />;
export const CodeIcon = ({ className = "w-5 h-5" }) => <HiComputerDesktop className={className} />;
export const HomeIcon = ({ className = "w-5 h-5" }) => <HiHome className={className} />;
export const MoneyIcon = ({ className = "w-5 h-5" }) => <HiCurrencyDollar className={className} />;
export const BookIcon = ({ className = "w-5 h-5" }) => <HiBookOpen className={className} />;
export const FireIcon = ({ className = "w-5 h-5" }) => <HiFire className={className} />;
export const GlobeIcon = ({ className = "w-5 h-5" }) => <HiGlobeAlt className={className} />;
export const BoltIcon = ({ className = "w-5 h-5" }) => <HiBolt className={className} />;
export const StarIcon = ({ className = "w-5 h-5" }) => <HiStar className={className} />;
export const SystemIcon = ({ className = "w-5 h-5" }) => <HiSparkles className={className} />;

