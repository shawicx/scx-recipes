import React from "react";

export interface MapLoadingSpinnerProps {
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 加载文本 */
  text?: string;
  /** 大小 */
  size?: "small" | "default" | "large";
}

/**
 * 地图加载动画组件
 *
 * 功能特性：
 * - 友好的加载提示
 * - 地图主题的动画效果
 * - 可配置大小和文本
 */
const MapLoadingSpinner: React.FC<MapLoadingSpinnerProps> = ({
  style = {},
  text = "地图加载中...",
  size = "default",
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return {
          spinnerSize: "24px",
          fontSize: "12px",
          gap: "8px",
        };
      case "large":
        return {
          spinnerSize: "40px",
          fontSize: "16px",
          gap: "16px",
        };
      default:
        return {
          spinnerSize: "32px",
          fontSize: "14px",
          gap: "12px",
        };
    }
  };

  const { spinnerSize, fontSize, gap } = getSizeConfig();

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        gap,
        ...style,
      }}
    >
      {/* 地图加载动画 */}
      <div
        className="relative"
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
      >
        {/* 外圈 - 代表地图边界 */}
        <div
          className="absolute inset-0 border-2 border-blue-200 rounded-full"
          style={{
            animation: "mapSpin 2s linear infinite",
          }}
        />

        {/* 中圈 - 代表地图区域 */}
        <div
          className="absolute inset-1 border-2 border-blue-400 border-t-transparent rounded-full"
          style={{
            animation: "mapSpin 1.5s linear infinite reverse",
          }}
        />

        {/* 内核 - 代表当前位置 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full"
            style={{
              animation: "mapPulse 1s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* 加载文本 */}
      {text && (
        <div
          className="text-gray-600 font-medium"
          style={{
            fontSize,
          }}
        >
          {text}
        </div>
      )}

      {/* 动画样式 */}
      <style>{`
        @keyframes mapSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes mapPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default MapLoadingSpinner;
export { MapLoadingSpinner };
