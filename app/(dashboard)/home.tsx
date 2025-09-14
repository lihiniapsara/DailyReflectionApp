import React from 'react';
import { Heart, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';

interface WelcomeToReflectionAppProps {
  onStartReflecting?: () => void;
}

const Home: React.FC<WelcomeToReflectionAppProps> = ({ onStartReflecting }) => {
  
  const handleStartReflecting = () => {
    onStartReflecting?.();
  };

  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Capture your thoughts",
      description: "Write down your daily reflections and feelings"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Track your mood",
      description: "Monitor your emotional well-being over time"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Discover insights",
      description: "Learn patterns about your daily life and growth"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-teal-600 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 text-center text-white">
        {/* App Icon/Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <div className="w-16 h-1 bg-white bg-opacity-30 rounded-full mx-auto"></div>
        </div>

        {/* Title and Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Welcome to Reflection App</h1>
          <h2 className="text-xl font-semibold text-teal-100 mb-4">Your Personal Reflection Space</h2>
          <p className="text-teal-100 text-lg leading-relaxed max-w-sm mx-auto">
            Capture your thoughts, track your mood, and discover insights about your daily life
          </p>
        </div>

        {/* Features */}
        <div className="mb-12 space-y-4 w-full max-w-sm">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 text-left">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-teal-100">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-6">
        <button
          onClick={handleStartReflecting}
          className="w-full bg-white text-teal-600 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Start Reflecting</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="text-center text-teal-100 text-sm mt-4">
          Begin your journey to better self-awareness
        </p>
      </div>
    </div>
  );
};

export default Home;