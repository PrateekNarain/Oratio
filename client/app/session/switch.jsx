import { Video, Mic } from "lucide-react";

const ToggleSwitch = ({ isVideoEnabled, setIsVideoEnabled }) => {
  return (
    <div className="flex items-center gap-2">
      <Mic size={16} className={`transition-colors ${!isVideoEnabled ? 'text-amber-400' : 'text-white/30'}`} />
      <button
        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
        className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
        style={{ background: isVideoEnabled ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'rgba(255,255,255,0.15)' }}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
            isVideoEnabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
      <Video size={16} className={`transition-colors ${isVideoEnabled ? 'text-amber-400' : 'text-white/30'}`} />
      <span className="text-white/60 text-xs font-medium ml-1">{isVideoEnabled ? 'Video' : 'Audio'}</span>
    </div>
  );
};

export default ToggleSwitch;